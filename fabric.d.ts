declare module 'fabric' {
  interface FabricObject {
    name?: string;
    id?: string;
    zIndex?: number;
    prevOpacity?: number;
  }

  interface Canvas {
    updateZIndices: () => void;
  }
}
export {};
