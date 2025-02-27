import { Canvas, FabricObject, FabricObjectProps, Line } from "fabric";

const snappingDistance = 10;

export const handleObjectMoving = (canvas: Canvas, object: FabricObject) => {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // TODO: snap grid does not scale with zoom
  const left = object.left;
  const top = object.top;
  const right = left + object.width * object.scaleX;
  const bottom = top + object.height * object.scaleY;

  const centerX = left + (object.width * object.scaleX) / 2;
  const centerY = top + (object.height * object.scaleY) / 2;

  clearGuidelines(canvas);

  let snapped = false;

  if (Math.abs(left) < snappingDistance) {
    object.set("left", 0);
    if (!guidelineExists(canvas, "vertical-left")) {
      const line = createVerticalGuideline(canvas, 0, "vertical-left");
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(top) < snappingDistance) {
    object.set("top", 0);
    if (!guidelineExists(canvas, "horizontal-top")) {
      const line = createHorizontalGuideline(canvas, 0, "horizontal-top");
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(right - canvasWidth) < snappingDistance) {
    object.set("left", canvasWidth - object.width * object.scaleX);
    if (!guidelineExists(canvas, "vertical-right")) {
      const line = createVerticalGuideline(canvas, canvasWidth, "vertical-right");
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(bottom - canvasHeight) < snappingDistance) {
    object.set("top", canvasHeight - object.height * object.scaleY);
    if (!guidelineExists(canvas, "horizontal-bottom")) {
      const line = createHorizontalGuideline(canvas, canvasHeight, "horizontal-bottom");
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(centerX - canvasWidth / 2) < snappingDistance) {
    object.set("left", canvasWidth / 2 - (object.width * object.scaleX) / 2);
    if (!guidelineExists(canvas, "vertical-center")) {
      const line = createVerticalGuideline(canvas, canvasWidth / 2, "vertical-center");
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(centerY - canvasHeight / 2) < snappingDistance) {
    object.set("top", canvasHeight / 2 - (object.height * object.scaleY) / 2);
    if (!guidelineExists(canvas, "horizontal-center")) {
      const line = createHorizontalGuideline(canvas, canvasHeight / 2, "horizontal-center");
      canvas.add(line);
    }

    snapped = true;
  }

  if (!snapped) {
    clearGuidelines(canvas);
  }
  canvas.renderAll();
};

// TODO: Skip triggering "object" events for temp lines
const generateLine = (
  coords: [number, number, number, number],
  props: Partial<FabricObjectProps> = {}
) => {
  return new Line(coords, {
    stroke: "red",
    strokeWidth: 1,
    evented: false,
    selectable: false,
    hoverCursor: "default",
    hasControls: false,
    hasBorders: false,
    perPixelTargetFind: false,
    strokeDashArray: [5, 5],
    opacity: 0.5,
    ...props,
  });
};

export const createVerticalGuideline = (canvas: Canvas, x: number, id: string) => {
  return generateLine([x, 0, x, canvas.height], { id });
};

export const createHorizontalGuideline = (canvas: Canvas, y: number, id: string) => {
  return generateLine([0, y, canvas.width, y], { id });
};

export const clearGuidelines = (canvas: Canvas) => {
  const objects = canvas.getObjects("line");

  objects.forEach((object) => {
    if (isGuidelineObject(object)) {
      canvas.remove(object);
    }
  });
  canvas.renderAll();
};

const guidelineExists = (canvas: Canvas, id: string) => {
  const objects = canvas.getObjects("line");

  return objects.some((object) => object.id === id);
};

export const isGuidelineObject = (object: FabricObject) => {
  return object.id?.startsWith("horizontal-") || object.id?.startsWith("vertical-");
};
