'use client;';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Canvas, Circle, FabricObject } from 'fabric';
import { useEffect, useState } from 'react';

export type SettingsProps = {
  canvas: Canvas | null;
};

function Settings({ canvas }: SettingsProps) {
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
    null
  );
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [radius, setRadius] = useState<string>('');
  const [color, setColor] = useState<string>('');
  useEffect(() => {
    if (canvas) {
      canvas.on('selection:created', (event) => {
        handleObjectSelection(event.selected[0]);
      });
      canvas.on('selection:updated', (event) => {
        handleObjectSelection(event.selected[0]);
      });
      canvas.on('selection:cleared', () => {
        setSelectedObject(null);
        clearSettings();
      });

      canvas.on('object:modified', (event) => {
        handleObjectSelection(event?.target);
      });
      canvas.on('object:scaling', (event) => {
        handleObjectSelection(event?.target);
      });
    }
  }, [canvas]);

  const handleObjectSelection = (object: FabricObject | null) => {
    if (!object) return;

    setSelectedObject(object);

    switch (object.type) {
      case 'rect':
        setWidth(Math.round(object.width * object.scaleX).toString());
        setHeight(Math.round(object.height * object.scaleY).toString());
        setColor(object.fill?.toString() ?? '');
        setRadius('');
        break;
      case 'circle':
        setRadius(
          Math.round((object as Circle).radius * 2 * object.scaleX).toString()
        );
        setColor(object.fill?.toString() ?? '');
        setWidth('');
        setHeight('');
        break;
      default:
        clearSettings();
        break;
    }
  };

  const clearSettings = () => {
    setSelectedObject(null);
    setWidth('');
    setHeight('');
    setRadius('');
    setColor('');
  };
  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/,/g, '');
    const initValue = parseInt(value, 10);
    setWidth(isNaN(initValue) ? '' : initValue.toString());

    if (selectedObject && selectedObject.type === 'rect' && initValue >= 0) {
      selectedObject.set({ width: initValue / selectedObject.scaleX });
      canvas?.renderAll();
    }
  };
  const handleHeigthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/,/g, '');
    const initValue = parseInt(value, 10);
    setHeight(isNaN(initValue) ? '' : initValue.toString());

    if (selectedObject && selectedObject.type === 'rect' && initValue >= 0) {
      selectedObject.set({ height: initValue / selectedObject.scaleY });
      canvas?.renderAll();
    }
  };

  const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/,/g, '');
    const initValue = parseInt(value, 10);
    setRadius(isNaN(initValue) ? '' : initValue.toString());

    if (selectedObject && selectedObject.type === 'circle' && initValue >= 0) {
      selectedObject.set({ radius: initValue / selectedObject.scaleY });
      canvas?.renderAll();
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setColor(value);

    if (selectedObject) {
      selectedObject.set({ fill: value });
      canvas?.renderAll();
    }
  };

  if (!selectedObject) return null;

  return (
    <div className="flex flex-col gap-2 p-2 rounded bg-background">
      {selectedObject.type === 'rect' && (
        <div className="space-y-4">
          <Label>
            <span>Width</span>
            <Input value={width} onChange={handleWidthChange} />
          </Label>
          <Label>
            <span>Height</span>
            <Input value={height} onChange={handleHeigthChange} />
          </Label>
          <Label>
            <span>Color</span>
            <Input value={color} type="color" onChange={handleColorChange} />
          </Label>
        </div>
      )}
      {selectedObject.type === 'circle' && (
        <div>
          <Label>
            <span>Radius</span>
            <Input value={radius} onChange={handleRadiusChange} />
          </Label>
          <Label>
            <span>Color</span>
            <Input value={color} type="color" onChange={handleColorChange} />
          </Label>
        </div>
      )}
    </div>
  );
}

export default Settings;
