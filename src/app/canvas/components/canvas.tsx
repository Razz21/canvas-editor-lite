'use client;';

import { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Circle, Line, Textbox } from 'fabric';
import { Button } from '@/components/ui/button';
import { CircleIcon, SquareIcon, TypeIcon } from 'lucide-react';
import Settings from './settings';
import CanvasSettings from './canvas-settings';
import { handleObjectMoving, clearGuidelines } from '../utils/snap';
import Cropping from './cropping';
import CroppingSettings from './cropping-settings';
import LayersList from './layers-list';

export type CanvasProps = {};

function CanvasBase({}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [guidelines, setGuidelines] = useState<Line[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 500,
        height: 500,
      });
      initCanvas.backgroundColor = '#fff';
      initCanvas.renderAll();

      setCanvas(initCanvas);

      initCanvas.on('object:moving', (event) => {
        handleObjectMoving(initCanvas, event.target, guidelines, setGuidelines);
      });

      initCanvas.on('object:modified', (event) => {
        clearGuidelines(initCanvas, guidelines, setGuidelines);
      });

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

  const handleFrameUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="z-20 relative">
        <div className="fixed top-1/2 -translate-y-1/2 left-4">
          <div className="flex flex-col gap-2 p-2 rounded bg-background">
            <Cropping canvas={canvas} onFramesUpdate={handleFrameUpdate} />
            <AddObjects canvas={canvas} />
          </div>
        </div>
        <div className="fixed top-1/2 -translate-y-1/2 right-4 flex flex-col gap-4">
          <Settings canvas={canvas} />
          <CanvasSettings canvas={canvas} />
          <CroppingSettings canvas={canvas} refreshKey={refreshKey} />
          <LayersList canvas={canvas} />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="border shadow-md border-neutral-100 z-10"
      />
    </div>
  );
}

export default CanvasBase;

function AddObjects({ canvas }: { canvas: Canvas | null }) {
  function addRectangle() {
    if (canvas) {
      const item = new Rect({
        width: 100,
        height: 100,
        fill: '#000000',
        left: 10,
        top: 10,
      });
      canvas.add(item);
    }
  }
  function addCircle() {
    if (canvas) {
      const item = new Circle({
        radius: 50,
        fill: '#000000',
        left: 10,
        top: 10,
      });
      canvas.add(item);
    }
  }
  function addTextBox() {
    if (canvas) {
      const item = new Textbox('Edit Text', {
        width: 100,
        fontSize: 20,
        fill: '#000000',
        left: 10,
        top: 10,
        lockScalingFlip: true,
        lockScalingX: false,
        lockScalingY: false,
        editable: true,
        fontFamily: 'Arial',
        textAlign: 'left',
      });
      canvas.add(item);
    }
  }
  return (
    <>
      <Button onClick={addRectangle} variant="ghost" size="icon">
        <SquareIcon />
      </Button>
      <Button onClick={addCircle} variant="ghost" size="icon">
        <CircleIcon />
      </Button>
      <Button onClick={addTextBox} variant="ghost" size="icon">
        <TypeIcon />
      </Button>
    </>
  );
}
