"use client;";

import { Circle, Ellipse, FabricObject, Group, Rect, Textbox } from "fabric";
import { useEffect, useState } from "react";
import { useCanvasStore } from "../../stores/canvas-store";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import Panel from "../panel";
import * as Controls from "./components/controls";
import TextBoxControls from "./components/textbox-controls";
import EllipseControls from "./components/ellipse-controls";
import CircleControls from "./components/circle-controls";
import StrokeControls from "./components/stroke-controls";
import FillControls from "./components/fill-controls";
import PositionControls from "./components/position-controls";
import { getBoundingBox, isGroupOrSelectionObject } from "../../utils/canvas/common";
import { AlignmentControl } from "./components/alignment-controls";
import { AlignmentDirection } from "../../utils/canvas/constants";

type ShapeProps = FabricObject & Circle & Ellipse & Rect & Textbox & Group;

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

export type LayerSettingsProps = {};

function LayerSettings({}: LayerSettingsProps) {
  const canvas = useCanvasStore((state) => state.canvas);

  const [selectedObject, setSelectedObject] = useState<FabricObject | Group | null>(null);

  const [properties, setProperties] = useState<Partial<ShapeProps>>({
    ...initProperties,
  });

  useEffect(() => {
    if (canvas) {
      canvas.on("selection:created", (event) => {
        // console.log("selection created", event);
        handleObjectSelection(event.selected[0]);
      });
      canvas.on("selection:updated", (event) => {
        // console.log("selection updated", event);
        handleObjectSelection(event.selected[0]);
      });
      canvas.on("selection:cleared", (event) => {
        // console.log("selection cleared", event);
        setSelectedObject(null);
      });

      canvas.on("object:modified", (event) => {
        handleObjectSelection(event.target);
      });
      canvas.on("object:rotating", (event) => {
        handleObjectSelection(event.target);
      });
      canvas.on("object:scaling", (event) => {
        handleObjectSelection(event.target);
      });
    }
    return () => {
      // TODO: remove listeners
    };
  }, [canvas]);

  const handleObjectSelection = (object?: FabricObject) => {
    // const object = canvas?.getActiveObject();

    setSelectedObject(object ?? null);

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

  const handleValueChange = (property: keyof typeof properties) => (value: unknown) => {
    setProperties((prev) => ({ ...prev, [property]: value }));

    if (!selectedObject || !canvas) return;

    if (isGroupOrSelectionObject(selectedObject)) {
      selectedObject.getObjects().forEach((object) => object.set(property).setCoords());
    } else {
      selectedObject.set(property).setCoords();
    }
    canvas.requestRenderAll();
  };

  const handleAngleChange = (input: number) => {
    const value = input % 360;

    setProperties((prev) => ({ ...prev, angle: value }));

    if (selectedObject) {
      // This is required to rotate object on it's central rotation
      selectedObject.rotate(value);
      selectedObject.setCoords();
      canvas?.requestRenderAll();
    }
  };

  const alignObject = (direction: AlignmentDirection) => {
    if (!selectedObject || !canvas) return;

    const properties = {} as { left?: number; top?: number };

    switch (direction) {
      case "left":
        properties.left = 0;
        break;
      case "right":
        properties.left = canvas.width - selectedObject.width * selectedObject.scaleX;
        break;
      case "top":
        properties.top = 0;
        break;
      case "bottom":
        properties.top = canvas.height - selectedObject.height * selectedObject.scaleY;
        break;
      case "horizontal":
        properties.left = (canvas.width - selectedObject.width * selectedObject.scaleX) / 2;
        break;
      case "vertical":
        properties.top = (canvas.height - selectedObject.height * selectedObject.scaleY) / 2;
        break;

      default:
        break;
    }
    selectedObject.set(properties).setCoords();
    canvas.renderAll();
  };

  const alignSelection = (direction: AlignmentDirection) => {
    if (!isGroupOrSelectionObject(selectedObject) || !canvas) return;

    const objects = selectedObject.getObjects();
    if (objects.length === 0) return;

    const boundingBox = getBoundingBox(objects);
    if (!boundingBox) return;

    objects.forEach((obj) => {
      const properties = {} as { left?: number; top?: number };

      switch (direction) {
        case "left":
          properties.left = boundingBox.minX;
          break;
        case "right":
          properties.left = boundingBox.maxX - (obj.width ?? 0) * (obj.scaleX ?? 1);
          break;
        case "top":
          properties.top = boundingBox.minY;
          break;
        case "bottom":
          properties.top = boundingBox.maxY - (obj.height ?? 0) * (obj.scaleY ?? 1);
          break;
        case "horizontal":
          properties.left =
            boundingBox.minX + (boundingBox.width - (obj.width ?? 0) * (obj.scaleX ?? 1)) / 2;
          break;
        case "vertical":
          properties.top =
            boundingBox.minY + (boundingBox.height - (obj.height ?? 0) * (obj.scaleY ?? 1)) / 2;
          break;
      }

      obj.set(properties).setCoords();
    });

    canvas.requestRenderAll();
  };

  return (
    <Panel title="Layer Settings" className="w-72">
      <ScrollArea className="flex flex-col max-h-[60vh] overflow-y-auto">
        <div className="p-4">
          <PositionControls
            properties={properties}
            handleValueChange={handleValueChange}
            handleAngleChange={handleAngleChange}
          />

          <Separator className="h-0.5 mx-auto my-2" />

          <AlignmentControl onChange={alignObject} />

          <Separator className="h-0.5 mx-auto my-2" />

          <FillControls properties={properties} handleValueChange={handleValueChange} />

          <Separator className="h-0.5 mx-auto my-2" />

          <StrokeControls properties={properties} handleValueChange={handleValueChange} />

          {selectedObject && <Separator className="h-0.5 mx-auto my-2" />}

          {selectedObject?.isType("textbox") && (
            <TextBoxControls properties={properties} handleValueChange={handleValueChange} />
          )}

          {selectedObject?.isType("circle") && (
            <CircleControls properties={properties} handleValueChange={handleValueChange} />
          )}

          {selectedObject?.isType("ellipse") && (
            <EllipseControls properties={properties} handleValueChange={handleValueChange} />
          )}

          {isGroupOrSelectionObject(selectedObject) && (
            <Controls.ControlGroup title="Group">
              <Controls.ControlGrid>
                <AlignmentControl onChange={alignSelection} />
              </Controls.ControlGrid>
            </Controls.ControlGroup>
          )}
        </div>
      </ScrollArea>
    </Panel>
  );
}

export default LayerSettings;
