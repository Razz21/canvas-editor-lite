import { useEffect, useRef } from 'react';
import { INIT_CANVAS_OPTIONS, useCanvasStore } from '../stores/canvas-store';
import { useElementsStore } from '../stores/elements-store';
import { BasicTransformEvent, Canvas, FabricObject } from 'fabric';
import {
  clearGuidelines,
  handleObjectMoving,
  isGuidelineObject,
} from '../utils/snap';

export default function CanvasBase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setCanvas = useCanvasStore((state) => state.setCanvas);
  const addElement = useElementsStore((state) => state.addElement);

  const handleObjectMovingCallback =
    (canvas: Canvas) =>
    (event: BasicTransformEvent & { target: FabricObject }) =>
      handleObjectMoving(canvas, event.target);

  const handleObjectModifiedCallback = (canvas: Canvas) => () =>
    clearGuidelines(canvas);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, INIT_CANVAS_OPTIONS);

    fabricCanvas.renderAll();

    setCanvas(fabricCanvas);

    fabricCanvas.on('object:added', (event) => {
      const obj = event.target;

      if (!obj) return;
      if (isGuidelineObject(obj)) return;

      obj.name = obj.type;
      obj.id = obj.id || `${obj.type}_${new Date().getTime()}`;

      console.log('object:added', obj);
      addElement(obj);
    });

    fabricCanvas.on('object:moving', handleObjectMovingCallback(fabricCanvas));
    fabricCanvas.on(
      'object:modified',
      handleObjectModifiedCallback(fabricCanvas)
    );

    return () => {
      fabricCanvas.off(
        'object:modified',
        handleObjectModifiedCallback(fabricCanvas)
      );
      fabricCanvas.off(
        'object:moving',
        handleObjectMovingCallback(fabricCanvas)
      );
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [setCanvas, addElement]);

  return (
    <canvas ref={canvasRef} className="border shadow-md border-neutral-100" />
  );
}
