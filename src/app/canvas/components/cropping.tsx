'use client;';

import { Button } from '@/components/ui/button';
import { Canvas, FabricObject, Rect } from 'fabric';
import { CropIcon } from 'lucide-react';
import { memo } from 'react';

export type CroppingProps = {
  canvas: Canvas | null;
  onFramesUpdate: () => void;
};

const Cropping = memo(({ canvas, onFramesUpdate }: CroppingProps) => {
  console.log('Cropping');

  const addFrameToCanvas = () => {
    if (!canvas) return;

    const frameName = `Frame ${canvas.getObjects('rect').length + 1}`;
    const frame = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: "transparent",
      stroke: '#90EE90',
      strokeWidth: 1,
      selectable: true,
      evented: true,
      name: frameName,
    });
    canvas.add(frame);
    canvas.setActiveObject(frame);
    canvas.renderAll();

    const maintainStrokeWidth = (object: FabricObject) => {
      const scaleX = object.scaleX || 1;
      const scaleY = object.scaleY || 1;

      object.set({
        width: object.width * scaleX,
        height: object.height * scaleY,
        scaleX: 1,
        scaleY: 1,
        strokeWidth: 1,
      });
      object.setCoords();
    };

    frame.on('scaling', () => {
      maintainStrokeWidth(frame);
      canvas.renderAll();
    });

    frame.on('modified', () => {
      maintainStrokeWidth(frame);
      canvas.renderAll();
    });

    onFramesUpdate();
  };
  return (
    <Button onClick={addFrameToCanvas} variant="ghost" size="icon">
      <CropIcon onClick={addFrameToCanvas} />
    </Button>
  );
});

export default Cropping;
