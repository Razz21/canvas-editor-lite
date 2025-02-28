import { useEffect, useRef } from "react";
import { INIT_CANVAS_OPTIONS, useCanvasStore } from "../stores/canvas-store";
import { Canvas } from "fabric";
import { initAligningGuidelines } from "fabric/extensions";
import { cloneSelected, removeSelected } from "../utils/canvas/actions";

const handleKeyEvent = (canvas: Canvas) => (e: KeyboardEvent) => {
  if (e.key === "Delete") {
    removeSelected(canvas);
  } else if (e.ctrlKey && e.key === "d") {
    e.preventDefault();
    cloneSelected(canvas);
    e.stopPropagation();
  }
};

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

    const keyDownHandler = handleKeyEvent(fabricCanvas);
    document.addEventListener("keydown", keyDownHandler);

    initAligningGuidelines(fabricCanvas, {});

    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [setCanvas]);

  return (
    <div className="origin-center border shadow-lg border-neutral-100">
      <canvas ref={canvasRef} />
    </div>
  );
}
