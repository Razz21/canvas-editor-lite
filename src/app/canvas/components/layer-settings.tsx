"use client;";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Circle, Rect, Textbox } from "fabric";
import { ChangeEvent, ComponentProps, ComponentType, ReactNode, useEffect, useState } from "react";
import { useCanvasStore } from "../stores/canvas-store";
import { ElementObject, useElementsStore } from "../stores/elements-store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  AArrowUpIcon,
  AlignCenterHorizontalIcon,
  AlignCenterIcon,
  AlignCenterVerticalIcon,
  AlignEndHorizontalIcon,
  AlignEndVerticalIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignStartHorizontalIcon,
  AlignStartVerticalIcon,
  BlendIcon,
  BoldIcon,
  ChevronsUpDown,
  ItalicIcon,
  RotateCcwIcon,
  SpaceIcon,
  UnderlineIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonGroup, ButtonGroupItem } from "@/components/button-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { ScrollArea } from "@/components/ui/scroll-area";

export type LayerSettingsProps = {};
type ShapeProps = ElementObject & Circle & Rect & Textbox;

const initProperties = {
  // Common
  width: 0,
  height: 0,
  angle: 0,
  fill: "#000000",
  opacity: 0,
  left: 0,
  top: 0,
} satisfies Partial<ShapeProps>;

type AlignDirection = "left" | "right" | "top" | "bottom" | "horizontal" | "vertical";

const LAYER_ITEM_ICON_MAP = {
  left: AlignStartVerticalIcon,
  horizontal: AlignCenterVerticalIcon,
  right: AlignEndVerticalIcon,
  top: AlignStartHorizontalIcon,
  vertical: AlignCenterHorizontalIcon,
  bottom: AlignEndHorizontalIcon,
} satisfies Record<Lowercase<AlignDirection>, ComponentType<React.SVGProps<SVGSVGElement>>>;

function LayerSettings({}: LayerSettingsProps) {
  const canvas = useCanvasStore((state) => state.canvas);
  const selectedObject = useElementsStore((state) => state.getSelected());

  const { setSelectedId } = useElementsStore(
    useShallow((state) => ({
      selectedObject: state.getSelected(),
      setSelectedId: state.setSelectedId,
    }))
  );

  const [properties, setProperties] = useState<Partial<ShapeProps>>({
    ...initProperties,
  });

  useEffect(() => {
    if (canvas) {
      canvas.on("selection:created", (event) => {
        console.log("selection created", event);
        handleObjectSelection(event);
      });
      canvas.on("selection:updated", (event) => {
        console.log("selection updated", event);
        handleObjectSelection(event);
      });
      canvas.on("selection:cleared", (event) => {
        console.log("selection cleared", event);
        setSelectedId(null);
      });

      canvas.on("object:modified", (event) => {
        handleObjectSelection(event);
      });
      canvas.on("object:rotating", (event) => {
        handleObjectSelection(event);
      });
      canvas.on("object:scaling", (event) => {
        handleObjectSelection(event);
      });
    }
    return () => {
      // TODO: remove listeners
    };
  }, [canvas]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleObjectSelection = (event: any) => {
    const object = event.target || event.selected?.[0];

    setSelectedId(object?.id ?? null);

    console.log("handleObjectSelection", event);

    if (!object) return;

    setProperties({
      ...object,
      width: Math.round(object.width * object.scaleX),
      height: Math.round(object.height * object.scaleY),
      opacity: parseFloat(object.opacity.toFixed(2)),
      left: Math.round(object.left),
      top: Math.round(object.top),
      angle: Math.round(object.angle),
    });
  };

  const handlePropertyChange = (property: typeof properties) => {
    setProperties((prev) => ({ ...prev, ...property }));

    if (selectedObject) {
      selectedObject.set(property).setCoords();
      canvas?.renderAll();
    }
  };

  const handleValueChange = (property: keyof typeof properties) => (value: unknown) => {
    handlePropertyChange({ [property]: value });
  };

  const handleEventChangeNumeric =
    (property: keyof typeof properties) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = +event.target.value.trim();

      if (isNaN(value)) return;

      handlePropertyChange({ [property]: value });
    };

  const handleEventChange =
    (property: keyof typeof properties) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();

      handlePropertyChange({ [property]: value || 0 });
    };

  const handleEventChangeAngle = (event: ChangeEvent<HTMLInputElement>) => {
    const value = +event.target.value.trim() % 360;

    setProperties((prev) => ({ ...prev, angle: value }));

    if (selectedObject) {
      selectedObject.rotate(value);
      selectedObject.setCoords();
      canvas?.requestRenderAll();
    }
  };

  const alignObject = (object: ElementObject | null) => (direction: AlignDirection) => {
    if (!object || !canvas) return;

    const properties = {} as { left?: number; top?: number };

    switch (direction) {
      case "left":
        properties.left = 0;
        break;
      case "right":
        properties.left = canvas.width - object.width * object.scaleX;
        break;
      case "top":
        properties.top = 0;
        break;
      case "bottom":
        properties.top = canvas.height - object.height * object.scaleY;
        break;
      case "horizontal":
        properties.left = (canvas.width - object.width * object.scaleX) / 2;
        break;
      case "vertical":
        properties.top = (canvas.height - object.height * object.scaleY) / 2;
        break;

      default:
        break;
    }
    object.set(properties).setCoords();
    canvas.renderAll();
  };
  console.log("selectedObject", selectedObject);

  return (
    <ScrollArea className="h-[50vh] w-64">
      <div className="flex flex-col gap-2 p-2 text-sm">
        <div className="flex gap-1 flex-wrap">
          {Object.entries(LAYER_ITEM_ICON_MAP).map(([key, Icon]) => (
            <Button
              key={key}
              onClick={() => alignObject(selectedObject)(key as AlignDirection)}
              size="icon"
              className="w-8 h-8"
              variant="outline"
            >
              <Icon />
            </Button>
          ))}
        </div>

        <Separator className="my-1" />

        <div className="grid grid-cols-2 gap-4">
          <InputItem
            label="X"
            type="number"
            min={0}
            step={1}
            value={properties.left}
            onChange={handleEventChangeNumeric("left")}
          />
          <InputItem
            label="Y"
            type="number"
            min={0}
            step={1}
            value={properties.top}
            onChange={handleEventChangeNumeric("top")}
          />
          <InputItem
            label="W"
            type="number"
            min={0}
            step={1}
            value={properties.width}
            onChange={handleEventChangeNumeric("width")}
          />
          <InputItem
            label="H"
            type="number"
            min={0}
            step={1}
            value={properties.height}
            onChange={handleEventChangeNumeric("height")}
          />
          <InputItem
            label={<RotateCcwIcon size="12" />}
            type="number"
            min={0}
            max={360}
            step={1}
            value={properties.angle}
            onChange={handleEventChangeAngle}
          />
          <InputItem
            label={<BlendIcon size="12" />}
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={properties.opacity}
            onChange={handleEventChangeNumeric("opacity")}
          />
        </div>
        <Separator className="my-1" />
        <div className="space-y-2">
          <span>Fill</span>
          <ColorInputItem
            value={properties.fill?.toString()}
            onChange={handleEventChange("fill")}
          />
        </div>
        <Separator className="my-1" />

        <Collapsible className="space-y-4" defaultOpen>
          <CollapsibleTrigger className="flex justify-between items-center text-sm w-full">
            <span>Stroke</span>
            <ChevronsUpDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <ColorInputItem
                  value={properties.stroke?.toString()}
                  onChange={handleEventChange("stroke")}
                />
                <InputItem
                  label="W"
                  type="number"
                  min={0}
                  step={1}
                  value={properties.strokeWidth}
                  onChange={handleEventChangeNumeric("strokeWidth")}
                />
              </div>
              <div className="space-y-1">
                <span>Line Cap</span>

                <ButtonGroup
                  className="gap-1"
                  variant="outline"
                  size="sm"
                  value={properties.strokeLineCap}
                  onValueChange={handleValueChange("strokeLineCap")}
                >
                  {["butt", "round", "square"].map((value) => (
                    <ButtonGroupItem value={value} key={value}>
                      {value}
                    </ButtonGroupItem>
                  ))}
                </ButtonGroup>
              </div>
              <div className="space-y-1">
                <span>Line Join</span>
                <ButtonGroup
                  className="gap-1"
                  variant="outline"
                  size="sm"
                  value={properties.strokeLineCap}
                  onValueChange={handleValueChange("strokeLineCap")}
                >
                  {["bevel", "miter", "round"].map((value) => (
                    <ButtonGroupItem value={value} key={value}>
                      {value}
                    </ButtonGroupItem>
                  ))}
                </ButtonGroup>
              </div>
              <div className="space-y-1">
                <span>Dash Array</span>

                <ButtonGroup
                  className="gap-1"
                  variant="outline"
                  size="sm"
                  value={properties.strokeDashArray?.join(" ") ?? "0"}
                  onValueChange={(value) =>
                    handleValueChange("strokeDashArray")(value.split(" ").map(Number))
                  }
                >
                  {["0", "10 5", "2 5", "10 5 2 5"].map((value) => (
                    <ButtonGroupItem value={value} key={value}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M0 12 H50" strokeDasharray={value} fill="none" />
                      </svg>
                    </ButtonGroupItem>
                  ))}
                </ButtonGroup>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="my-1" />
        {properties.fontFamily && (
          <div className="space-y-2">
            <span>Text</span>
            <div className="grid grid-cols-2 gap-4">
              <InputItem
                label={<AArrowUpIcon size="16" />}
                type="number"
                min={0}
                step={1}
                value={properties.fontSize}
                onChange={handleEventChangeNumeric("fontSize")}
              />

              <InputItem
                label={<SpaceIcon size="12" />}
                type="number"
                min={0}
                step={1}
                value={properties.charSpacing}
                onChange={handleEventChangeNumeric("charSpacing")}
              />
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={properties.textAlign}
              onValueChange={handleValueChange("textAlign")}
              className="justify-start gap-1"
            >
              <ToggleGroupItem value="left">
                <AlignLeftIcon size="12" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center">
                <AlignCenterIcon size="12" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right">
                <AlignRightIcon size="12" />
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex gap-1">
              <Toggle
                pressed={properties.fontWeight === "bold"}
                onPressedChange={(value) => {
                  handleValueChange("fontWeight")(value ? "bold" : "normal");
                }}
                size="sm"
                variant="outline"
              >
                <BoldIcon size="12" />
              </Toggle>
              <Toggle
                pressed={properties.fontStyle === "italic"}
                onPressedChange={(value) =>
                  handleValueChange("fontStyle")(value ? "italic" : "normal")
                }
                size="sm"
                variant="outline"
              >
                <ItalicIcon size="12" />
              </Toggle>
              <Toggle
                pressed={properties.underline}
                onPressedChange={handleValueChange("underline")}
                size="sm"
                variant="outline"
              >
                <UnderlineIcon size="12" />
              </Toggle>
            </div>
            <Select value={properties.fontFamily} onValueChange={handleValueChange("fontFamily")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Font Family" />
              </SelectTrigger>
              <SelectContent>
                {["Arial", "Times New Roman", "Courier New", "monospace"].map((value) => (
                  <SelectItem value={value} key={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Separator className="my-1" />
      </div>
    </ScrollArea>
  );
}

export default LayerSettings;

function ColorInputItem({
  className = "",
  value = "",
  onChange,
  ...rest
}: ComponentProps<"input">) {
  return (
    <Label className={`grid grid-cols-[2rem_1fr] items-center ${className}`}>
      <input
        {...rest}
        type="color"
        className="block h-full w-6 rounded-sm border border-primary"
        value={value}
        onChange={onChange}
      />
      <Input onChange={onChange} value={value} variant="secondary" customSize="sm" />
    </Label>
  );
}

function InputItem({
  className = "",
  label,
  ...rest
}: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <Label className={`grid grid-cols-[2rem_1fr] items-center ${className}`}>
      <span>{label}</span>
      <Input {...rest} variant="secondary" customSize="sm" />
    </Label>
  );
}
