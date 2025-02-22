'use client;';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Canvas, FabricObject } from 'fabric';
import { DownloadIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export type CroppingSettingsProps = {
  canvas: Canvas | null;
  refreshKey: string | number;
};

function CroppingSettings({ canvas, refreshKey }: CroppingSettingsProps) {
  const [frames, setFrames] = useState<FabricObject[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FabricObject | null>(null);

  const updateFrames = () => {
    if (!canvas) return;

    const framesFromCanvas = canvas.getObjects('rect').filter((object) => {
      return object.name?.startsWith('Frame');
    });

    setFrames(framesFromCanvas);

    if (framesFromCanvas.length) {
      setSelectedFrame(framesFromCanvas[0]);
    }
  };

  useEffect(() => {
    updateFrames();
  }, [canvas, refreshKey]);

  const handleFrameSelect = (frameName: string) => {
    const selected = frames.find((f) => f.name === frameName);

    if (!selected) return;

    setSelectedFrame(selected);
    canvas?.setActiveObject(selected);
    canvas?.renderAll();
  };

  const exportFrameAsPNG = () => {
    if (!selectedFrame) return;

    frames.forEach((frame) => {
      frame.set('visible', false);
    });

    selectedFrame.set({
      strokeWidth: 0,
      visible: true,
    });

    const dataURL = canvas?.toDataURL({
      multiplier: 1,
      format: 'png',
      left: selectedFrame.left,
      top: selectedFrame.top,
      width: selectedFrame.width * selectedFrame.scaleX,
      height: selectedFrame.height * selectedFrame.scaleY,
    });

    if (!dataURL) return;

    selectedFrame.set({
      strokeWidth: 1,
    });

    frames.forEach((frame) => {
      frame.set('visible', true);
    });

    canvas?.renderAll();

    const link = document.createElement('a');

    link.href = dataURL;
    link.download = 'frame.png';
    link.click();
  };

  return (
    <div className="bg-background p-4 rounded shadow-md space-y-4">
      <Select
        value={selectedFrame?.name || ''}
        onValueChange={handleFrameSelect}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a frame" />
        </SelectTrigger>
        <SelectContent>
          {frames.map((frame, idx) => (
            <SelectItem value={frame.name ?? idx.toString()} key={frame.name}>
              {frame.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={exportFrameAsPNG} className='w-full'>
        <DownloadIcon /> Export as PNG
      </Button>
    </div>
  );
}

export default CroppingSettings;
