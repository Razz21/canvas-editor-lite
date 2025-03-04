import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PanelProps = { title?: ReactNode } & ComponentProps<"div">;

function Panel({ title, children, className, ...rest }: PanelProps) {
  return (
    <div
      className={cn("bg-background border-2 border-muted rounded-md overflow-hidden", className)}
      {...rest}
    >
      {title && <div className="p-4 bg-muted flex items-center">{title}</div>}
      {children}
    </div>
  );
}

export default Panel;
