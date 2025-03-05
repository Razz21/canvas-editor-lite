import { Canvas } from "fabric";
import { keyBy } from "lodash-es";
import { useHotkeys } from "react-hotkeys-hook";

import { useCanvasStore } from "../stores/canvas-store";
import * as actions from "../utils/canvas/actions";

type HotkeyAction = {
  hotkey: string;
  action: (canvas: Canvas | null) => void;
  name: string;
};

export const HOTKEY_ACTIONS = {
  REMOVE_SELECTED: { hotkey: "delete", action: actions.removeSelected, name: "Delete" },
  CLONE_SELECTED: { hotkey: "ctrl+d", action: actions.cloneSelected, name: "Duplicate" },
  GROUP_SELECTED: { hotkey: "ctrl+g", action: actions.groupSelected, name: "Group" },
  UNGROUP_SELECTED: { hotkey: "ctrl+u", action: actions.ungroupSelected, name: "Ungroup" },
  BRING_TO_FRONT: { hotkey: "ctrl+]", action: actions.bringToFront, name: "Bring to Front" },
  SEND_TO_BACK: { hotkey: "ctrl+[", action: actions.sendToBack, name: "Send to Back" },
  SELECT_ALL: { hotkey: "ctrl+a", action: actions.selectAll, name: "Select All" },
  DESELECT_ALL: { hotkey: "d", action: actions.deselectAll, name: "Deselect All" },
} as const satisfies Record<string, HotkeyAction>;

export const hotkeysNormalized = keyBy(HOTKEY_ACTIONS, "hotkey");

export function useCanvasHotkeys() {
  const canvas = useCanvasStore((state) => state.canvas);

  return useHotkeys(
    Object.keys(hotkeysNormalized),
    (_, { hotkey }) => {
      if (!canvas) return;

      const hotkeyWithAction = hotkeysNormalized[hotkey];

      if (!hotkeyWithAction) return;
      hotkeyWithAction.action(canvas);
    },
    { preventDefault: true }
  );
}
