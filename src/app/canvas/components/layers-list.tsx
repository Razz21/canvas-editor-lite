'use client;';

import { Canvas, FabricObject } from 'fabric';
import { useEffect, useState } from 'react';

export type LayerListProps = {
  canvas: Canvas | null;
};

export type LayerItem = Pick<FabricObject, 'id' | 'zIndex' | 'type'>;

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
  const [selectedLayer, setSelectedLayer] = useState<LayerItem['id'] | null>(
    null
  );

  const updateLayers = () => {
    if (!canvas) return;

    canvas.updateZIndices();

    const objects = canvas
      .getObjects()
      .filter((obj) => {
        return !(
          obj.id?.startsWith('vertical-') || obj.id?.startsWith('horizontal-')
        );
      })
      .map((obj) => ({
        id: obj.id,
        zIndex: obj.zIndex,
        type: obj.type,
      }));

    setLayers(() => [...objects].reverse());
  };

  const handleObjectSelected = <
    SelectionEvent extends { selected: FabricObject[] }
  >(
    e: SelectionEvent
  ) => {
    const selectedId = e.selected?.[0]?.id ?? null;

    setSelectedLayer(selectedId);
  };

  const selectLayerInCanvas = (id: LayerItem['id']) => {
    const object = canvas?.getObjects().find((obj) => obj.id === id);

    if (!object) {
      debugger;
      setSelectedLayer(null);
      return;
    }
    setSelectedLayer(object.id);
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
      <ul>
        {layers.map((layer) => (
          <li
            key={layer.id}
            className={`${
              layer.id === selectedLayer ? 'bg-gray-200/50' : ''
            } p-2 rounded`}
            onClick={() => selectLayerInCanvas(layer.id)}
          >
            {layer.type} ({layer.zIndex})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LayersList;
