"use client;";

import { Button } from "@/components/ui/button";
import { FabricObject } from "fabric";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  TrashIcon,
  LockIcon,
  LockOpenIcon,
  EyeOffIcon,
} from "lucide-react";
import { isGuidelineObject } from "../utils/snap";
import { useCanvasStore } from "../stores/canvas-store";
import { ElementObject, useElementsStore } from "../stores/elements-store";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";
import { clamp } from "../utils/numbers";
import { ScrollArea } from "@/components/ui/scroll-area";

export type LayerProps = {};

function Layers({}: LayerProps) {
  const canvas = useCanvasStore((state) => state.canvas);

  const { elements, setElements } = useElementsStore(
    useShallow((state) => ({
      elements: state.elements,
      setElements: state.setElements,
    }))
  );

  const [selectedLayer, setSelectedLayer] = useState<Partial<ElementObject> | null>(null);

  const lockLayer = useCallback(
    (element: ElementObject) => {
      if (!element || !canvas) return;

      const object = canvas.getObjectById(element.id);

      if (!object) return;
      const newLocked = !object.locked;

      object.set({
        locked: newLocked,
        lockMovementX: newLocked,
        lockMovementY: newLocked,
        lockRotation: newLocked,
        lockScalingX: newLocked,
        lockScalingY: newLocked,
      });
      // TODO consider another way to update layers without re-rendering by updateLayers()
      canvas.fire("object:modified", { target: object });
    },
    [canvas]
  );

  const hideLayer = useCallback(
    (element: ElementObject) => {
      const object = canvas?.getObjectById(element.id);

      if (!object) return;

      object.set({
        visible: !object.visible,
      });
      // <object:modified> event is not triggered when setting visible property
      // trigger <object:modified> event manually to update layers
      canvas?.fire("object:modified", { target: object });
    },
    [canvas]
  );

  const removeLayer = useCallback(
    (element: ElementObject) => {
      const object = canvas?.getObjectById(element.id);

      if (!object) return;

      canvas?.remove(object);
      canvas?.renderAll();
    },
    [canvas]
  );

  const moveLayer = useCallback(
    (layerId: ElementObject["id"] | null, direction: number) => {
      if (!canvas || !layerId) return;

      const objects = canvas?.getObjects();

      if (!objects) return;

      const object = canvas?.getObjectById(layerId);
      if (!object) return;

      const currentIndex = objects.indexOf(object);
      const newIndex = clamp(currentIndex + direction, 0, objects.length - 1);

      if (currentIndex === newIndex) return;

      const temp = objects[currentIndex];
      objects[currentIndex] = objects[newIndex];
      objects[newIndex] = temp;

      // update canvas objects in bulk
      canvas._objects = objects;

      // trigger re-render
      // TODO consider another way to update layers withuout re-rendering by updateLayers()
      canvas.fire("object:modified", { target: object });

      canvas.setActiveObject(object);
    },
    [canvas]
  );

  const updateLayers = <UpdateEvent extends { target: FabricObject }>(event?: UpdateEvent) => {
    if (event && isGuidelineObject(event.target)) return;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const filteredObjects = objects.filter((obj) => !isGuidelineObject(obj));

    filteredObjects.forEach((object, index) => {
      object.zIndex = index;
    });

    setElements([...filteredObjects].reverse());
    canvas.requestRenderAll();
  };

  const clearObjectSelected = () => {
    setSelectedLayer(null);
  };

  const handleObjectSelected = <SelectionEvent extends { selected: FabricObject[] }>(
    e: SelectionEvent
  ) => {
    setSelectedLayer(e.selected?.[0] ?? null);
  };

  const selectLayerInCanvas = (id: ElementObject["id"]) => {
    const object = canvas?.getObjectById(id) ?? null;

    setSelectedLayer(object);

    if (object) {
      canvas?.setActiveObject(object);
    }
  };

  useEffect(() => {
    if (canvas) {
      // TODO avoid re-rendering when snap guidelines are triggered
      canvas.on("object:added", updateLayers);
      canvas.on("object:removed", updateLayers);
      canvas.on("object:modified", (e) => {
        console.log("object:modified", e);
        updateLayers(e);
      });

      // fired by canvas.setActiveObject(object)
      // canvas.on("object:selected", updateLayers);

      canvas.on("selection:created", handleObjectSelected);
      canvas.on("selection:updated", handleObjectSelected);
      canvas.on("selection:cleared", clearObjectSelected);

      // updateLayers();
    }
    return () => {
      canvas?.off("object:added", updateLayers);
      canvas?.off("object:removed", updateLayers);
      canvas?.off("object:modified", updateLayers);

      canvas?.off("selection:created", handleObjectSelected);
      canvas?.off("selection:updated", handleObjectSelected);
      canvas?.off("selection:cleared", clearObjectSelected);
    };
  }, [canvas]);

  return (
    <div className="bg-background rounded shadow-md space-y-2">
      <div className="flex justify-between items-center p-2">
        <span>Layers</span>
        <span className="flex gap-1">
          <Button
            onClick={() => moveLayer(selectedLayer?.id, 1)}
            size="icon"
            disabled={!selectedLayer}
            className="[&_svg]:size-3 w-8 h-8"
          >
            <ArrowUpIcon />
          </Button>
          <Button
            onClick={() => moveLayer(selectedLayer?.id, -1)}
            size="icon"
            disabled={!selectedLayer}
            className="[&_svg]:size-3 w-8 h-8"
          >
            <ArrowDownIcon />
          </Button>
        </span>
      </div>
      <Separator />
      <ScrollArea className="h-[40vh] p-2">
        <ul className=" overflow-auto">
          {elements.map((layer) => (
            <LayerItem
              key={layer.id}
              hideLayer={hideLayer}
              lockLayer={lockLayer}
              removeLayer={removeLayer}
              layer={layer}
              selected={layer.id === selectedLayer?.id}
              onClick={() => {
                selectLayerInCanvas(layer.id);
              }}
            />
          ))}
        </ul>
      </ScrollArea>
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
} & ComponentProps<"li">;

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
        selected ? "bg-neutral-500/10" : ""
      } p-1 rounded flex justify-between items-center ${className || ""}`}
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
