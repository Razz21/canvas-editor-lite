"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CanvasOptions } from "fabric";
import { INIT_CANVAS_OPTIONS, useCanvasStore } from "../stores/canvas-store";
import { useShallow } from "zustand/react/shallow";
import { clamp, parseIntValue } from "../utils/numbers";

export type CanvasSettingsProps = {};

function CanvasSettings({}: CanvasSettingsProps) {
  const { canvas, options, setOptions } = useCanvasStore(
    useShallow((state) => ({
      canvas: state.canvas,
      options: state.options,
      setOptions: state.setOptions,
    }))
  );

  const updateCanvasConfig = (config: Partial<CanvasOptions>) => {
    const updatedConfig = { ...options, ...config };

    canvas?.setDimensions(updatedConfig);
    canvas?.set(updatedConfig);

    setOptions(updatedConfig);

    canvas?.renderAll();
  };

  const handleChangeOption =
    <Key extends keyof CanvasOptions>(key: Key, { numeric }: { numeric?: boolean } = {}) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number | undefined = e.target.value.trim();

      if (numeric) {
        value = clamp(parseIntValue(value), 1, Infinity);
      }

      updateCanvasConfig({ [key]: value });
    };

  return (
    <div className="flex flex-col gap-2 p-2 rounded bg-background">
      <Button onClick={() => updateCanvasConfig(INIT_CANVAS_OPTIONS)}>
        <span>Reset</span>
      </Button>
      <div className="flex flex-col gap-2">
        <Label>
          <span>Canvas Width</span>
          <Input
            type="number"
            value={options.width}
            onChange={handleChangeOption("width", { numeric: true })}
          />
        </Label>
        <Label>
          <span>Canvas Height</span>
          <Input
            type="number"
            value={options.height}
            onChange={handleChangeOption("height", { numeric: true })}
          />
        </Label>
        <Label>
          <span>Canvas Background</span>
          <Input
            value={options.backgroundColor as string}
            type="color"
            onChange={handleChangeOption("backgroundColor")}
          />
        </Label>
      </div>
    </div>
  );
}

export default CanvasSettings;
