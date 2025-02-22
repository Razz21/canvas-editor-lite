'use client;';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Canvas } from 'fabric';
import { useEffect, useState } from 'react';

export type CanvasSettingsProps = {
  canvas: Canvas | null;
};

function CanvasSettings({ canvas }: CanvasSettingsProps) {
  const [canvasWidth, setCanvasWidth] = useState<number>(500);
  const [canvasHeight, setCanvasHeight] = useState<number>(500);

  useEffect(() => {
    if (canvas) {
      setCanvasWidth(canvasWidth);
      setCanvasHeight(canvasHeight);
      canvas.renderAll();
    }
  }, [canvas, canvasWidth, canvasHeight]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    const initValue = parseInt(value, 10);

    if (initValue > 0) {
      setCanvasWidth(initValue);
      canvas?.setWidth(initValue);
      canvas?.renderAll();
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    const initValue = parseInt(value, 10);

    if (initValue > 0) {
      setCanvasHeight(initValue);
      canvas?.setHeight(initValue);
      canvas?.renderAll();
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 rounded bg-background">
      <Label>
        <span>Canvas Width</span>
        <Input value={canvasWidth} onChange={handleWidthChange} />
      </Label>
      <Label>
        <span>Canvas Height</span>
        <Input value={canvasHeight} onChange={handleHeightChange} />
      </Label>
    </div>
  );
}

export default CanvasSettings;
