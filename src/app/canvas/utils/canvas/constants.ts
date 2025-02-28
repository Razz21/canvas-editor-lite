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

export type ShapeType = (typeof SHAPE_TYPES)[keyof typeof SHAPE_TYPES];
