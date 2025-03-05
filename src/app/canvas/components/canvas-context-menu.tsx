"use client;";

import { PropsWithChildren, useEffect } from "react";

import { useCanvas } from "../hooks/useCanvas";
import { HOTKEY_ACTIONS } from "../hooks/useCanvasHotkeys";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const contextMenuItems = [
  HOTKEY_ACTIONS.BRING_TO_FRONT,
  HOTKEY_ACTIONS.SEND_TO_BACK,
  "separator",
  HOTKEY_ACTIONS.SELECT_ALL,
  HOTKEY_ACTIONS.DESELECT_ALL,
  "separator",
  HOTKEY_ACTIONS.GROUP_SELECTED,
  HOTKEY_ACTIONS.UNGROUP_SELECTED,
  "separator",
  HOTKEY_ACTIONS.CLONE_SELECTED,
  HOTKEY_ACTIONS.REMOVE_SELECTED,
];

export type CanvasContextMenuProps = PropsWithChildren & {};

function CanvasContextMenu({ children }: CanvasContextMenuProps) {
  const [canvas] = useCanvas();

  useEffect(() => {
    if (!canvas) return;

    canvas.on("contextmenu", (opts) => {
      if (opts.target) {
        canvas.setActiveObject(opts.target);
        canvas.requestRenderAll();
      }
    });
  }, [canvas]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {contextMenuItems.map((item, index) =>
          typeof item === "string" ? (
            <ContextMenuSeparator key={index} />
          ) : (
            <ContextMenuItem key={item.hotkey} inset onClick={() => item.action(canvas)}>
              {item.name}
              <ContextMenuShortcut>{item.hotkey}</ContextMenuShortcut>
            </ContextMenuItem>
          )
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default CanvasContextMenu;
