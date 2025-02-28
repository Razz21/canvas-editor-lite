import { ActiveSelection, FabricObject, Group } from "fabric";

export function isGroupObject(object: FabricObject | Group | null | undefined): object is Group {
  return !!object?.isType("group");
}

export function isActiveSelectionObject(
  object: FabricObject | Group | null | undefined
): object is ActiveSelection {
  return !!object?.isType("activeselection");
}
