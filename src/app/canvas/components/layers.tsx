'use client;';

import { Button } from '@/components/ui/button';
import { Canvas, FabricObject } from 'fabric';
import { ComponentProps, useEffect, useState } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  TrashIcon,
  LockIcon,
  LockOpenIcon,
  EyeOffIcon,
} from 'lucide-react';
import { isGuidelineObject } from '../utils/snap';
import { useCanvasStore } from '../stores/canvas-store';
import { ElementObject, useElementsStore } from '../stores/elements-store';
import { useShallow } from 'zustand/react/shallow';
import { Separator } from '@/components/ui/separator';
import { clamp } from '../utils/numbers';

export type LayerProps = {};

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

function Layers({}: LayerProps) {
  const canvas = useCanvasStore((state) => state.canvas);

  const { elements, setElements } = useElementsStore(
    useShallow((state) => ({
      elements: state.elements,
      setElements: state.setElements,
    }))
  );

  const [selectedLayer, setSelectedLayer] =
    useState<Partial<ElementObject> | null>(null);

  const lockLayer = (element: ElementObject) => {
    if (!element || !canvas) return;

    const object = canvas.getObjects().find((obj) => obj.id === element.id);

    if (!object) return;

    object.locked = !object.locked;

    object.lockMovementX = object.locked;
    object.lockMovementY = object.locked;
    object.lockRotation = object.locked;
    object.lockScalingX = object.locked;
    object.lockScalingY = object.locked;

    canvas.renderAll();
    updateLayers();

    setSelectedLayer({ ...object });
  };

  const hideLayer = (element: ElementObject) => {
    if (!element || !canvas) return;

    const object = canvas.getObjects().find((obj) => obj.id === element.id);

    if (!object) return;
    object.visible = !object.visible;

    canvas.renderAll();
    updateLayers();

    setSelectedLayer({ ...object });
  };

  const renameLayer = (element: ElementObject, name: string) => {
    if (!element || !canvas) return;

    const object = canvas.getObjects().find((obj) => obj.id === element.id);

    if (!object) return;

    object.name = name;

    canvas.renderAll();
    updateLayers();

    setSelectedLayer({ ...object });
  };

  const removeLayer = (element: ElementObject) => {
    if (!canvas) return;

    const object = canvas.getObjects().find((obj) => obj.id === element.id);

    if (!object) return;

    canvas.remove(object);
    canvas.renderAll();

    updateLayers();
  };

  const moveLayer = (
    layer: Partial<ElementObject> | null,
    direction: number
  ) => {
    if (!canvas || !layer) return;

    const objects = canvas?.getObjects();
    if (!objects) return;

    const object = objects?.find((obj) => obj.id === layer.id);
    if (!object) return;

    const currentIndex = objects.indexOf(object);
    const newIndex = clamp(currentIndex + direction, 0, objects.length - 1);

    if (currentIndex === newIndex) return;

    const temp = objects[currentIndex];
    objects[currentIndex] = objects[newIndex];
    objects[newIndex] = temp;

    const bgColor = canvas.backgroundColor;
    canvas.clear();

    objects.forEach((obj) => canvas.add(obj));

    canvas.backgroundColor = bgColor;

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
      .filter((obj) => !isGuidelineObject(obj));

    setElements([...objects].reverse());
  };

  const handleObjectSelected = <
    SelectionEvent extends { selected: FabricObject[] }
  >(
    e: SelectionEvent
  ) => {
    const selectedCanvasObject = e.selected?.[0] ?? null;

    if (!selectedCanvasObject) {
      setSelectedLayer(null);
      return;
    }
    setSelectedLayer(selectedCanvasObject);
  };

  const selectLayerInCanvas = (id: ElementObject['id']) => {
    const object = canvas?.getObjects().find((obj) => obj.id === id);

    if (!object) {
      setSelectedLayer(null);
      return;
    }
    setSelectedLayer(object);
    canvas?.setActiveObject(object);
    canvas?.renderAll();
  };

  useEffect(() => {
    if (canvas) {
      // TODO avoid re-rendering when snap guidelines are triggered
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
      <div className="flex justify-between items-center">
        <span>Layers</span>
        <span className="flex gap-1">
          <Button
            onClick={() => moveLayer(selectedLayer, 1)}
            size="icon"
            disabled={!selectedLayer}
            className="[&_svg]:size-3 w-8 h-8"
          >
            <ArrowUpIcon />
          </Button>
          <Button
            onClick={() => moveLayer(selectedLayer, -1)}
            size="icon"
            disabled={!selectedLayer}
            className="[&_svg]:size-3 w-8 h-8"
          >
            <ArrowDownIcon />
          </Button>
        </span>
      </div>
      <Separator className="my-4" />
      <ul>
        {elements.map((layer) => (
          <LayerItem
            key={layer.id}
            hideLayer={hideLayer}
            lockLayer={lockLayer}
            removeLayer={removeLayer}
            layer={layer}
            selected={layer.id === selectedLayer?.id}
            onClick={() => selectLayerInCanvas(layer.id)}
          />
        ))}
      </ul>
    </div>
  );
}

export default Layers;

type LayerItemProps = {
  layer: ElementObject;
  selected: boolean;
  lockLayer: (element: ElementObject) => void;
  hideLayer: (element: ElementObject) => void;
  removeLayer: (element: ElementObject) => void;
} & ComponentProps<'li'>;

function LayerItem({
  selected,
  className,
  hideLayer,
  layer,
  lockLayer,
  removeLayer,
  ...rest
}: LayerItemProps) {
  return (
    <li
      className={`${
        selected ? 'bg-neutral-100/50' : ''
      } p-2 rounded flex justify-between items-center ${className || ''}`}
      {...rest}
    >
      <span>{layer.name}</span>
      <div className="flex gap-1">
        <Button
          onClick={() => lockLayer(layer)}
          size="icon"
          variant="ghost"
          className="[&_svg]:size-3 w-8 h-8"
          data-active={layer.locked === true}
        >
          {layer.locked === true ? <LockIcon /> : <LockOpenIcon />}
        </Button>
        <Button
          onClick={() => hideLayer(layer)}
          size="icon"
          variant="ghost"
          className="[&_svg]:size-3 w-8 h-8"
          data-active={layer.visible !== true}
        >
          {layer.visible ? <EyeIcon /> : <EyeOffIcon />}
        </Button>
        <Button
          onClick={() => removeLayer(layer)}
          size="icon"
          variant="secondary"
          className="[&_svg]:size-3 w-8 h-8"
          data-active
        >
          <TrashIcon />
        </Button>
      </div>
    </li>
  );
}
