import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_UI_LABELS,
  DEFAULT_UI_LABELS_ARRAY,
  getUiLabel,
} from "@/constants/label";
import { cn } from "@/lib/utils";
import { IBbox } from "@/schema/schema";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Crosshair,
  HandIcon,
  SquareDashedMousePointer,
  Trash,
  XIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { createIdGenerator } from "@/utils/id";

interface ImageLabellerProps {
  selectedImageFile?: File;
  name?: string;
  bboxs?: IBbox[];
  onBboxChange?: (bboxs: IBbox[]) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const MODE = {
  SELECT: "select",
  PAN: "pan",
};
type ModeType = (typeof MODE)[keyof typeof MODE];

const { gen: bboxIdGen } = createIdGenerator("_");

export const ImageLabeller = (props: ImageLabellerProps) => {
  const { selectedImageFile, bboxs, onBboxChange, name, onNext, onPrev } =
    props;
  const [activeLabel, setActiveLabel] = useState<string>(
    DEFAULT_UI_LABELS.BUTTON.value
  );
  const [currentMode, setCurrentMode] = useState<ModeType>(MODE.SELECT);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeBbox, setActiveBbox] = useState<IBbox | null>(null);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const prevMousePosRef = useRef({
    x: 0,
    y: 0,
  });
  const currentBoxPos = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  const [scale, setScale] = useState(1);

  const imageUrl = useMemo(() => {
    if (selectedImageFile) {
      return URL.createObjectURL(selectedImageFile);
    }
    return null;
  }, [selectedImageFile]);

  const [imgNaturalSize, setImgNaturalSize] = useState({
    width: 0,
    height: 0,
  });

  const imgPos = useRef<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const imgWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleImageLoad = useCallback((image: HTMLImageElement) => {
    setImgNaturalSize({
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
    setLoaded(true);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // check mode is not pan
      if (!canvasRef.current || !imgWrapperRef.current) return;
      if (currentMode === MODE.PAN) {
        // Pan mode
        setIsDragging(true);
        prevMousePosRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
        return;
      } else {
        // drawing mode
        const coords = getCanvasCoordinates(
          canvasRef.current,
          e.clientX,
          e.clientY,
          {
            x: imgPos.current.x,
            y: imgPos.current.y,
          },
          scale
        );
        setIsDrawing(true);
        currentBoxPos.current = {
          x: coords.x,
          y: coords.y,
          w: 0,
          h: 0,
        };
      }
    },
    [currentMode, imgWrapperRef, scale]
  );

  const drawBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageUrl) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(imgPos.current.x / scale, imgPos.current.y / scale);

    bboxs?.forEach((box, index) => {
      if (box.key === activeBbox?.key) {
        ctx.strokeStyle = "red";
      } else {
        ctx.strokeStyle = getUiLabel(box.value).color;
      }
      ctx.lineWidth = 2 / scale;
      ctx.setLineDash([]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Label background
      ctx.fillStyle = getUiLabel(box.value).color;
      const label = `${box.label}_${index} (${Math.round((box.score || 0) * 100)}%)`;
      const labelWidth = ctx.measureText(label).width + 8;
      ctx.fillRect(box.x, box.y - 20, labelWidth, 20);

      // Label text
      ctx.fillStyle = "white";
      ctx.font = `${12 / scale}px Arial`;
      ctx.fillText(label, box.x + 4, box.y - 6);
    });
    // Draw current box being drawn
    if (isDrawing) {
      ctx.strokeStyle = getUiLabel(activeLabel).color;
      ctx.lineWidth = 2 / scale;
      ctx.setLineDash([]);
      ctx.strokeRect(
        currentBoxPos.current.x,
        currentBoxPos.current.y,
        currentBoxPos.current.w,
        currentBoxPos.current.h
      );
    }
    ctx.restore();
  }, [imageUrl, scale, bboxs, isDrawing, activeBbox?.key, activeLabel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDrawing(false);

    if (
      isDrawing &&
      currentBoxPos.current.w != 0 &&
      currentBoxPos.current.h != 0
    ) {
      // Save the drawn box
      const newBox: IBbox = {
        key: bboxIdGen(),
        x: currentBoxPos.current.x,
        y: currentBoxPos.current.y,
        width: currentBoxPos.current.w,
        height: currentBoxPos.current.h,
        value: activeLabel,
        label: getUiLabel(activeLabel).label,
        author: "manual",
        score: 1,
      };
      onBboxChange?.([...(bboxs ?? []), newBox]);
    }
  }, [activeLabel, bboxs, isDrawing, onBboxChange]);

  const handleMouseMove: EventListener = useCallback(
    (e) => {
      const clientX = (e as MouseEvent).clientX;
      const clientY = (e as MouseEvent).clientY;
      const moveX = clientX - prevMousePosRef.current.x;
      const moveY = clientY - prevMousePosRef.current.y;

      if (currentMode === MODE.PAN) {
        if (!isDragging || !imgWrapperRef.current) return;

        // Handle dragging the image
        const initTop = getComputedStyle(imgWrapperRef.current).top
          ? parseFloat(getComputedStyle(imgWrapperRef.current).top)
          : 0;
        const initLeft = getComputedStyle(imgWrapperRef.current).left
          ? parseFloat(getComputedStyle(imgWrapperRef.current).left)
          : 0;

        const newTop = initTop + moveY;
        const newLeft = initLeft + moveX;

        imgWrapperRef.current.style.top = `${newTop}px`;
        imgWrapperRef.current.style.left = `${newLeft}px`;

        imgPos.current.x = initLeft + moveX;
        imgPos.current.y = initTop + moveY;

        prevMousePosRef.current = {
          x: clientX,
          y: clientY,
        };
        drawBoxes();
      } else {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();

        currentBoxPos.current.w =
          (clientX - rect.left - imgPos.current.x) / scale -
          currentBoxPos.current.x;
        currentBoxPos.current.h =
          (clientY - rect.top - imgPos.current.y) / scale -
          currentBoxPos.current.y;
        drawBoxes();
      }
    },
    [currentMode, drawBoxes, isDragging, scale]
  );

  const handleReset = () => {
    onBboxChange?.([]);
  };

  const handleResetPosition = () => {
    setScale(1);
    if (imgWrapperRef.current) {
      imgWrapperRef.current.style.top = "0px";
      imgWrapperRef.current.style.left = "0px";
      imgPos.current = { x: 0, y: 0 };
    }
    drawBoxes();
  };

  const handleRemoveBox = (key: string) => {
    const newBboxs = bboxs?.filter((box) => box.key !== key);
    onBboxChange?.(newBboxs ?? []);
  };

  const handleKeyBindings: KeyboardEventHandler<HTMLCanvasElement> = (e) => {
    if (e.key === "Escape") {
      setIsDrawing(false);
      setIsDragging(false);
      setActiveBbox(null);
      return;
    }
    // 1-9 to select label
    if (e.key >= "1" && Number(e.key) <= DEFAULT_UI_LABELS_ARRAY.length) {
      const index = parseInt(e.key, 10) - 1;
      if (index < DEFAULT_UI_LABELS_ARRAY.length) {
        setActiveLabel(DEFAULT_UI_LABELS_ARRAY[index].value);
      }
      return;
    }
  };

  useEffect(() => {
    if (!loaded) return;
    drawBoxes();
  }, [drawBoxes, loaded]);

  // Global events
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, imageUrl]);

  // Revoke Image if not used
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl); // Clean up the object URL when the component unmounts or image changes
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    // reset
    setLoaded(false);
    setIsDragging(false);
    setScale(1);
    setIsDrawing(false);
    if (imgWrapperRef.current) {
      imgWrapperRef.current.style.top = "0px";
      imgWrapperRef.current.style.left = "0px";
      imgPos.current = { x: 0, y: 0 };
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [imageUrl, imgWrapperRef]);

  useEffect(() => {
    if (!viewportRef.current || !canvasRef.current) return;

    const updateCanvasSize = () => {
      canvasRef.current!.width = viewportRef.current!.clientWidth;
      canvasRef.current!.height = viewportRef.current!.clientHeight;
    }

    updateCanvasSize();
    const viewportResizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    viewportResizeObserver.observe(viewportRef.current);

    return () => {
      viewportResizeObserver.disconnect();
    };

  }, []);

  return (
    <div className="w-full h-full flex">
      <div className="flex flex-col items-center pt-16 w-8 gap-3 mr-6 rounded-l-lg ml-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale((prev) => Math.min(prev + 0.1, 8))}
        >
          <ZoomIn size={14} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
        >
          <ZoomOut size={14} />
        </Button>

        <Button variant="outline" size="icon" onClick={handleResetPosition}>
          <Crosshair size={14} />
        </Button>

        <Button
          size="icon"
          variant={currentMode === MODE.PAN ? "default" : "outline"}
          onClick={() => setCurrentMode(MODE.PAN)}
        >
          <HandIcon size={14} />
        </Button>
        <Button
          size="icon"
          variant={currentMode === MODE.SELECT ? "default" : "outline"}
          onClick={() => setCurrentMode(MODE.SELECT)}
        >
          <SquareDashedMousePointer size={14} />
        </Button>
        <Button variant="destructive" size="icon" onClick={handleReset}>
          <Trash size={14} />
        </Button>
      </div>

      <div className="flex-1 h-full flex flex-col">
        <LabellerToolbar
          onNext={onNext}
          onPrev={onPrev}
          activeLabel={activeLabel}
          onSelectLabel={setActiveLabel}
        />
        <div
          className={cn("relative flex-1 bg-accent overflow-hidden")}
          ref={viewportRef}
        >
          <canvas
            // key={String(viewportSize.x) + String(viewportSize.y)}
            onKeyDown={handleKeyBindings}
            onMouseDown={handleMouseDown}
            ref={canvasRef}
            className={cn("absolute left-0 top-0 z-30")}
          />
          <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: imgNaturalSize.width,
              height: imgNaturalSize.height,
              scale,
              transformOrigin: "top left",
            }}
            ref={imgWrapperRef}
          >
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                onLoad={(e) => handleImageLoad(e.currentTarget)}
                style={{
                  width: imgNaturalSize.width,
                  height: imgNaturalSize.height,
                }}
                className="pointer-events-none object-none"
                src={imageUrl}
                alt={name || "Selected Image"}
              />
            )}
          </div>
        </div>
        <div className="flex items-center mt-3 rounded-lg h-8 gap-2 w-full overflow-x-auto">
          {bboxs?.map((box, index) => (
            <Badge
              onMouseEnter={() => setActiveBbox(box)}
              onMouseLeave={() => setActiveBbox(null)}
              key={box.key}
              variant="outline"
              className="cursor-pointer"
              onClick={() => handleRemoveBox(box.key)}
            >
              {box.label}_{index} ({Math.round((box.score || 0) * 100)}%)
              <div
                className="h-2 w-2 rounded-full ml-1"
                style={{ backgroundColor: getUiLabel(box.value).color }}
              />
              <XIcon size={14} />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

interface LabellerToolbarProps {
  activeLabel?: string;
  onSelectLabel?: (label: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const LabellerToolbar = (props: LabellerToolbarProps) => {
  const { activeLabel, onSelectLabel, onNext, onPrev } = props;
  return (
    <div className="flex items-center justify-center p-4 rounded-lg gap-2">
      <Button variant="outline" size="icon" onClick={onPrev}>
        <ChevronLeftIcon size={14} />
      </Button>
      <div className="flex-1" />

      {DEFAULT_UI_LABELS_ARRAY.map((label, index) => (
        <Badge
          key={label.value}
          onClick={() => onSelectLabel?.(label.value)}
          variant="outline"
          className={cn({
            "cursor-pointer transition-all": true,
            "bg-primary/10": activeLabel === label.value,
          })}
        >
          {index + 1}. {label.label}
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: label.color }}
          />
        </Badge>
      ))}
      <div className="flex-1" />
      <Button variant="outline" size="icon" onClick={onNext}>
        <ChevronRightIcon size={14} />
      </Button>
    </div>
  );
};

const getCanvasCoordinates = (
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  basePos: { x: number; y: number },
  scale: number
) => {
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  // Position relative to the image with scale applied
  const x = (clientX - rect.left - basePos.x) / scale;
  const y = (clientY - rect.top - basePos.y) / scale;
  return { x, y };
};
