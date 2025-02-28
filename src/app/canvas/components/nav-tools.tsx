"use client";

import { Button } from "@/components/ui/button";
import {
  Canvas,
  FabricObject,
  TPointerEventInfo,
  TPointerEvent,
  PencilBrush,
  FabricImage,
  Shadow,
  Point,
} from "fabric";
import {
  CircleIcon,
  CopyIcon,
  GroupIcon,
  ImageIcon,
  MousePointer2Icon,
  PencilIcon,
  SlashIcon,
  SquareIcon,
  TrashIcon,
  TypeIcon,
  UngroupIcon,
} from "lucide-react";
import { useCanvasStore } from "../stores/canvas-store";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { objectFactory } from "../utils/canvas/object-factory";
import {
  cloneSelected,
  groupSelected,
  removeSelected,
  unGroupSelected,
} from "../utils/canvas/actions";

function addRectangle(canvas: Canvas | null) {
  if (!canvas) return;

  const item = objectFactory("rect", {
    width: 100,
    height: 100,
    fill: "#000000",
    left: 10,
    top: 10,
  });
  canvas.add(item);
  canvas.setActiveObject(item);
}
function addCircle(canvas: Canvas | null) {
  if (!canvas) return;
  const item = objectFactory("circle", {
    radius: 50,
    fill: "#000000",
    left: 10,
    top: 10,
  });
  canvas.add(item);
  canvas.setActiveObject(item);
}
function addTextBox(canvas: Canvas | null) {
  if (!canvas) return;
  const item = objectFactory("textbox", {
    left: 10,
    top: 10,
  });
  canvas.add(item);
  canvas.setActiveObject(item);
}
function addImage(canvas: Canvas | null) {
  if (!canvas) return;

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = false;
  input.style.display = "none";
  input.onchange = () => {
    const files = Array.from(input.files || []);
    if (files.length === 0) {
      return;
    }
    const file = files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const image = new Image();
      image.src = typeof e.target?.result === "string" ? e.target.result : "";

      image.onload = function () {
        const img = new FabricImage(image, {
          left: 10,
          top: 10,
        });

        img.scaleToWidth(200);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
      };
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

const DRAW_SHAPES = {
  ELLIPSE: "ellipse",
  RECTANGLE: "rect",
  LINE: "line",
  SELECT: "select",
  PENCIL: "pencil",
} as const;

type DrawShapes = (typeof DRAW_SHAPES)[keyof typeof DRAW_SHAPES];

const NavTools = () => {
  const canvas = useCanvasStore((state) => state.canvas);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [shape, setShape] = useState<FabricObject | null>(null);
  const [shapeType, setShapeType] = useState<DrawShapes>(DRAW_SHAPES.SELECT);
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMoveDrawEllipse = (pointer: Point) => {
    shape?.set({
      rx: Math.abs(origin.x - pointer.x) / 2,
      ry: Math.abs(origin.y - pointer.y) / 2,
    });
    if (origin.x > pointer.x) {
      shape?.set({ left: pointer.x });
    }
    if (origin.y > pointer.y) {
      shape?.set({ top: pointer.y });
    }
  };
  const handleMouseMoveDrawRect = (pointer: Point) => {
    shape?.set({
      width: Math.abs(origin.x - pointer.x),
      height: Math.abs(origin.y - pointer.y),
    });
    if (origin.x > pointer.x) {
      shape?.set({ left: pointer.x });
    }
    if (origin.y > pointer.y) {
      shape?.set({ top: pointer.y });
    }
  };
  const handleMouseMoveDrawLine = (pointer: Point) => {
    shape?.set({ x2: pointer.x, y2: pointer.y });
  };
  const changeShapeType = (type: DrawShapes) => {
    if (shapeType === type || !canvas) return;

    setShapeType(type);

    if (!(canvas.freeDrawingBrush instanceof PencilBrush)) {
      const pencil = new PencilBrush(canvas);
      pencil.color = "#000000";
      pencil.width = 5;
      canvas.freeDrawingBrush = pencil;
      canvas.freeDrawingBrush.shadow = new Shadow({
        blur: 0,
        offsetX: 0,
        offsetY: 0,
        affectStroke: true,
        color: "#000000",
      });
    }
    canvas.isDrawingMode = type === DRAW_SHAPES.PENCIL;
  };

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (event: TPointerEventInfo<TPointerEvent>) => {
      if (shapeType === DRAW_SHAPES.SELECT) return;

      setIsDrawing(true);

      if (canvas.isDrawingMode || shapeType === DRAW_SHAPES.PENCIL) return;

      const objectShape = objectFactory(shapeType);

      const pointer = canvas.getViewportPoint(event.e);

      if (objectShape.isType("line")) {
        objectShape.set({ x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y });
      } else {
        objectShape.left = pointer.x;
        objectShape.top = pointer.y;
      }

      setOrigin({ x: pointer.x, y: pointer.y });

      canvas.add(objectShape);
      setShape(objectShape);
      canvas.requestRenderAll();
    };

    const handleMouseMove = (event: TPointerEventInfo<TPointerEvent>) => {
      // Pencil can not trigger custom mouse move,
      // otherwise, it will not update a canvas when drawing
      if (!isDrawing || canvas.isDrawingMode) return;

      const pointer = canvas.getViewportPoint(event.e);

      switch (shapeType) {
        case DRAW_SHAPES.ELLIPSE:
          handleMouseMoveDrawEllipse(pointer);
          break;
        case DRAW_SHAPES.RECTANGLE:
          handleMouseMoveDrawRect(pointer);
          break;
        case DRAW_SHAPES.LINE:
          handleMouseMoveDrawLine(pointer);
          break;
        default:
          break;
      }
      canvas.requestRenderAll();
    };

    const handleMouseUp = (_event: TPointerEventInfo<TPointerEvent>) => {
      if (!isDrawing) return;

      if (shape) {
        canvas.setActiveObject(shape);
      }
      setIsDrawing(false);
      setShape(null);
      setShapeType(DRAW_SHAPES.SELECT);
      canvas.isDrawingMode = false; // Pencil
    };
    const selectLastPath = ({ path }: { path: FabricObject }) => {
      canvas.setActiveObject(path);
    };

    canvas.on("mouse:down:before", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("path:created", selectLastPath);

    return () => {
      if (canvas) {
        canvas.off("mouse:down:before", handleMouseDown);
        canvas.off("mouse:move", handleMouseMove);
        canvas.off("mouse:up", handleMouseUp);
        canvas.off("path:created", selectLastPath);
      }
    };
  }, [canvas, shapeType, shape, isDrawing]);

  return (
    <div className="flex p-2 gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">File</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>New Project</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>as PNG</DropdownMenuItem>
                <DropdownMenuItem>as PNG 2x</DropdownMenuItem>
                <DropdownMenuItem>as JPG</DropdownMenuItem>
                <DropdownMenuItem>as SVG</DropdownMenuItem>
                <DropdownMenuItem>as PDF</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Clear Canvas</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-auto" />

      <Button onClick={() => addRectangle(canvas)} variant="ghost" size="icon">
        <SquareIcon />
      </Button>
      <Button onClick={() => addCircle(canvas)} variant="ghost" size="icon">
        <CircleIcon />
      </Button>
      <Button onClick={() => addTextBox(canvas)} variant="ghost" size="icon">
        <TypeIcon />
      </Button>
      <Button onClick={() => addImage(canvas)} variant="ghost" size="icon">
        <ImageIcon />
      </Button>

      <Separator orientation="vertical" className="h-auto" />

      <ToggleGroup type="single" value={shapeType} onValueChange={changeShapeType}>
        <ToggleGroupItem value={DRAW_SHAPES.SELECT}>
          <MousePointer2Icon />
        </ToggleGroupItem>
        <ToggleGroupItem value={DRAW_SHAPES.PENCIL}>
          <PencilIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value={DRAW_SHAPES.ELLIPSE}>
          <CircleIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value={DRAW_SHAPES.RECTANGLE}>
          <SquareIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value={DRAW_SHAPES.LINE}>
          <SlashIcon />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="h-auto" />

      <Button onClick={() => groupSelected(canvas)} variant="ghost" size="icon">
        <GroupIcon />
      </Button>
      <Button onClick={() => unGroupSelected(canvas)} variant="ghost" size="icon">
        <UngroupIcon />
      </Button>
      <Button onClick={() => cloneSelected(canvas)} variant="ghost" size="icon">
        <CopyIcon />
      </Button>
      <Button onClick={() => removeSelected(canvas)} variant="ghost" size="icon">
        <TrashIcon />
      </Button>
    </div>
  );
};

export default NavTools;
