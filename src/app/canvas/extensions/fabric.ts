import { Canvas, FabricObject } from "fabric";

declare module "fabric" {
  interface FabricObject {
    name?: string;
    id?: string;
    locked?: boolean;
  }
  interface FabricObjectProps {
    name?: string;
    id?: string;
    locked?: boolean;
  }
  interface SerializedObjectProps {
    id?: string;
    name?: string;
  }
  interface Canvas {
    isDragging?: boolean;
    lastPosX?: number;
    lastPosY?: number;
    
    getObjectById: (id?: string | null) => FabricObject | undefined;
  }
}

Canvas.prototype.getObjectById = function (id) {
  if (!id) return undefined;

  return this.getObjects().find((object) => object.id === id);
};

FabricObject.customProperties = ["name", "id"];
