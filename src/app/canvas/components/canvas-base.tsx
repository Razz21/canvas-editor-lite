import { useEffect, useRef } from "react";

import { Canvas, FabricObject } from "fabric";
import { initAligningGuidelines } from "fabric/extensions";

import { useCanvas } from "../hooks/useCanvas";
import { useCanvasHotkeys } from "../hooks/useCanvasHotkeys";
import { INIT_CANVAS_OPTIONS } from "../utils/canvas/constants";

export default function CanvasBase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setCanvas] = useCanvas();
  useCanvasHotkeys();

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, INIT_CANVAS_OPTIONS);

    fabricCanvas.renderAll();

    function addIdToObject(event: { target: FabricObject }) {
      const obj = event.target;
      obj.name = obj.name ?? obj.type;
      obj.id = obj.id || `${obj.type}_${new Date().getTime()}`;
    }

    setCanvas(fabricCanvas);

    fabricCanvas.on("object:added", addIdToObject);
    const clearAligningGuidelines = initAligningGuidelines(fabricCanvas, {});

    return () => {
      clearAligningGuidelines();
      fabricCanvas.off("object:added", addIdToObject);
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [setCanvas]);

  return (
    <div className="origin-center border shadow-lg border-muted">
      <canvas ref={canvasRef} />
    </div>
  );
}
