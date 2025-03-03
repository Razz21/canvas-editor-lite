"use client;";

import { PropsWithChildren, useEffect, useState } from "react";
import { useCanvasStore } from "../stores/canvas-store";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ActiveSelection, FabricObject } from "fabric";
import { isActiveSelectionObject, isGroupObject } from "../utils/canvas/common";
import { cloneSelected, groupSelected, unGroupSelected } from "../utils/canvas/actions";

export type CanvasContextMenuProps = PropsWithChildren & {};

function CanvasContextMenu({ children }: CanvasContextMenuProps) {
  const canvas = useCanvasStore((state) => state.canvas);
  const [selected, setSelected] = useState<FabricObject | undefined>(undefined);

  useEffect(() => {
    if (!canvas) return;

    canvas.on("contextmenu", (opts) => {
      setSelected(opts.target);

      if (opts.target) {
        canvas.setActiveObject(opts.target);
        canvas.requestRenderAll();
      }
    });
  }, [canvas]);

  const bringToFront = () => {
    if (!canvas) return;

    const selected = canvas.getActiveObject();
    if (!selected) return;

    canvas.bringObjectToFront(selected);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: selected });
  };

  const sendToBack = () => {
    if (!canvas) return;
    const selected = canvas.getActiveObject();
    if (!selected) return;

    canvas.sendObjectToBack(selected);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: selected });
  };

  const selectAll = () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    const selection = new ActiveSelection(canvas.getObjects(), {
      canvas: canvas,
    });
    canvas.setActiveObject(selection);
    canvas.requestRenderAll();
  };

  const deselectAll = () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const duplicate = () => cloneSelected(canvas);
  const deleteSelected = () => {
    if (!canvas) return;

    const selected = canvas.getActiveObject();
    if (!selected) return;

    canvas.remove(selected);
  };

  const group = () => groupSelected(canvas);
  const ungroup = () => unGroupSelected(canvas);

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset disabled={!selected} onClick={bringToFront}>
          Bring to Front
          <ContextMenuShortcut>ctrl + ]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled={!selected} onClick={sendToBack}>
          Send to Back
          <ContextMenuShortcut>ctrl + [</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem inset onClick={selectAll}>
          Select All
          <ContextMenuShortcut>ctrl + a</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={deselectAll}>
          Deselect All
          <ContextMenuShortcut>d</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem inset disabled={!isActiveSelectionObject(selected)} onClick={group}>
          Group
          <ContextMenuShortcut>ctrl + g</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled={!isGroupObject(selected)} onClick={ungroup}>
          Ungroup
          <ContextMenuShortcut>ctrl + u</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem inset disabled={!selected} onClick={duplicate}>
          Duplicate
          <ContextMenuShortcut>ctrl + d</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled={!selected} onClick={deleteSelected}>
          Delete
          <ContextMenuShortcut>del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default CanvasContextMenu;
