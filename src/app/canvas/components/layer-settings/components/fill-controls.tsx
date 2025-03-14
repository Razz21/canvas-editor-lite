"use client;";

import { FabricObject } from "fabric";

import * as Controls from "./controls";

export type FillControlsProps = {
  properties: Partial<FabricObject>;
  handleValueChange: (key: keyof FabricObject) => (value: unknown) => void;
};

function FillControls({ handleValueChange, properties }: FillControlsProps) {
  return (
    <Controls.ControlGroup title="Fill">
      <Controls.ControlGrid>
        <Controls.ControlColor
          label="Color"
          value={properties.fill?.toString() ?? "#000000"}
          onChange={handleValueChange("fill")}
          withAlpha
        />
      </Controls.ControlGrid>
    </Controls.ControlGroup>
  );
}

export default FillControls;
