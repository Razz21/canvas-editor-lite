'use client;';

import { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Circle, Line } from 'fabric';
import { Button } from '@/components/ui/button';
import { Circle as CircleIcon, Square as SquareIcon } from 'lucide-react';
import Settings from './settings';
import CanvasSettings from './canvas-settings';
import { handleObjectMoving, clearGuidelines } from '../utils/snap';

export type CanvasProps = {};

function CanvasBase({}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [guidelines, setGuidelines] = useState<Line[]>([]);

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

  return (
    <div>
      <div className="z-20 relative">
        <div className="fixed top-1/2 -translate-y-1/2 left-4">
          <Toolbar canvas={canvas} />
        </div>
        <div className="fixed top-1/2 -translate-y-1/2 right-4 flex flex-col gap-4">
          <Settings canvas={canvas} />
          <CanvasSettings canvas={canvas} />
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

function Toolbar({ canvas }: { canvas: Canvas | null }) {
  function addRectangle() {
    if (canvas) {
      const item = new Rect({
        width: 100,
        height: 100,
        fill: '#000',
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
        fill: '#000',
        left: 10,
        top: 10,
      });
      canvas.add(item);
    }
  }
  return (
    <div className="flex flex-col gap-2 p-2 rounded bg-background">
      <Button onClick={addRectangle} variant="ghost" size="icon">
        <SquareIcon />
      </Button>
      <Button onClick={addCircle} variant="ghost" size="icon">
        <CircleIcon />
      </Button>
    </div>
  );
}
