"use client";

import { ComponentType, SVGProps } from "react";
import {
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  AlignEndHorizontalIcon,
  AlignEndVerticalIcon,
  AlignStartHorizontalIcon,
  AlignStartVerticalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlignmentDirection } from "@/app/canvas/utils/canvas/constants";

const LAYER_ITEM_ICON_MAP = {
  left: AlignStartVerticalIcon,
  horizontal: AlignCenterVerticalIcon,
  right: AlignEndVerticalIcon,
  top: AlignStartHorizontalIcon,
  vertical: AlignCenterHorizontalIcon,
  bottom: AlignEndHorizontalIcon,
} satisfies Record<AlignmentDirection, ComponentType<SVGProps<SVGSVGElement>>>;

export type AlignmentControlProps = {
  onChange: (direction: AlignmentDirection) => void;
};

export function AlignmentControl({ onChange }: AlignmentControlProps) {
  return (
    <div className="flex gap-1 flex-wrap justify-between">
      {Object.entries(LAYER_ITEM_ICON_MAP).map(([key, Icon]) => (
        <Button
          key={key}
          onClick={() => onChange(key as AlignmentDirection)}
          size="icon"
          variant="ghost"
          className="flex-1"
        >
          <Icon />
        </Button>
      ))}
    </div>
  );
}
