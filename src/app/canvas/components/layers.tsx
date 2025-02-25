"use client;";

import { Button } from "@/components/ui/button";
import { FabricObject } from "fabric";
import { ComponentProps, ComponentType, useCallback, useEffect, useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  TrashIcon,
  LockIcon,
  LockOpenIcon,
  EyeOffIcon,
  CircleIcon,
  TypeIcon,
  SquareIcon,
  SlashIcon,
  CircleHelpIcon,
  SplineIcon,
} from "lucide-react";
import { isGuidelineObject } from "../utils/snap";
import { ShapeType, useCanvasStore } from "../stores/canvas-store";
import { useElementsStore } from "../stores/elements-store";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";
import { clamp } from "../utils/numbers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";

export type LayerProps = {};

function Layers({}: LayerProps) {
  const canvas = useCanvasStore((state) => state.canvas);

  const { elements, setElements } = useElementsStore(
    useShallow((state) => ({
      elements: state.elements,
      setElements: state.setElements,
    }))
  );

  const [selectedLayers, setSelectedLayers] = useState<FabricObject["id"][]>([]);

  const lockLayer = (element: FabricObject) => {
    if (!element || !canvas) return;

    const object = canvas.getObjectById(element.id);

    if (!object) return;
    const newLocked = !object.locked;

    object.set({
      locked: newLocked,
      lockMovementX: newLocked,
      lockMovementY: newLocked,
      lockRotation: newLocked,
      lockScalingX: newLocked,
      lockScalingY: newLocked,
    });
    // TODO consider another way to update layers without re-rendering by updateLayers()
    canvas.fire("object:modified", { target: object });
  };

  const hideLayer = useCallback(
    (element: FabricObject) => {
      const object = canvas?.getObjectById(element.id);

      if (!object) return;

      object.set({
        visible: !object.visible,
      });
      // <object:modified> event is not triggered when setting "visible" property
      // trigger <object:modified> event manually to update layers
      canvas?.fire("object:modified", { target: object });
    },
    [canvas]
  );

  const removeLayer = useCallback(
    (element: FabricObject) => {
      const object = canvas?.getObjectById(element.id);

      if (!object) return;

      canvas?.remove(object);
      canvas?.requestRenderAll();
    },
    [canvas]
  );

  const moveLayers = (direction: number) => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    const layers = canvas.getActiveObjects();

    // Sort layers based on direction
    layers.sort((a, b) => {
      const indexA = objects.indexOf(a);
      const indexB = objects.indexOf(b);
      return direction > 0 ? indexB - indexA : indexA - indexB;
    });

    layers.forEach((object) => {
      const currentIndex = objects.indexOf(object);
      const newIndex = clamp(currentIndex + direction, 0, objects.length - 1);

      if (currentIndex !== newIndex) {
        canvas.moveObjectTo(object, newIndex);
      }
    });

    canvas.requestRenderAll();
    updateLayers();
  };
  const updateLayers = <UpdateEvent extends { target: FabricObject }>(event?: UpdateEvent) => {
    if (event && isGuidelineObject(event.target)) return;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const filteredObjects = objects.filter((obj) => !isGuidelineObject(obj));

    filteredObjects.forEach((object, index) => {
      object.zIndex = index;
    });

    setElements([...filteredObjects].reverse());
    canvas.requestRenderAll();
  };

  const clearObjectSelected = (e: { deselected: FabricObject[] }) => {
    const newSelectedLayers = selectedLayers.filter(
      (id) => !e.deselected.map((obj) => obj.id).includes(id)
    );

    setSelectedLayers(newSelectedLayers);
  };

  const handleObjectSelected = <
    SelectionEvent extends { selected: FabricObject[]; deselected: FabricObject[] }
  >(
    e: SelectionEvent
  ) => {
    const newSelectedLayers = selectedLayers
      .filter((id) => !e.deselected.map((obj) => obj.id).includes(id))
      .concat(e.selected.map((obj) => obj.id));

    setSelectedLayers(newSelectedLayers);
  };

  const selectLayerInCanvas = (id: FabricObject["id"]) => {
    const object = canvas?.getObjectById(id) ?? null;

    if (object) {
      if (!object.id) {
        console.error("Object with no id found", object);
      }
      setSelectedLayers([object.id]);
      canvas?.setActiveObject(object);
      canvas?.requestRenderAll();
    }
  };

  useEffect(() => {
    if (canvas) {
      // TODO avoid re-rendering when snap guidelines are triggered
      canvas.on("object:added", updateLayers);
      canvas.on("object:removed", updateLayers);
      canvas.on("object:modified", updateLayers);

      canvas.on("selection:created", handleObjectSelected);
      canvas.on("selection:updated", handleObjectSelected);
      canvas.on("selection:cleared", clearObjectSelected);
    }
    return () => {
      canvas?.off("object:added", updateLayers);
      canvas?.off("object:removed", updateLayers);
      canvas?.off("object:modified", updateLayers);

      canvas?.off("selection:created", handleObjectSelected);
      canvas?.off("selection:updated", handleObjectSelected);
      canvas?.off("selection:cleared", clearObjectSelected);
    };
  }, [canvas]);

  return (
    <div className="bg-background rounded shadow-md space-y-2 w-72">
      <div className="flex justify-between items-center p-2">
        <span>Layers</span>
        <span className="flex gap-1">
          <Button
            onClick={() => moveLayers(1)}
            size="icon"
            disabled={!selectedLayers.length}
            className="[&_svg]:size-3 w-8 h-8"
          >
            <ArrowUpIcon />
          </Button>
          <Button
            onClick={() => moveLayers(-1)}
            size="icon"
            disabled={!selectedLayers.length}
            className="[&_svg]:size-3 w-8 h-8"
          >
            <ArrowDownIcon />
          </Button>
        </span>
      </div>
      <Separator />
      <ScrollArea className="h-[40vh] p-2">
        <ul className=" overflow-auto">
          {elements.map((layer) => (
            <LayerItem
              key={layer.id}
              hideLayer={hideLayer}
              lockLayer={lockLayer}
              removeLayer={removeLayer}
              layer={layer}
              selected={selectedLayers.includes(layer.id)}
              onClick={() => {
                selectLayerInCanvas(layer.id);
              }}
            />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

export default Layers;

const LAYER_ITEM_ICON_MAP = {
  circle: CircleIcon,
  textbox: TypeIcon,
  rect: SquareIcon,
  line: SlashIcon,
  path: SplineIcon,
  default: CircleHelpIcon,
} satisfies Partial<
  Record<Lowercase<ShapeType> | "default", ComponentType<React.SVGProps<SVGSVGElement>>>
>;

function getIconForLayer(type: string) {
  return (
    LAYER_ITEM_ICON_MAP[type as keyof typeof LAYER_ITEM_ICON_MAP] || LAYER_ITEM_ICON_MAP.default
  );
}

type LayerItemProps = {
  layer: FabricObject;
  selected: boolean;
  lockLayer: (element: FabricObject) => void;
  hideLayer: (element: FabricObject) => void;
  removeLayer: (element: FabricObject) => void;
} & ComponentProps<"li">;

function LayerItem({
  selected,
  className,
  hideLayer,
  layer,
  lockLayer,
  removeLayer,
  ...rest
}: LayerItemProps) {
  const Icon = getIconForLayer(layer.type);

  return (
    <li
      className={`${
        selected ? "bg-neutral-500/10" : ""
      } p-1 rounded flex justify-between items-center ${className || ""}`}
      {...rest}
    >
      <div className="flex gap-2 items-center capitalize text-sm">
        <span>{<Icon size="16" />}</span>
        <span>{layer.name}</span>
      </div>
      <div className="flex gap-1">
        <Toggle
          onClick={(e) => {
            e.stopPropagation();
            lockLayer(layer);
          }}
          size="sm"
          variant="default"
          pressed={layer.locked === true}
        >
          {layer.locked === true ? <LockIcon /> : <LockOpenIcon />}
        </Toggle>
        <Toggle
          onClick={(e) => {
            e.stopPropagation();
            hideLayer(layer);
          }}
          size="sm"
          variant="default"
          pressed={layer.visible !== true}
        >
          {layer.visible ? <EyeIcon /> : <EyeOffIcon />}
        </Toggle>
        <Toggle
          onClick={(e) => {
            e.stopPropagation();
            removeLayer(layer);
          }}
          size="sm"
          variant="default"
        >
          <TrashIcon />
        </Toggle>
      </div>
    </li>
  );
}
