"use client;";

import { Button } from "@/components/ui/button";
import { FabricObject, Group } from "fabric";
import { ComponentProps, ComponentType, useCallback, useEffect, useState } from "react";
import {
  EyeIcon,
  TrashIcon,
  LockIcon,
  LockOpenIcon,
  EyeOffIcon,
  CircleIcon,
  TypeIcon,
  SquareIcon,
  SlashIcon,
  CircleHelpIcon,
  SplineIcon,
  LayersIcon,
  ImageIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useCanvasStore } from "../stores/canvas-store";
import { useElementsStore } from "../stores/elements-store";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";
import { clamp } from "../utils/numbers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import { ShapeType } from "../utils/canvas/constants";
import Panel from "./panel";

export type LayerProps = {};

const isObjectInGroup = (object: FabricObject): boolean => {
  return !!object.group?.isType("group");
};

function Layers({}: LayerProps) {
  const canvas = useCanvasStore((state) => state.canvas);

  const { elements, setElements } = useElementsStore(
    useShallow((state) => ({
      elements: state.elements,
      setElements: state.setElements,
    }))
  );

  const [selectedLayers, setSelectedLayers] = useState<FabricObject["id"][]>([]);

  const lockLayer = (element: FabricObject) => {
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
  };

  const hideLayer = useCallback(
    (element: FabricObject) => {
      const object = canvas?.getObjectById(element.id);

      if (!object) return;

      object.set({
        visible: !object.visible,
      });
      // <object:modified> event is not triggered when setting "visible" property
      // trigger <object:modified> event manually to update layers
      canvas?.fire("object:modified", { target: object });
    },
    [canvas]
  );

  const removeLayer = useCallback(
    (element: FabricObject) => {
      const object = canvas?.getObjectById(element.id);

      if (!object) return;

      canvas?.remove(object);
      canvas?.requestRenderAll();
    },
    [canvas]
  );

  const moveLayers = (direction: number) => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    const layers = canvas.getActiveObjects();

    // Sort layers based on direction
    layers.sort((a, b) => {
      const indexA = objects.indexOf(a);
      const indexB = objects.indexOf(b);
      return direction > 0 ? indexB - indexA : indexA - indexB;
    });

    layers.forEach((object) => {
      const currentIndex = objects.indexOf(object);
      const newIndex = clamp(currentIndex + direction, 0, objects.length - 1);

      if (currentIndex !== newIndex) {
        canvas.moveObjectTo(object, newIndex);
      }
    });

    canvas.requestRenderAll();
    updateLayers();
  };
  const updateLayers = <UpdateEvent extends { target: FabricObject }>(event?: UpdateEvent) => {
    console.log("updateLayers", event);
    if (!canvas) return;

    const objects = canvas.getObjects();
    const filteredObjects = objects.filter((obj) => !isObjectInGroup(obj));

    setElements([...filteredObjects].reverse());
    canvas.requestRenderAll();
  };

  const clearObjectSelected = (e: { deselected: FabricObject[] }) => {
    const newSelectedLayers = selectedLayers.filter(
      (id) => !e.deselected.map((obj) => obj.id).includes(id)
    );

    setSelectedLayers(newSelectedLayers);
  };

  const handleObjectSelected = <
    SelectionEvent extends { selected: FabricObject[]; deselected: FabricObject[] }
  >(
    e: SelectionEvent
  ) => {
    const newSelectedLayers = selectedLayers
      .filter((id) => !e.deselected.map((obj) => obj.id).includes(id))
      .concat(e.selected.map((obj) => obj.id));

    setSelectedLayers(newSelectedLayers);
  };

  const selectLayerInCanvas = (id: FabricObject["id"]) => {
    const object = canvas?.getObjectById(id) ?? null;

    if (object) {
      if (!object.id) {
        console.error("Object with no id found", object);
      }
      setSelectedLayers([object.id]);
      canvas?.setActiveObject(object);
      canvas?.requestRenderAll();
    }
  };

  useEffect(() => {
    if (canvas) {
      canvas.on("object:added", updateLayers);
      canvas.on("object:removed", updateLayers);
      canvas.on("object:modified", updateLayers);

      canvas.on("selection:created", handleObjectSelected);
      canvas.on("selection:updated", handleObjectSelected);
      canvas.on("selection:cleared", clearObjectSelected);
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
    <Panel
      header={
        <>
          <span>Layers</span>
          <span className="flex gap-1">
            <Button
              onClick={() => moveLayers(1)}
              size="icon"
              variant="outline"
              disabled={!selectedLayers.length}
              className="w-8 h-8"
            >
              <ChevronUpIcon />
            </Button>
            <Button
              onClick={() => moveLayers(-1)}
              size="icon"
              variant="outline"
              disabled={!selectedLayers.length}
              className="w-8 h-8"
            >
              <ChevronDownIcon />
            </Button>
          </span>
        </>
      }
      className="w-72 fixed top-20 left-4"
    >
      <Separator />
      <ScrollArea className="h-[40vh] p-2">
        <LayerTree
          layers={elements}
          hideLayer={hideLayer}
          lockLayer={lockLayer}
          removeLayer={removeLayer}
          selectedLayers={selectedLayers}
          selectLayerInCanvas={selectLayerInCanvas}
        />
      </ScrollArea>
    </Panel>
  );
}

export default Layers;

const LAYER_ITEM_ICON_MAP = {
  circle: CircleIcon,
  ellipse: CircleIcon,
  textbox: TypeIcon,
  rect: SquareIcon,
  line: SlashIcon,
  path: SplineIcon,
  group: LayersIcon,
  image: ImageIcon,
  // default icon
  default: CircleHelpIcon,
} satisfies Partial<
  Record<Lowercase<ShapeType> | "default", ComponentType<React.SVGProps<SVGSVGElement>>>
>;

function getIconForLayer(type: string) {
  return (
    LAYER_ITEM_ICON_MAP[type as keyof typeof LAYER_ITEM_ICON_MAP] || LAYER_ITEM_ICON_MAP.default
  );
}

type LayerTreeProps = {
  layers: FabricObject[];
  selectedLayers: FabricObject["id"][];
  lockLayer: (element: FabricObject) => void;
  hideLayer: (element: FabricObject) => void;
  removeLayer: (element: FabricObject) => void;
  selectLayerInCanvas: (id: FabricObject["id"]) => void;
} & ComponentProps<"ul">;

function LayerTree({
  layers,
  hideLayer,
  lockLayer,
  removeLayer,
  selectedLayers,
  selectLayerInCanvas,
  className = "",
}: LayerTreeProps) {
  return (
    <ul className={`overflow-auto ${className}`}>
      {layers.map((layer) => (
        <LayerTreeItem
          key={layer.id}
          hideLayer={hideLayer}
          lockLayer={lockLayer}
          removeLayer={removeLayer}
          layer={layer}
          selected={selectedLayers.includes(layer.id)}
          onClick={() => {
            selectLayerInCanvas(layer.id);
          }}
        >
          {layer.type === "group" ? (
            <LayerTree
              className="pl-4"
              layers={(layer as Group).getObjects()}
              hideLayer={hideLayer}
              lockLayer={lockLayer}
              removeLayer={removeLayer}
              selectedLayers={[]}
              selectLayerInCanvas={selectLayerInCanvas}
            />
          ) : null}
        </LayerTreeItem>
      ))}
    </ul>
  );
}

type LayerTreeItemProps = {
  layer: FabricObject;
  selected: boolean;
  lockLayer: (element: FabricObject) => void;
  hideLayer: (element: FabricObject) => void;
  removeLayer: (element: FabricObject) => void;
} & ComponentProps<"li">;

function LayerTreeItem({
  selected,
  hideLayer,
  layer,
  lockLayer,
  removeLayer,
  children,
  ...rest
}: LayerTreeItemProps) {
  const Icon = getIconForLayer(layer.type);

  return (
    <li {...rest}>
      <div
        className={`${
          selected ? "bg-neutral-500/10" : ""
        } flex justify-between items-center p-1 rounded `}
      >
        <div className="flex gap-2 items-center capitalize text-sm">
          <span>{<Icon size="16" />}</span>
          <span>{layer.name}</span>
        </div>
        <div className="flex gap-1">
          <Toggle
            onClick={(e) => {
              e.stopPropagation();
              lockLayer(layer);
            }}
            size="sm"
            variant="default"
            pressed={layer.locked === true}
          >
            {layer.locked === true ? <LockIcon /> : <LockOpenIcon />}
          </Toggle>
          <Toggle
            onClick={(e) => {
              e.stopPropagation();
              hideLayer(layer);
            }}
            size="sm"
            variant="default"
            pressed={layer.visible !== true}
          >
            {layer.visible ? <EyeIcon /> : <EyeOffIcon />}
          </Toggle>
          <Toggle
            onClick={(e) => {
              e.stopPropagation();
              removeLayer(layer);
            }}
            size="sm"
            variant="default"
          >
            <TrashIcon />
          </Toggle>
        </div>
      </div>
      {children}
    </li>
  );
}
