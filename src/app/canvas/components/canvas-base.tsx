import { useEffect, useRef } from "react";
import { INIT_CANVAS_OPTIONS, useCanvasStore } from "../stores/canvas-store";
import { useElementsStore } from "../stores/elements-store";
import { Canvas } from "fabric";
import { initAligningGuidelines } from "fabric/extensions";

export default function CanvasBase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setCanvas = useCanvasStore((state) => state.setCanvas);
  const addElement = useElementsStore((state) => state.addElement);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, INIT_CANVAS_OPTIONS);

    fabricCanvas.renderAll();

    setCanvas(fabricCanvas);

    fabricCanvas.on("object:added", (event) => {
      const obj = event.target;

      obj.name = obj.name ?? `New ${obj.type}`;
      obj.id = obj.id || `${obj.type}_${new Date().getTime()}`;

      console.log("object:added", obj);
      addElement(obj);
    });

    initAligningGuidelines(fabricCanvas, {});

    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [setCanvas, addElement]);

  return (
    <div className="origin-center">
      <canvas ref={canvasRef} className="border shadow-md border-neutral-100" />
    </div>
  );
}
