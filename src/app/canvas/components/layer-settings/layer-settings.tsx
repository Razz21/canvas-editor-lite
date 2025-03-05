"use client;";

import { useCallback, useEffect, useRef, useState } from "react";

import { Circle, Ellipse, FabricObject, Group, Rect, Textbox } from "fabric";

import Panel from "../panel";
import { AlignmentControl } from "./components/alignment-controls";
import CircleControls from "./components/circle-controls";
import * as Controls from "./components/controls";
import EllipseControls from "./components/ellipse-controls";
import FillControls from "./components/fill-controls";
import PositionControls from "./components/position-controls";
import StrokeControls from "./components/stroke-controls";
import TextBoxControls from "./components/textbox-controls";
import { useCanvas } from "../../hooks/useCanvas";
import { getBoundingBox, isGroupOrSelectionObject } from "../../utils/canvas/common";
import { AlignmentDirection } from "../../utils/canvas/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type ShapeProps = FabricObject & Circle & Ellipse & Rect & Textbox & Group;

const initProperties = {
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
  const [canvas] = useCanvas();

  const [selectedObject, setSelectedObject] = useState<FabricObject | Group | null>(null);

  const [properties, setProperties] = useState<Partial<ShapeProps>>({
    ...initProperties,
  });

  const rafId = useRef<number | null>(null);
  const latestUpdates = useRef<Record<string, unknown>>({});

  const applyCanvasUpdates = useCallback(() => {
    if (isGroupOrSelectionObject(selectedObject)) {
      selectedObject
        .getObjects()
        .forEach((object) => object.set(latestUpdates.current).setCoords());
    } else {
      selectedObject?.set(latestUpdates.current).setCoords();
    }

    canvas?.requestRenderAll();

    rafId.current = null;
    latestUpdates.current = {};
  }, [canvas, selectedObject]);

  const handleValueChange = useCallback(
    (property: keyof typeof properties) => (value: unknown) => {
      // Store changes in a ref to batch updates
      latestUpdates.current[property] = value;

      if (rafId.current) return;

      setProperties((prev) => ({
        ...prev,
        ...latestUpdates.current,
      }));

      rafId.current = requestAnimationFrame(applyCanvasUpdates);
    },
    [applyCanvasUpdates]
  );

  const handleAngleChange = (input: number) => {
    // This method is used to rotate object on it's central rotation point,
    // regardless of the object's origin point

    const value = input % 360;

    setProperties((prev) => ({ ...prev, angle: value }));

    selectedObject?.rotate(value);
    selectedObject?.setCoords();
    canvas?.requestRenderAll();
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
  const handleObjectSelection = useCallback((object?: FabricObject | null) => {
    setSelectedObject(object ?? null);

    if (!object) return;

    setProperties({
      ...object?.toDatalessObject(),
      width: Math.round(object.width * object.scaleX),
      height: Math.round(object.height * object.scaleY),
      opacity: parseFloat(object.opacity.toFixed(2)),
      left: Math.round(object.left),
      top: Math.round(object.top),
      angle: Math.round(object.angle),
    });
  }, []);

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = <TEvent extends { selected: FabricObject[] }>(event: TEvent) => {
      handleObjectSelection(event.selected[0]);
    };
    const handleSelectionRemoved = () => {
      handleObjectSelection(null);
    };

    const handleObjectModified = <TEvent extends { target: FabricObject }>(event: TEvent) => {
      handleObjectSelection(event.target);
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleSelectionRemoved);

    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:rotating", handleObjectModified);
    canvas.on("object:scaling", handleObjectModified);

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleSelectionRemoved);

      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:rotating", handleObjectModified);
      canvas.off("object:scaling", handleObjectModified);
    };
  }, [canvas, handleObjectSelection]);

  return (
    <Panel header="Layer Settings" className="w-72 fixed top-20 right-4">
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
