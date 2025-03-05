"use client";

import { useEffect, useState } from "react";

import { Canvas, CanvasOptions } from "fabric";
import { SettingsIcon } from "lucide-react";

import { INIT_CANVAS_OPTIONS, useCanvasStore } from "../stores/canvas-store";
import * as Controls from "./layer-settings/components/controls";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


export type CanvasSettingsPanelProps = {};

function CanvasSettingsPanel({}: CanvasSettingsPanelProps) {
  const canvas = useCanvasStore((state) => state.canvas);

  const [properties, setProperties] = useState<Partial<Canvas>>({
    ...INIT_CANVAS_OPTIONS,
  });

  useEffect(() => {
    if (!canvas) return;

    setProperties({
      ...INIT_CANVAS_OPTIONS,
      width: canvas?.getWidth(),
      height: canvas?.getHeight(),
      backgroundColor: canvas?.backgroundColor,
    });
  }, [canvas]);

  const updateCanvasConfig = (config: Partial<CanvasOptions>) => {
    const updatedConfig = { ...properties, ...config };

    canvas?.setDimensions(updatedConfig);
    canvas?.set(updatedConfig);

    setProperties(updatedConfig);

    canvas?.renderAll();
  };

  const handleValueChange =
    <Key extends keyof Canvas>(key: Key) =>
    (value: unknown) =>
      updateCanvasConfig({ [key]: value });

  return (
    <Controls.ControlGroup title="Canvas Settings">
      <Controls.ControlGrid>
        <Controls.ControlInput
          label="Width"
          value={properties.width ?? 0}
          onChange={handleValueChange("width")}
          unit="px"
        />
        <Controls.ControlInput
          label="Height"
          value={properties.height ?? 0}
          onChange={handleValueChange("height")}
          unit="px"
        />
        <Controls.ControlColor
          label="Color"
          value={properties.backgroundColor?.toString() ?? "#000000"}
          onChange={handleValueChange("backgroundColor")}
          withAlpha
        />
        <Button
          className="col-span-full"
          variant="secondary"
          onClick={() => updateCanvasConfig(INIT_CANVAS_OPTIONS)}
        >
          Reset
        </Button>
      </Controls.ControlGrid>
    </Controls.ControlGroup>
  );
}

function CanvasSettings() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="outline">
          <SettingsIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <CanvasSettingsPanel />
      </PopoverContent>
    </Popover>
  );
}

export default CanvasSettings;
