"use client";

import { Button } from "@/components/ui/button";
import { Rect, Textbox, Circle, Canvas, FabricObject } from "fabric";
import { CircleIcon, CropIcon, SquareIcon, TypeIcon } from "lucide-react";
import { useCanvasStore } from "../stores/canvas-store";

function addRectangle(canvas: Canvas | null) {
  if (!canvas) return;

  const item = new Rect({
    width: 100,
    height: 100,
    fill: "#000000",
    left: 10,
    top: 10,
  });
  canvas.add(item);
  canvas.setActiveObject(item);
}
function addCircle(canvas: Canvas | null) {
  if (!canvas) return;

  const item = new Circle({
    radius: 50,
    fill: "#000000",
    left: 10,
    top: 10,
  });
  canvas.add(item);
  canvas.setActiveObject(item);
}
function addTextBox(canvas: Canvas | null) {
  if (!canvas) return;

  const item = new Textbox("Edit Text", {
    width: 100,
    fontSize: 20,
    fill: "#000000",
    left: 10,
    top: 10,
    lockScalingFlip: true,
    lockScalingX: false,
    lockScalingY: false,
    editable: true,
    fontFamily: "Arial",
    textAlign: "left",
  });
  canvas.add(item);
  canvas.setActiveObject(item);
}
const maintainStrokeWidth = (object: FabricObject) => {
  const scaleX = object.scaleX || 1;
  const scaleY = object.scaleY || 1;

  object.set({
    width: object.width * scaleX,
    height: object.height * scaleY,
    scaleX: 1,
    scaleY: 1,
    strokeWidth: 1,
  });
  object.setCoords();
};
const addFrameToCanvas = (canvas: Canvas | null) => {
  if (!canvas) return;

  const nextIndex =
    Math.max(
      0,
      ...canvas
        .getObjects("rect")
        .filter((obj) => obj.id?.startsWith("frame_"))
        .map(({ id }) => parseInt(id?.split("_")[1] ?? "0"))
    ) + 1;

  const frameName = `Frame ${nextIndex}`;

  const frame = new Rect({
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    fill: "transparent",
    stroke: "#90EE90",
    strokeWidth: 1,
    selectable: true,
    evented: true,
    name: frameName,
  });
  frame.id = `frame_${nextIndex}`;

  canvas.add(frame);
  canvas.setActiveObject(frame);
  canvas.renderAll();

  frame.on("scaling", () => {
    maintainStrokeWidth(frame);
    canvas.renderAll();
  });

  frame.on("modified", () => {
    maintainStrokeWidth(frame);
    canvas.renderAll();
  });
};

const NavTools = () => {
  const canvas = useCanvasStore((state) => state.canvas);

  return (
    <div className="flex gap-1 p-2">
      <Button onClick={() => addFrameToCanvas(canvas)} variant="ghost" size="icon">
        <CropIcon />
      </Button>
      <Button onClick={() => addRectangle(canvas)} variant="ghost" size="icon">
        <SquareIcon />
      </Button>
      <Button onClick={() => addCircle(canvas)} variant="ghost" size="icon">
        <CircleIcon />
      </Button>
      <Button onClick={() => addTextBox(canvas)} variant="ghost" size="icon">
        <TypeIcon />
      </Button>
    </div>
  );
};

export default NavTools;
