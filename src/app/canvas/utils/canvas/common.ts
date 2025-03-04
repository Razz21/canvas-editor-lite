import { ActiveSelection, FabricObject, Group } from "fabric";

export function isGroupObject(object: FabricObject | Group | null | undefined): object is Group {
  return !!object && object?.isType("group");
}

export function isActiveSelectionObject(
  object: FabricObject | Group | null | undefined
): object is ActiveSelection {
  return !!object && object?.isType("activeselection");
}

export function isGroupOrSelectionObject(object: FabricObject | Group | null): object is Group {
  return isGroupObject(object) || isActiveSelectionObject(object);
}

export const maintainStrokeWidth = (object: FabricObject) => {
  const scaleX = object.scaleX || 1;
  const scaleY = object.scaleY || 1;

  object.set({
    width: object.width * scaleX,
    height: object.height * scaleY,
    scaleX: 1,
    scaleY: 1,
    strokeWidth: 1,
  });
  object.setCoords();
};

export const getBoundingBox = (objects: FabricObject[]) => {
  const minX = Math.min(...objects.map((obj) => obj.left ?? 0));
  const minY = Math.min(...objects.map((obj) => obj.top ?? 0));
  const maxX = Math.max(
    ...objects.map((obj) => (obj.left ?? 0) + (obj.width ?? 0) * (obj.scaleX ?? 1))
  );
  const maxY = Math.max(
    ...objects.map((obj) => (obj.top ?? 0) + (obj.height ?? 0) * (obj.scaleY ?? 1))
  );

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
