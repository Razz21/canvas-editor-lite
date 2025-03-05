"use client";

import * as React from "react";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sliderTrackVariants = cva("relative w-full grow overflow-hidden rounded-full bg-accent", {
  variants: {
    size: {
      sm: "h-0.5",
      base: "h-1.5",
      medium: "h-2",
      large: "h-2.5",
    },
  },
  defaultVariants: {
    size: "base",
  },
});
const sliderThumbVariants = cva(
  "block rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        base: "h-4 w-4",
        medium: "h-5 w-5",
        large: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "base",
    },
  }
);

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
  VariantProps<typeof sliderTrackVariants>;

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, size, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className={cn(sliderTrackVariants({ size }))}>
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={cn(sliderThumbVariants({ size }))} />
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
