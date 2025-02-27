import { useEffect, useRef } from "react";
import { INIT_CANVAS_OPTIONS, useCanvasStore } from "../stores/canvas-store";
import { Canvas } from "fabric";
import { initAligningGuidelines } from "fabric/extensions";

export default function CanvasBase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setCanvas = useCanvasStore((state) => state.setCanvas);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, INIT_CANVAS_OPTIONS);

    fabricCanvas.renderAll();

    setCanvas(fabricCanvas);

    fabricCanvas.on("object:added", (event) => {
      // ensure object has a name and id

      const obj = event.target;
      obj.name = obj.name ?? obj.type;
      obj.id = obj.id || `${obj.type}_${new Date().getTime()}`;

      console.log("object:added", obj);
    });

    initAligningGuidelines(fabricCanvas, {});

    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [setCanvas]);

  return (
    <div className="origin-center border shadow-lg border-neutral-100" style={INIT_CANVAS_OPTIONS}>
      <canvas ref={canvasRef} />
    </div>
  );
}
