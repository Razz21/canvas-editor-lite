declare module 'fabric' {
  interface FabricObject {
    name?: string;
    id?: string;
    zIndex?: number;
  }

  interface Canvas {
    updateZIndices: () => void;
  }
}
export {};
