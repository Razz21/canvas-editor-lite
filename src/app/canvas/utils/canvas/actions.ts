import { ActiveSelection, Canvas, Group } from "fabric";

import { isActiveSelectionObject, isGroupObject } from "./common";

export const groupSelected = (canvas: Canvas | null) => {
  const activeObject = canvas?.getActiveObject();

  if (!(canvas && isActiveSelectionObject(activeObject))) {
    return;
  }

  const group = new Group(activeObject?.removeAll());

  canvas.add(group);
  canvas.setActiveObject(group);

  canvas.requestRenderAll();
};

export const ungroupSelected = (canvas: Canvas | null) => {
  const activeObject = canvas?.getActiveObject();

  if (!(canvas && isGroupObject(activeObject))) {
    return;
  }

  const selection = new ActiveSelection(activeObject.removeAll(), {});

  canvas.remove(activeObject);

  canvas.setActiveObject(selection);
  canvas.requestRenderAll();
};

export const cloneSelected = async (canvas: Canvas | null) => {
  const activeObject = canvas?.getActiveObject();

  if (!activeObject || !canvas) {
    return;
  }
  const cloned = await activeObject.clone();

  canvas?.discardActiveObject();

  cloned.set({
    left: activeObject.left + 10,
    top: activeObject.top + 10,
    evented: true,
  });
  cloned.id = `${activeObject.id}_copy`;

  if (cloned instanceof ActiveSelection) {
    // active selection needs a reference to the canvas.
    cloned.canvas = canvas;

    cloned.forEachObject((obj) => {
      canvas.add(obj);
    });
    // this should solve the unselectability
    cloned.setCoords();
  } else {
    canvas.add(cloned);
  }

  canvas.setActiveObject(cloned);
  canvas.requestRenderAll();
};

export const removeSelected = (canvas: Canvas | null) => {
  const activeObject = canvas?.getActiveObject();

  if (!activeObject || !canvas) {
    return;
  }

  if (activeObject instanceof Group) {
    // active selection needs a reference to the canvas.
    activeObject.canvas = canvas;

    activeObject.forEachObject((obj) => {
      canvas.remove(obj);
    });
  }
  canvas.remove(activeObject);
  canvas.discardActiveObject();

  canvas.requestRenderAll();
};

export const bringToFront = (canvas: Canvas | null) => {
  const selected = canvas?.getActiveObject();
  if (!selected) return;

  canvas?.bringObjectToFront(selected);
  canvas?.requestRenderAll();
  canvas?.fire("object:modified", { target: selected });
};

export const sendToBack = (canvas: Canvas | null) => {
  const selected = canvas?.getActiveObject();
  if (!selected) return;

  canvas?.sendObjectToBack(selected);
  canvas?.requestRenderAll();
  canvas?.fire("object:modified", { target: selected });
};

export const selectAll = (canvas: Canvas | null) => {
  if (!canvas) return;

  canvas.discardActiveObject();

  const selection = new ActiveSelection(canvas.getObjects(), {
    canvas: canvas,
  });
  canvas.setActiveObject(selection);
  canvas.requestRenderAll();
};

export const deselectAll = (canvas: Canvas | null) => {
  canvas?.discardActiveObject();
  canvas?.requestRenderAll();
};
