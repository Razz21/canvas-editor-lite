import { useContext } from "react";

import { CanvasContext } from "../components/canvas-provider";

export const useCanvas = () => {
  const contextValue = useContext(CanvasContext);
  if (!contextValue) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return contextValue;
};
