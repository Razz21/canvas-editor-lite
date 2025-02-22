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
  const [canvasBgColor, setCanvasBgColor] = useState<string>('#ffffff');

  useEffect(() => {
    if (canvas) {
      setCanvasWidth(canvasWidth);
      setCanvasHeight(canvasHeight);
      setCanvasBgColor(canvasBgColor);
      canvas.renderAll();
    }
  }, [canvas, canvasWidth, canvasHeight, canvasBgColor]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    const initValue = parseInt(value, 10);

    if (initValue > 0) {
      setCanvasWidth(initValue);
      canvas?.setDimensions({ width: initValue });
      canvas?.renderAll();
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    const initValue = parseInt(value, 10);

    if (initValue > 0) {
      setCanvasHeight(initValue);
      canvas?.setDimensions({ height: initValue });
      canvas?.renderAll();
    }
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    if (value) {
      setCanvasBgColor(value);
      canvas?.set({ backgroundColor: value });
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
      <Label>
        <span>Canvas Background</span>
        <Input
          value={canvasBgColor}
          type="color"
          onChange={handleBgColorChange}
        />
      </Label>
    </div>
  );
}

export default CanvasSettings;
