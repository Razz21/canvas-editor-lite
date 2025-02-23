declare module 'fabric' {
  interface FabricObject {
    name?: string;
    id?: string;
    zIndex?: number;
    prevOpacity?: number;
    locked?: boolean;
  }

  interface Canvas {
    updateZIndices: () => void;
  }
}
export {};
