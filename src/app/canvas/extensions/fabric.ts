import { Canvas } from "fabric";

declare module "fabric" {
  interface FabricObject {
    name?: string;
    id?: string;
    zIndex?: number;
    locked?: boolean;
  }

  interface Canvas {
    getObjectById: (id?: string | null) => FabricObject | undefined;
  }
}

Canvas.prototype.getObjectById = function (id) {
  if (!id) return undefined;

  return this.getObjects().find((object) => object.id === id);
};
