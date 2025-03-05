"use client";

import { ChangeEvent, useEffect, useState, Dispatch, SetStateAction } from "react";

import { Canvas, Point, TPointerEventInfo } from "fabric";
import { debounce } from "lodash-es";
import { RotateCcwIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import Panel from "./panel";
import { useCanvas } from "../hooks/useCanvas";
import { clamp } from "../utils/numbers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;

// Handles Zoom via Mouse Wheel
const handleMouseWheel =
  (canvas: Canvas, setZoom: Dispatch<SetStateAction<string | number>>) =>
  (opt: TPointerEventInfo<WheelEvent>) => {
    if (!canvas) return;
    const delta = opt.e.deltaY;
    let newZoom = canvas.getZoom() * 0.999 ** delta;

    newZoom = +clamp(newZoom, MIN_ZOOM, MAX_ZOOM).toFixed(2);
    setZoom(Math.round(newZoom * 100));

    canvas.zoomToPoint(new Point(opt.e.offsetX, opt.e.offsetY), newZoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

const handleMouseDown = (canvas: Canvas) => (opt: TPointerEventInfo<MouseEvent>) => {
  const evt = opt.e;
  if (evt.altKey) {
    canvas.isDragging = true;
    canvas.selection = false;
    canvas.discardActiveObject();
    canvas.lastPosX = evt.clientX;
    canvas.lastPosY = evt.clientY;
  }
};

const handleMouseMove = (canvas: Canvas) => (opt: TPointerEventInfo<MouseEvent>) => {
  if (!canvas.isDragging) return;
  const e = opt.e;
  const vpt = canvas.viewportTransform!;
  vpt[4] += e.clientX - (canvas.lastPosX ?? 0);
  vpt[5] += e.clientY - (canvas.lastPosY ?? 0);
  canvas.requestRenderAll();
  canvas.lastPosX = e.clientX;
  canvas.lastPosY = e.clientY;
};

const handleMouseUp = (canvas: Canvas) => () => {
  canvas.setViewportTransform(canvas.viewportTransform);
  canvas.isDragging = false;
  canvas.selection = true;
};

export type CanvasZoomProps = {};

function CanvasZoom({}: CanvasZoomProps) {
  const [canvas] = useCanvas();
  const [zoom, setZoom] = useState<string | number>(canvas?.getZoom() ?? 1 * 100);

  useEffect(() => {
    if (!canvas) return;

    const debouncedSetZoom = debounce(setZoom, 100);

    const mouseWheelHandler = handleMouseWheel(canvas, debouncedSetZoom);
    const mouseDownHandler = handleMouseDown(canvas);
    const mouseMoveHandler = handleMouseMove(canvas);
    const mouseUpHandler = handleMouseUp(canvas);

    canvas.on("mouse:wheel", mouseWheelHandler);
    canvas.on("mouse:down", mouseDownHandler);
    canvas.on("mouse:move", mouseMoveHandler);
    canvas.on("mouse:up", mouseUpHandler);

    return () => {
      canvas.off("mouse:wheel", mouseWheelHandler);
      canvas.off("mouse:down", mouseDownHandler);
      canvas.off("mouse:move", mouseMoveHandler);
      canvas.off("mouse:up", mouseUpHandler);
    };
  }, [canvas]);

  // Handles Zoom Update (Slider & Input)
  const updateZoom = (zoomFactor: number) => {
    if (!canvas) return;
    const newZoom = clamp(zoomFactor, MIN_ZOOM, MAX_ZOOM);
    const center = canvas.getCenterPoint();
    canvas.zoomToPoint(new Point(center.x, center.y), newZoom);
    canvas.requestRenderAll();
  };

  // Handles Zoom Button Clicks
  const stepZoom = (step: number) => {
    const value = +clamp(Number(zoom) / 100 + step, MIN_ZOOM, MAX_ZOOM).toFixed(2);
    setZoom(value * 100);
    updateZoom(value);
  };

  // Handles Zoom Input Changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setZoom(value);
    const zoomFactor = parseInt(value);
    if (isNaN(zoomFactor)) return;
    updateZoom(zoomFactor / 100);
  };

  const handleBlur = () => {
    if (zoom === "") {
      setZoom(canvas?.getZoom() ?? 1);
    }
  };

  const resetZoomAndPan = () => {
    setZoom(100);
    canvas?.setViewportTransform([1, 0, 0, 1, 0, 0]);
    updateZoom(1);
  };

  return (
    <Panel className="fixed bottom-4 right-4">
      <div className="flex items-center gap-2 p-2">
        <Button onClick={() => stepZoom(-0.1)} variant="outline" size="icon">
          <ZoomOutIcon />
        </Button>
        <Input
          type="number"
          step="1"
          min="10"
          max="500"
          value={zoom}
          onChange={handleChange}
          onBlur={handleBlur}
          variant="secondary"
          className="w-16"
        />
        <Button onClick={() => stepZoom(0.1)} variant="outline" size="icon">
          <ZoomInIcon />
        </Button>
        <Button onClick={resetZoomAndPan} variant="outline" size="icon">
          <RotateCcwIcon />
        </Button>
      </div>
    </Panel>
  );
}

export default CanvasZoom;
