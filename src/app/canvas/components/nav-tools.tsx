"use client";

import { useEffect, useState } from "react";

import {
  Canvas,
  FabricObject,
  TPointerEventInfo,
  TPointerEvent,
  PencilBrush,
  FabricImage,
  Shadow,
  Point,
  ImageFormat,
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

import Panel from "./panel";
import { useCanvas } from "../hooks/useCanvas";
import {
  cloneSelected,
  groupSelected,
  removeSelected,
  ungroupSelected,
} from "../utils/canvas/actions";
import { objectFactory } from "../utils/canvas/object-factory";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    strokeWidth: 0,
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

const exportCanvasAsImage =
  (canvas: Canvas | null) =>
  (format: ImageFormat, multiplier: 1 | 2 = 1) => {
    if (!canvas) return;
    const fileName = "canvas";

    const dataURL = canvas.toDataURL({
      multiplier,
      format,
      quality: 1,
    });

    if (!dataURL) return;

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = [fileName, format].join(".");
    link.click();
  };

const DRAW_SHAPES = {
  ELLIPSE: "ellipse",
  RECTANGLE: "rect",
  LINE: "line",
  SELECT: "select",
  PENCIL: "pencil",
} as const;

type DrawShapes = (typeof DRAW_SHAPES)[keyof typeof DRAW_SHAPES];

const NavTools = () => {
  const [canvas] = useCanvas();

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawShape, setDrawShape] = useState<FabricObject | null>(null);
  const [drawShapeType, setDrawShapeType] = useState<DrawShapes>(DRAW_SHAPES.SELECT);
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMoveDrawEllipse = (pointer: Point) => {
    drawShape?.set({
      rx: Math.abs(origin.x - pointer.x) / 2,
      ry: Math.abs(origin.y - pointer.y) / 2,
    });
    if (origin.x > pointer.x) {
      drawShape?.set({ left: pointer.x });
    }
    if (origin.y > pointer.y) {
      drawShape?.set({ top: pointer.y });
    }
  };
  const handleMouseMoveDrawRect = (pointer: Point) => {
    drawShape?.set({
      width: Math.abs(origin.x - pointer.x),
      height: Math.abs(origin.y - pointer.y),
    });
    if (origin.x > pointer.x) {
      drawShape?.set({ left: pointer.x });
    }
    if (origin.y > pointer.y) {
      drawShape?.set({ top: pointer.y });
    }
  };
  const handleMouseMoveDrawLine = (pointer: Point) => {
    drawShape?.set({ x2: pointer.x, y2: pointer.y });
  };
  const changeShapeType = (type: DrawShapes) => {
    if (drawShapeType === type || !canvas) return;

    setDrawShapeType(type);

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
  const clearCanvas = () => {
    if (!canvas) return;

    canvas.remove(...canvas.getObjects());
  };

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (event: TPointerEventInfo<TPointerEvent>) => {
      if (drawShapeType === DRAW_SHAPES.SELECT) return;

      setIsDrawing(true);

      if (canvas.isDrawingMode || drawShapeType === DRAW_SHAPES.PENCIL) return;

      const objectShape = objectFactory(drawShapeType);

      const pointer = canvas.getViewportPoint(event.e);

      if (objectShape.isType("line")) {
        objectShape.set({ x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y });
      } else {
        objectShape.left = pointer.x;
        objectShape.top = pointer.y;
      }

      setOrigin({ x: pointer.x, y: pointer.y });

      canvas.add(objectShape);
      setDrawShape(objectShape);
      canvas.requestRenderAll();
    };

    const handleMouseMove = (event: TPointerEventInfo<TPointerEvent>) => {
      // Pencil can not trigger custom mouse move,
      // otherwise, it will not update a canvas when drawing
      if (!isDrawing || canvas.isDrawingMode) return;

      const pointer = canvas.getViewportPoint(event.e);

      switch (drawShapeType) {
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

      if (drawShape) {
        canvas.setActiveObject(drawShape);
      }
      setIsDrawing(false);
      setDrawShape(null);
      setDrawShapeType(DRAW_SHAPES.SELECT);
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
  }, [canvas, drawShapeType, drawShape, isDrawing]);

  const exportAsImage = exportCanvasAsImage(canvas);

  return (
    <Panel className="flex p-2 gap-1 fixed left-1/2 -translate-x-1/2 top-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">File</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={clearCanvas}>New Project</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => exportAsImage("png")}>as PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsImage("png", 2)}>
                  as PNG 2x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsImage("jpeg")}>as JPG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsImage("jpeg", 2)}>
                  as JPG 2x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsImage("webp")}>as WEBP</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsImage("webp", 2)}>
                  as WEBP 2x
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={clearCanvas}>Clear Canvas</DropdownMenuItem>
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

      <ToggleGroup type="single" value={drawShapeType} onValueChange={changeShapeType}>
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
      <Button onClick={() => ungroupSelected(canvas)} variant="ghost" size="icon">
        <UngroupIcon />
      </Button>
      <Button onClick={() => cloneSelected(canvas)} variant="ghost" size="icon">
        <CopyIcon />
      </Button>
      <Button onClick={() => removeSelected(canvas)} variant="ghost" size="icon">
        <TrashIcon />
      </Button>
    </Panel>
  );
};

export default NavTools;
