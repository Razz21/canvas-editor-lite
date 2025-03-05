import { useEffect, useRef } from "react";
import { INIT_CANVAS_OPTIONS, useCanvasStore } from "../stores/canvas-store";
import { Canvas, FabricObject } from "fabric";
import { initAligningGuidelines } from "fabric/extensions";
import { useCanvasHotkeys } from "../hooks/useCanvasHotkeys";

export default function CanvasBase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setCanvas = useCanvasStore((state) => state.setCanvas);
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
