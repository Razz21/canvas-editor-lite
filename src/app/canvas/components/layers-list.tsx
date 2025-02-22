'use client;';

import { Button } from '@/components/ui/button';
import { Canvas, FabricObject } from 'fabric';
import { useEffect, useState } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeClosedIcon,
  TrashIcon,
} from 'lucide-react';
import { isGuidelineObject } from '../utils/snap';

export type LayerListProps = {
  canvas: Canvas | null;
};

export type LayerItem = Pick<
  FabricObject,
  'id' | 'zIndex' | 'type' | 'opacity'
>;

// TODO: extract this to a separate file
const addIdToObject = (object: FabricObject) => {
  if (!object.id) {
    const timestapm = new Date().getTime().toString();
    object.id = `${object.type}_${timestapm}`;
  }
};

// TODO: extract this to a separate file
Canvas.prototype.updateZIndices = function () {
  const objects = this.getObjects();
  objects.forEach((object, index) => {
    addIdToObject(object);
    object.zIndex = index;
  });
};

function LayersList({ canvas }: LayerListProps) {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<LayerItem | null>(null);

  const hideSelectedLayer = () => {
    if (!selectedLayer || !canvas) return;

    const object = canvas
      .getObjects()
      .find((obj) => obj.id === selectedLayer.id);

    if (!object) return;

    if (object.opacity === 0) {
      object.opacity = object.prevOpacity ?? 1;
      object.prevOpacity = undefined;
    } else {
      object.prevOpacity = object.opacity || 1;
      object.opacity = 0;
    }

    canvas.renderAll();
    updateLayers();

    setSelectedLayer({ ...selectedLayer, opacity: object.opacity });
  };

  const removeLayer = (layer: LayerItem) => {
    if (!canvas) return;

    const object = canvas.getObjects().find((obj) => obj.id === layer.id);

    if (!object) return;

    canvas.remove(object);
    canvas.renderAll();

    updateLayers();
  };

  const moveSelectedLayer = (direction: 'up' | 'down') => {
    if (!selectedLayer || !canvas) return;

    const objects = canvas?.getObjects();

    const object = objects?.find((obj) => obj.id === selectedLayer.id);

    if (!(object && objects)) return;

    const currentIndex = objects.indexOf(object);
    if (direction === 'up' && currentIndex < objects.length - 1) {
      const temp = objects[currentIndex];
      objects[currentIndex] = objects[currentIndex + 1];
      objects[currentIndex + 1] = temp;
    } else if (direction === 'down' && currentIndex > 0) {
      const temp = objects[currentIndex];
      objects[currentIndex] = objects[currentIndex - 1];
      objects[currentIndex - 1] = temp;
    }

    const bgColor = canvas.backgroundColor;
    canvas.clear();

    objects.forEach((obj) => canvas.add(obj));

    canvas.backgroundColor = bgColor;

    canvas.renderAll();

    objects.forEach((obj, index) => {
      obj.zIndex = index;
    });

    canvas.setActiveObject(object);

    canvas.renderAll();

    updateLayers();
  };

  const updateLayers = () => {
    if (!canvas) return;

    canvas.updateZIndices();

    const objects = canvas
      .getObjects()
      .filter((obj) => !isGuidelineObject(obj))
      .map((obj) => ({
        id: obj.id,
        zIndex: obj.zIndex,
        type: obj.type,
        opacity: obj.opacity,
      }));

    setLayers(() => [...objects].reverse());
  };

  const handleObjectSelected = <
    SelectionEvent extends { selected: FabricObject[] }
  >(
    e: SelectionEvent
  ) => {
    const selectedObject = e.selected?.[0] ?? null;
    if (!selectedObject) {
      setSelectedLayer(null);
      return;
    }
    setSelectedLayer({
      id: selectedObject.id,
      zIndex: selectedObject.zIndex,
      type: selectedObject.type,
      opacity: selectedObject.opacity,
    });
  };

  const selectLayerInCanvas = (id: LayerItem['id']) => {
    const object = canvas?.getObjects().find((obj) => obj.id === id);

    if (!object) {
      // debugger;
      setSelectedLayer(null);
      return;
    }
    setSelectedLayer({
      id: object.id,
      zIndex: object.zIndex,
      type: object.type,
      opacity: object.opacity,
    });
    canvas?.setActiveObject(object);
    canvas?.renderAll();
  };

  useEffect(() => {
    if (canvas) {
      canvas.on('object:added', updateLayers);
      canvas.on('object:removed', updateLayers);
      canvas.on('object:modified', updateLayers);

      canvas.on('selection:created', handleObjectSelected);
      canvas.on('selection:updated', handleObjectSelected);
      canvas.on('selection:cleared', () => setSelectedLayer(null));

      updateLayers();
    }
    return () => {
      canvas?.off('object:added', updateLayers);
      canvas?.off('object:removed', updateLayers);
      canvas?.off('object:modified', updateLayers);

      canvas?.off('selection:created', handleObjectSelected);
      canvas?.off('selection:updated', handleObjectSelected);
      canvas?.off('selection:cleared', () => setSelectedLayer(null));
    };
  }, [canvas]);

  return (
    <div className="bg-background p-4 rounded shadow-md space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={() => moveSelectedLayer('up')}
          size="icon"
          disabled={!selectedLayer}
        >
          <ArrowUpIcon />
        </Button>
        <Button
          onClick={() => moveSelectedLayer('down')}
          size="icon"
          disabled={!selectedLayer}
        >
          <ArrowDownIcon />
        </Button>
        <Button
          onClick={hideSelectedLayer}
          size="icon"
          disabled={!selectedLayer}
        >
          {selectedLayer?.opacity === 0 ? <EyeClosedIcon /> : <EyeIcon />}
        </Button>
      </div>
      <ul>
        {layers.map((layer) => (
          <li
            key={layer.id}
            className={`${
              layer.id === selectedLayer?.id ? 'bg-gray-200/50' : ''
            } p-2 rounded flex justify-between items-center`}
            onClick={() => selectLayerInCanvas(layer.id)}
          >
            <span>
              {layer.type} ({layer.zIndex})
            </span>
            <Button
              onClick={() => removeLayer(layer)}
              size="icon"
              variant="secondary"
            >
              <TrashIcon />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LayersList;
