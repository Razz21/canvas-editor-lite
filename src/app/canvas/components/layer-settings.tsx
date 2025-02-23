'use client;';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Circle, FabricObject, Rect } from 'fabric';
import { useEffect, useState } from 'react';
import { useCanvasStore } from '../stores/canvas-store';
import { ElementObject, useElementsStore } from '../stores/elements-store';
import { useShallow } from 'zustand/react/shallow';
import { clamp } from '../utils/numbers';

export type LayerSettingsProps = {};

const initProperties = {
  // Common
  width: 0,
  height: 0,
  angle: 0,
  fill: '#000000',
  opacity: 0,
  // Circle
  radius: 0,
} satisfies Partial<ElementObject & Circle & Rect>;

function LayerSettings({}: LayerSettingsProps) {
  const canvas = useCanvasStore((state) => state.canvas);
  const selectedObject = useElementsStore((state) => state.getSelected());

  const { setSelectedId } = useElementsStore(
    useShallow((state) => ({
      selectedObject: state.getSelected(),
      setSelectedId: state.setSelectedId,
    }))
  );

  const [properties, setProperties] = useState<
    Partial<ElementObject & Circle & Rect>
  >({
    ...initProperties,
  });

  useEffect(() => {
    if (canvas) {
      canvas.on('selection:created', (event) => {
        handleObjectSelection(event.selected[0]);
      });
      canvas.on('selection:updated', (event) => {
        handleObjectSelection(event.selected[0]);
      });
      canvas.on('selection:cleared', () => {
        setSelectedId(null);
      });

      canvas.on('object:modified', (event) => {
        handleObjectSelection(event.target);
      });
      canvas.on('object:scaling', (event) => {
        handleObjectSelection(event.target);
      });
    }
    return () => {
      // TODO: remove listeners
    };
  }, [canvas]);

  const handleObjectSelection = (object: FabricObject | null) => {
    setSelectedId(object?.id ?? null);

    if (!object) return;

    setProperties({
      ...object,
      width: Math.round(object.width * object.scaleX),
      height: Math.round(object.height * object.scaleY),
      radius: Math.round(((object as Circle).radius || 0) * object.scaleY),
    });
  };

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const initValue = parseInt(event.target.value, 10) || 0;

    setProperties((prev) => ({ ...prev, width: initValue }));

    if (selectedObject && initValue >= 0) {
      selectedObject
        .set({ width: initValue / selectedObject.scaleX })
        .setCoords();
      canvas?.renderAll();
    }
  };

  const handleHeigthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const initValue = parseInt(event.target.value, 10) || 0;

    setProperties((prev) => ({ ...prev, height: initValue }));

    if (selectedObject && initValue >= 0) {
      selectedObject
        .set({ height: initValue / selectedObject.scaleY })
        .setCoords();
      canvas?.renderAll();
    }
  };

  const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const initValue = parseInt(event.target.value, 10) || 0;

    setProperties((prev) => ({ ...prev, radius: initValue }));

    if (selectedObject && initValue >= 0) {
      selectedObject
        .set({ radius: initValue / selectedObject.scaleY })
        .setCoords();
      canvas?.renderAll();
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();

    setProperties((prev) => ({ ...prev, fill: value }));

    if (selectedObject) {
      selectedObject.set({ fill: value });
      canvas?.renderAll();
    }
  };

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const initValue = clamp(
      +parseFloat(event.target.value).toFixed(2) || 0,
      0,
      1
    );

    setProperties((prev) => ({ ...prev, opacity: initValue }));

    if (selectedObject) {
      selectedObject.set({ opacity: initValue });
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
            <Input value={properties.width} onChange={handleWidthChange} />
          </Label>
          <Label>
            <span>Height</span>
            <Input value={properties.height} onChange={handleHeigthChange} />
          </Label>
        </div>
      )}
      {selectedObject.type === 'circle' && (
        <div>
          <Label>
            <span>Radius</span>
            <Input value={properties.radius} onChange={handleRadiusChange} />
          </Label>
        </div>
      )}

      {selectedObject && (
        <>
          <Label>
            <span>Color</span>
            <Input
              value={properties.fill?.toString()}
              type="color"
              onChange={handleColorChange}
            />
          </Label>
          <Label>
            <span>Opacity</span>
            <Input
              value={properties.opacity}
              min={0}
              max={1}
              step={0.01}
              type="number"
              onChange={handleOpacityChange}
            />
          </Label>
        </>
      )}
    </div>
  );
}

export default LayerSettings;
