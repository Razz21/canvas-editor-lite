import { CanvasOptions } from "fabric";

export const SHAPE_TYPES = {
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  GROUP: "group",
  IMAGE: "image",
  ITEXT: "itext",
  LINE: "line",
  PATH: "path",
  POLYGON: "polygon",
  POLYLINE: "polyline",
  RECT: "rect",
  TEXT: "text",
  TEXTBOX: "textbox",
  TRIANGLE: "triangle",
} as const;

export const INIT_CANVAS_OPTIONS = {
  width: 500,
  height: 500,
  backgroundColor: "#ffffff",
} satisfies Partial<CanvasOptions>;

export type ShapeType = (typeof SHAPE_TYPES)[keyof typeof SHAPE_TYPES];

export type AlignmentDirection = "left" | "right" | "top" | "bottom" | "horizontal" | "vertical";
