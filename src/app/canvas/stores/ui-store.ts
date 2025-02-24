import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  activePanel: "properties" | "layers" | null;
  setActivePanel: (panel: UIState["activePanel"]) => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    activePanel: null,
    setActivePanel: (panel) => set({ activePanel: panel }),
  }))
);
