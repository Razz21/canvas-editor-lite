"use client";

import { Button } from "@/components/ui/button";
import {
  Rect,
  Textbox,
  Circle,
  Canvas,
  FabricObject,
  TPointerEventInfo,
  TPointerEvent,
  Line,
  PencilBrush,
  Group,
  ActiveSelection,
} from "fabric";
import {
  CircleIcon,
  CropIcon,
  GroupIcon,
  MousePointer2Icon,
  PencilIcon,
  SlashIcon,
  SplineIcon,
  SquareIcon,
  TypeIcon,
  UngroupIcon,
} from "lucide-react";
import { useCanvasStore } from "../stores/canvas-store";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

function addRectangle(canvas: Canvas | null) {
  if (!canvas) return;

  const item = new Rect({
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

  const item = new Circle({
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

  const item = new Textbox("Edit Text", {
    width: 100,
    fontSize: 20,
    fill: "#000000",
    left: 10,
    top: 10,
    lockScalingFlip: true,
    lockScalingX: false,
    lockScalingY: false,
    editable: true,
    fontFamily: "Arial",
    textAlign: "left",
  });
  canvas.add(item);
  canvas.setActiveObject(item);
}
const maintainStrokeWidth = (object: FabricObject) => {
  const scaleX = object.scaleX || 1;
  const scaleY = object.scaleY || 1;

  object.set({
    width: object.width * scaleX,
    height: object.height * scaleY,
    scaleX: 1,
    scaleY: 1,
    strokeWidth: 1,
  });
  object.setCoords();
};
const addFrameToCanvas = (canvas: Canvas | null) => {
  if (!canvas) return;

  const nextIndex =
    Math.max(
      0,
      ...canvas
        .getObjects("rect")
        .filter((obj) => obj.id?.startsWith("frame_"))
        .map(({ id }) => parseInt(id?.split("_")[1] ?? "0"))
    ) + 1;

  const frameName = `Frame ${nextIndex}`;

  const frame = new Rect({
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    fill: "transparent",
    stroke: "#90EE90",
    strokeWidth: 1,
    selectable: true,
    evented: true,
    name: frameName,
  });
  frame.id = `frame_${nextIndex}`;

  canvas.add(frame);
  canvas.setActiveObject(frame);
  canvas.renderAll();

  frame.on("scaling", () => {
    maintainStrokeWidth(frame);
    canvas.renderAll();
  });

  frame.on("modified", () => {
    maintainStrokeWidth(frame);
    canvas.renderAll();
  });
};

function isGroupObject(object: FabricObject | Group | null | undefined): object is Group {
  return !!object?.isType("group");
}

function isActiveSelectionObject(
  object: FabricObject | Group | null | undefined
): object is ActiveSelection {
  return !!object?.isType("activeselection");
}

const groupSelected = (canvas: Canvas | null) => {
  const activeObject = canvas?.getActiveObject();

  if (!(canvas && isActiveSelectionObject(activeObject))) {
    return;
  }

  const group = new Group(activeObject?.removeAll());

  canvas.add(group);
  canvas.setActiveObject(group);

  canvas.requestRenderAll();
};

const unGroupSelected = (canvas: Canvas | null) => {
  const activeObject = canvas?.getActiveObject();

  if (!(canvas && isGroupObject(activeObject))) {
    return;
  }

  const selection = new ActiveSelection(activeObject.removeAll(), {});

  canvas.remove(activeObject);

  canvas.setActiveObject(selection);
  canvas.requestRenderAll();
};

// TODO: Reuse SHAPE_TYPES from canvas-store.ts
const SHAPES = {
  CIRCLE: "CIRCLE",
  RECTANGLE: "RECTANGLE",
  LINE: "LINE",
  PATH: "PATH",
  PENCIL: "PENCIL", // not shape
} as const;

type ShapeType = keyof typeof SHAPES;

const NavTools = () => {
  const canvas = useCanvasStore((state) => state.canvas);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [shape, setShape] = useState<FabricObject | null>(null);
  const [shapeType, setShapeType] = useState<ShapeType | string>("POINTER");
  const [originX, setOriginX] = useState<number>(0);
  const [originY, setOriginY] = useState<number>(0);

  const handleMouseDownCircle = (event: TPointerEventInfo<TPointerEvent>) => {
    const pointer = canvas?.getViewportPoint(event.e);
    if (!canvas || !pointer) return;

    const newCircle = new Circle({
      left: pointer.x,
      top: pointer.y,
      // originX: "left",
      // originY: "top",
      fill: "transparent",
      radius: 0,
      stroke: "black",
      strokeWidth: 2,
      selectable: true,
      hasControls: true,
    });
    setOriginX(pointer.x);
    setOriginY(pointer.y);
    canvas.add(newCircle);
    setShape(newCircle);
    setIsDrawing(true);
  };

  const handleMouseMoveCircle = (event: TPointerEventInfo<TPointerEvent>) => {
    if (isDrawing && shape && canvas) {
      const pointer = canvas.getViewportPoint(event.e);
      const radius = Math.hypot(pointer.x - originX, pointer.y - originY);
      shape.set({ radius });
      canvas.renderAll();
    }
  };

  const handleMouseUpCircle = (
    event: TPointerEventInfo<TPointerEvent> & { currentTarget?: FabricObject }
  ) => {
    setIsDrawing(false);
    setShape(null);
    setShapeType("POINTER");
    if (canvas) {
      canvas.defaultCursor = "default";
      if (event.currentTarget) {
        canvas.setActiveObject(event.currentTarget);
      }
    }
  };

  const handleMouseDownRect = (event: TPointerEventInfo<TPointerEvent>) => {
    const pointer = canvas?.getViewportPoint(event.e);

    if (!canvas || !pointer) return;

    const newObject = new Rect({
      left: pointer.x,
      top: pointer.y,
      originX: "left",
      originY: "top",
      width: 0,
      height: 0,
      fill: "transparent",
      stroke: "black",
      strokeWidth: 2,
      selectable: true,
      hasControls: true,
    });

    setOriginX(pointer.x);
    setOriginY(pointer.y);
    canvas.add(newObject);
    setShape(newObject);
    setIsDrawing(true);
  };

  const handleMouseMoveRect = (event: TPointerEventInfo<TPointerEvent>) => {
    if (isDrawing && shape && canvas) {
      const pointer = canvas.getViewportPoint(event.e);
      shape.set({
        width: Math.abs(originX - pointer.x),
        height: Math.abs(originY - pointer.y),
      });
      if (originX > pointer.x) {
        shape.set({ left: pointer.x });
      }
      if (originY > pointer.y) {
        shape.set({ top: pointer.y });
      }
      canvas.renderAll();
    }
  };

  const handleMouseDownLine = (event: TPointerEventInfo<TPointerEvent>) => {
    const pointer = canvas?.getViewportPoint(event.e);

    if (!canvas || !pointer) return;

    const newLine = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
      stroke: "black",
      strokeWidth: 2,
      selectable: true,
      hasControls: true,
    });
    canvas.add(newLine);
    setShape(newLine);
    setIsDrawing(true);
  };

  const handleMouseMoveLine = (event: TPointerEventInfo<TPointerEvent>) => {
    if (isDrawing && shape && canvas) {
      const pointer = canvas.getViewportPoint(event.e);

      shape.set({ x2: pointer.x, y2: pointer.y });
      canvas.renderAll();
    }
  };

  const handleMouseDownPencil = (event: TPointerEventInfo<TPointerEvent>) => {
    setIsDrawing(true);
  };

  const handleMouseMovePencil = (event: TPointerEventInfo<TPointerEvent>) => {};

  const handleMouseUpPencil = (
    event: TPointerEventInfo<TPointerEvent> & { currentTarget?: FabricObject }
  ) => {
    setIsDrawing(false);
    setShape(null);
    setShapeType("POINTER");
    if (canvas) {
      canvas.defaultCursor = "default";
      if (event.currentTarget) {
        canvas.setActiveObject(event.currentTarget);
      }
    }
  };

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (event: TPointerEventInfo<TPointerEvent>) => {
      switch (shapeType) {
        case SHAPES.CIRCLE:
          handleMouseDownCircle(event);
          break;
        case SHAPES.RECTANGLE:
          handleMouseDownRect(event);
          break;
        case SHAPES.LINE:
          handleMouseDownLine(event);
          break;
        case SHAPES.PENCIL:
          handleMouseDownPencil(event);
          break;
        // case SHAPES.PATH:
        //   handleMouseDownPath(event);
        //   break;
        default:
          break;
      }
    };

    const handleMouseMove = (event: TPointerEventInfo<TPointerEvent>) => {
      switch (shapeType) {
        case SHAPES.CIRCLE:
          handleMouseMoveCircle(event);
          break;
        case SHAPES.RECTANGLE:
          handleMouseMoveRect(event);
          break;
        case SHAPES.LINE:
          handleMouseMoveLine(event);
          break;
        case SHAPES.PENCIL:
          handleMouseMovePencil(event);
          break;
        // case SHAPES.PATH:
        //   handleMouseMovePath(event);
        //   break;
        default:
          break;
      }
    };

    const handleMouseUp = (event: TPointerEventInfo<TPointerEvent>) => {
      switch (shapeType) {
        case SHAPES.CIRCLE:
        case SHAPES.RECTANGLE:
        case SHAPES.LINE:
          handleMouseUpCircle(event);
          break;
        case SHAPES.PENCIL:
          handleMouseUpPencil(event);
          break;
        default:
          break;
      }
    };
    if (shapeType === SHAPES.PENCIL) {
      canvas.isDrawingMode = true;
    } else {
      canvas.isDrawingMode = false;
    }

    canvas?.on("mouse:down", handleMouseDown);
    canvas?.on("mouse:move", handleMouseMove);
    canvas?.on("mouse:up", handleMouseUp);

    return () => {
      if (canvas) {
        canvas.off("mouse:down", handleMouseDown);
        canvas.off("mouse:move", handleMouseMove);
        canvas.off("mouse:up", handleMouseUp);
      }
    };
  }, [canvas, shapeType, isDrawing, shape, originX, originY]);

  function setCurrentShapeType(value: ShapeType) {
    if (canvas) {
      if (value === SHAPES.PENCIL) {
        canvas.isDrawingMode = true;
        if (!(canvas.freeDrawingBrush instanceof PencilBrush)) {
          const pencil = new PencilBrush(canvas);
          pencil.color = "#000000";
          pencil.width = 5;
          canvas.freeDrawingBrush = pencil;
        }
      } else {
        canvas.isDrawingMode = false;
      }
    }
    setShapeType(value);
  }

  return (
    <div className="flex p-2 gap-1">
      <div className="flex gap-1">
        <Button onClick={() => addFrameToCanvas(canvas)} variant="ghost" size="icon">
          <CropIcon />
        </Button>
        <Button onClick={() => addRectangle(canvas)} variant="ghost" size="icon">
          <SquareIcon />
        </Button>
        <Button onClick={() => addCircle(canvas)} variant="ghost" size="icon">
          <CircleIcon />
        </Button>
        <Button onClick={() => addTextBox(canvas)} variant="ghost" size="icon">
          <TypeIcon />
        </Button>
        <Button onClick={() => groupSelected(canvas)} variant="ghost" size="icon">
          <GroupIcon />
        </Button>
        <Button onClick={() => unGroupSelected(canvas)} variant="ghost" size="icon">
          <UngroupIcon />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-auto" />

      <ToggleGroup type="single" value={shapeType} onValueChange={setCurrentShapeType}>
        <ToggleGroupItem value={"POINTER"} aria-label="pointer">
          <MousePointer2Icon />
        </ToggleGroupItem>
        <ToggleGroupItem value={SHAPES.CIRCLE} aria-label="circle">
          <CircleIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value={SHAPES.RECTANGLE} aria-label="rectangle">
          <SquareIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value={SHAPES.LINE} aria-label="line">
          <SlashIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value={SHAPES.PATH} aria-label="path">
          <SplineIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value={SHAPES.PENCIL} aria-label="pencil">
          <PencilIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default NavTools;
