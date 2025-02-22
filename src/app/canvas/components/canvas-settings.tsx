'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Canvas } from 'fabric';
import { useState } from 'react';

export type CanvasSettingsProps = {
  canvas: Canvas | null;
};

type CanvasSettingsState = {
  width: number;
  height: number;
  backgroundColor: string;
};

const initSettings: CanvasSettingsState = {
  width: 500,
  height: 500,
  backgroundColor: '#ffffff',
};

function CanvasSettings({ canvas }: CanvasSettingsProps) {
  const [canvasConfig, setCanvasConfig] =
    useState<CanvasSettingsState>(initSettings);

  const updateCanvasConfig = (config: Partial<CanvasSettingsState>) => {
    const updatedConfig = { ...canvasConfig, ...config };
    canvas?.setDimensions(updatedConfig);
    canvas?.set(updatedConfig);

    setCanvasConfig(updatedConfig);

    canvas?.renderAll();
  };

  const handleChange =
    <Key extends keyof CanvasSettingsState>(
      key: Key,
      { numeric }: { numeric?: boolean } = {}
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.trim();
      let parsedValue: string | number | undefined = value;

      if (numeric) {
        parsedValue = clamp(parseIntValue(value), 1, Infinity);
      }

      updateCanvasConfig({ [key]: parsedValue });
    };

  return (
    <div className="flex flex-col gap-2 p-2 rounded bg-background">
      <Button onClick={() => updateCanvasConfig(initSettings)}>
        <span>Reset</span>
      </Button>
      <div className="flex flex-col gap-2">
        <Label>
          <span>Canvas Width</span>
          <Input
            type="number"
            value={canvasConfig.width}
            onChange={handleChange('width', { numeric: true })}
          />
        </Label>
        <Label>
          <span>Canvas Height</span>
          <Input
            type="number"
            value={canvasConfig.height}
            onChange={handleChange('height', { numeric: true })}
          />
        </Label>
        <Label>
          <span>Canvas Background</span>
          <Input
            value={canvasConfig.backgroundColor}
            type="color"
            onChange={handleChange('backgroundColor')}
          />
        </Label>
      </div>
    </div>
  );
}

export default CanvasSettings;

function parseIntValue(value: string | number): number {
  if (!value) return 0;

  return typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);
}

/**
 * Clamp value between an upper and lower bound.
 * @param {number} value input value
 * @param {number} min mininum value
 * @param {number} max maximum allowed value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
