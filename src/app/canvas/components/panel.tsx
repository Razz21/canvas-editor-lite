import { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PanelProps = { header?: ReactNode } & ComponentProps<"div">;

function Panel({ header, children, className, ...rest }: PanelProps) {
  return (
    <div
      className={cn("bg-background border-2 border-muted rounded-md overflow-hidden", className)}
      {...rest}
    >
      {header && (
        <div className="text-base p-4 bg-muted flex items-center justify-between h-14">
          {header}
        </div>
      )}
      {children}
    </div>
  );
}

export default Panel;
