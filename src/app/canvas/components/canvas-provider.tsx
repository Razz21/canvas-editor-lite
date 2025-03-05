import { createContext, PropsWithChildren, useState } from "react";

import { Canvas } from "fabric";

export type CanvasContextType = [Canvas | null, (canvas: Canvas | null) => void];

export const CanvasContext = createContext<CanvasContextType>([null, () => {}]);

export const CanvasProvider = ({ children }: PropsWithChildren) => {
  const canvasState = useState<Canvas | null>(null);

  return <CanvasContext.Provider value={canvasState}>{children}</CanvasContext.Provider>;
};
