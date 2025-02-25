import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Canvas, CanvasOptions } from "fabric";
import { produce } from "immer";

export const INIT_CANVAS_OPTIONS = {
  width: 500,
  height: 500,
  backgroundColor: "#ffffff",
} satisfies Partial<CanvasOptions>;

interface CanvasState {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  options: Partial<CanvasOptions>;
  setOptions: (options: Partial<CanvasOptions>) => void;
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set) => ({
      canvas: null,
      setCanvas: (canvas) => set({ canvas }),
      options: INIT_CANVAS_OPTIONS,
      setOptions: (options) =>
        set(
          produce((draft) => {
            draft.options = { ...draft.options, ...options };
          })
        ),
    }),
    { name: "CanvasStore" }
  )
);

export const SHAPE_TYPES = {
  CIRCLE: "Circle",
  ELLIPSE: "Ellipse",
  GROUP: "Group",
  IMAGE: "Image",
  ITEXT: "I-Text",
  LINE: "Line",
  PATH: "Path",
  POLYGON: "Polygon",
  POLYLINE: "Polyline",
  RECT: "Rect",
  TEXT: "Text",
  TEXTBOX: "Textbox",
  TRIANGLE: "Triangle",
} as const;

export type ShapeType = (typeof SHAPE_TYPES)[keyof typeof SHAPE_TYPES];
