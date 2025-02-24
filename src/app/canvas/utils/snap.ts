import { Canvas, FabricObject, Line } from "fabric";

const spappingDistance = 10;

export const handleObjectMoving = (canvas: Canvas, object: FabricObject) => {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const left = object.left;
  const top = object.top;
  const right = left + object.width * object.scaleX;
  const bottom = top + object.height * object.scaleY;

  const centerX = left + (object.width * object.scaleX) / 2;
  const centerY = top + (object.height * object.scaleY) / 2;

  const newGuidelines = [];
  clearGuidelines(canvas);

  let snapped = false;

  if (Math.abs(left) < spappingDistance) {
    object.set("left", 0);
    if (!guidelineExists(canvas, "vertical-left")) {
      const line = createVerticalGuideline(canvas, 0, "vertical-left");
      newGuidelines.push(line);
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(top) < spappingDistance) {
    object.set("top", 0);
    if (!guidelineExists(canvas, "horizontal-top")) {
      const line = createHorizontalGuideline(canvas, 0, "horizontal-top");
      newGuidelines.push(line);
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(right - canvasWidth) < spappingDistance) {
    object.set("left", canvasWidth - object.width * object.scaleX);
    if (!guidelineExists(canvas, "vertical-right")) {
      const line = createVerticalGuideline(canvas, canvasWidth, "vertical-right");
      newGuidelines.push(line);
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(bottom - canvasHeight) < spappingDistance) {
    object.set("top", canvasHeight - object.height * object.scaleY);
    if (!guidelineExists(canvas, "horizontal-bottom")) {
      const line = createHorizontalGuideline(canvas, canvasHeight, "horizontal-bottom");
      newGuidelines.push(line);
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(centerX - canvasWidth / 2) < spappingDistance) {
    object.set("left", canvasWidth / 2 - (object.width * object.scaleX) / 2);
    if (!guidelineExists(canvas, "vertical-center")) {
      const line = createVerticalGuideline(canvas, canvasWidth / 2, "vertical-center");
      newGuidelines.push(line);
      canvas.add(line);
    }

    snapped = true;
  }

  if (Math.abs(centerY - canvasHeight / 2) < spappingDistance) {
    object.set("top", canvasHeight / 2 - (object.height * object.scaleY) / 2);
    if (!guidelineExists(canvas, "horizontal-center")) {
      const line = createHorizontalGuideline(canvas, canvasHeight / 2, "horizontal-center");
      newGuidelines.push(line);
      canvas.add(line);
    }

    snapped = true;
  }

  if (!snapped) {
    clearGuidelines(canvas);
  }
  canvas.renderAll();
};

export const createVerticalGuideline = (canvas: Canvas, x: number, id: string) => {
  return new Line([x, 0, x, canvas.height], {
    id,
    stroke: "red",
    strokeWidth: 1,
    scalable: false,
    evented: false,
    strokeDashArray: [5, 5],
    opacity: 0.5,
  });
};

export const createHorizontalGuideline = (canvas: Canvas, y: number, id: string) => {
  return new Line([0, y, canvas.width, y], {
    id,
    stroke: "red",
    strokeWidth: 1,
    scalable: false,
    evented: false,
    strokeDashArray: [5, 5],
    opacity: 0.5,
  });
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
