import {
  type FabricObject,
  type FabricObjectProps,
  Circle,
  CircleProps,
  Ellipse,
  Line,
  Rect,
  RectProps,
  Textbox,
} from "fabric";
import { EllipseProps } from "fabric";
import { TextboxProps } from "fabric";

import type { ShapeType } from "./constants";

export const defaultShapeOptions = {
  fill: "transparent",
  stroke: "black",
  strokeWidth: 2,
  selectable: true,
  hasControls: true,
  originX: "left",
  originY: "top",
} as const satisfies Partial<FabricObjectProps>;

export function createRect(options?: Partial<RectProps>) {
  return new Rect({
    ...defaultShapeOptions,
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    ...options,
  });
}
export function createCircle(options?: Partial<CircleProps>) {
  return new Circle({
    ...defaultShapeOptions,
    radius: 0,
    left: 0,
    top: 0,
    ...options,
  });
}
export function createEllipse(options?: Partial<EllipseProps>) {
  return new Ellipse({
    ...defaultShapeOptions,
    rx: 0,
    ry: 0,
    left: 0,
    top: 0,
    ...options,
  });
}
export function createTextBox(options?: Partial<TextboxProps>) {
  return new Textbox("Edit Text", {
    ...defaultShapeOptions,
    width: 100,
    fontSize: 20,
    fill: "#000000",
    lockScalingFlip: true,
    lockScalingX: false,
    lockScalingY: false,
    editable: true,
    fontFamily: "Arial",
    textAlign: "left",
    ...options,
  });
}

export function createLine(options?: Partial<FabricObjectProps>) {
  return new Line([0, 0, 0, 0], {
    ...defaultShapeOptions,
    ...options,
  });
}

const shapeCreators = {
  rect: createRect,
  circle: createCircle,
  ellipse: createEllipse,
  textbox: createTextBox,
  line: createLine,
} satisfies Partial<
  Record<ShapeType, <Options extends FabricObjectProps>(options?: Partial<Options>) => FabricObject>
>;

export const objectFactory = <
  Type extends keyof typeof shapeCreators,
  Options extends Parameters<(typeof shapeCreators)[Type]>[0]
>(
  type: Type,
  options?: Options
) => shapeCreators[type](options);
