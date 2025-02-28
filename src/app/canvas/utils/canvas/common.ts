import { ActiveSelection, FabricObject, Group } from "fabric";

export function isGroupObject(object: FabricObject | Group | null | undefined): object is Group {
  return !!object?.isType("group");
}

export function isActiveSelectionObject(
  object: FabricObject | Group | null | undefined
): object is ActiveSelection {
  return !!object?.isType("activeselection");
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
