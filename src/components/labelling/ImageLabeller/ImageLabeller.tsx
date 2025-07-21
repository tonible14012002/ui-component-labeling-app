import { Badge } from "@/components/ui/badge";
import { DEFAULT_UI_TAGS, getUiLabel } from "@/constants/label";
import { cn, createGenId } from "@/lib/utils";
import { IBbox } from "@/schema/schema";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { detectionService } from "@/apis/detection";
import { TagSelectorBar } from "./TagSelectorBar1";
import { LabellerToolbar } from "./LabellerToolbar";
import { MODE } from "./const";
import { useLabellerKeyBinding } from "./useKeyBinding";
import { useResponsiveCanvas } from "./useResponsiveCanvas";
import { getScaleFitImageToViewport, resizeBase64Image } from "@/utils/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ImageLabellerProps {
  selectedImageFile?: File;
  name?: string;
  bboxs?: IBbox[];
  onBboxChange?: (bboxs: IBbox[]) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onMarkDone?: () => void;
  showDoneButton?: boolean;
  isDetecting?: boolean;
  setIsDetecting?: (isDetecting: boolean) => void;
}

type ModeType = (typeof MODE)[keyof typeof MODE];

const bboxIdGen = createGenId();

export const ImageLabeller = (props: ImageLabellerProps) => {
  const {
    selectedImageFile,
    bboxs,
    onBboxChange,
    name,
    onNext,
    onPrev,
    onMarkDone,
    showDoneButton,
    isDetecting,
    setIsDetecting,
  } = props;
  const [activeTag, setActiveTag] = useState<string>(
    DEFAULT_UI_TAGS.BUTTON.value
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

  // current drawing box
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

  const hanldeAdjustScaleCenter = useCallback(
    (imgNaturalSize: { width: number; height: number }) => {
      if (!viewportRef.current || !imgWrapperRef.current) return;
      const viewPortSize = viewportRef.current.getBoundingClientRect();
      const { isFitHorizontal, scale: newScale } = getScaleFitImageToViewport({
        imgSize: imgNaturalSize,
        viewPortSize: {
          width: viewPortSize.width,
          height: viewPortSize.height,
        },
      });

      if (isFitHorizontal) {
        setScale(newScale);
        // center horizontally
        imgPos.current.x =
          viewPortSize.width / 2 - (imgNaturalSize.width * newScale) / 2;
        imgPos.current.y =
          (viewPortSize.height - imgNaturalSize.height * newScale) / 2;

        imgWrapperRef.current.style.left = `${imgPos.current.x}px`;
        imgWrapperRef.current.style.top = `${imgPos.current.y}px`;
      } else {
        setScale(newScale);
        // center vertically
        imgPos.current.y =
          (viewPortSize.height - imgNaturalSize.height * newScale) / 2;
        imgPos.current.x =
          (viewPortSize.width - imgNaturalSize.width * newScale) / 2;
        imgWrapperRef.current.style.left = `${imgPos.current.x}px`;
        imgWrapperRef.current.style.top = `${imgPos.current.y}px`;
      }
    },
    []
  );

  const handleImageLoad = useCallback(
    (image: HTMLImageElement) => {
      setImgNaturalSize({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setLoaded(true);
      // On First Load scale to fit the image
      hanldeAdjustScaleCenter({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    },
    [hanldeAdjustScaleCenter]
  );

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
      const label = `${box.label}_${index + 1} (${Math.round(
        (box.score || 0) * 100
      )}%)`;
      const labelWidth = ctx.measureText(label).width + 8;
      ctx.fillRect(box.x, box.y - 20, labelWidth, 20);

      // Label text
      ctx.fillStyle = "white";
      ctx.font = `${12 / scale}px Arial`;
      ctx.fillText(label, box.x + 4, box.y - 6);
    });
    // Draw current box being drawn
    if (isDrawing) {
      ctx.strokeStyle = getUiLabel(activeTag).color;
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
  }, [imageUrl, scale, bboxs, isDrawing, activeBbox?.key, activeTag]);

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
        key: String(bboxIdGen()),
        x: currentBoxPos.current.x,
        y: currentBoxPos.current.y,
        width: currentBoxPos.current.w,
        height: currentBoxPos.current.h,
        value: activeTag,
        label: getUiLabel(activeTag).label,
        author: "manual",
        score: 1,
      };
      onBboxChange?.([...(bboxs ?? []), newBox]);
    }
  }, [activeTag, bboxs, isDrawing, onBboxChange]);

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
        imgPos.current.x = newLeft;
        imgPos.current.y = newTop;

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
    hanldeAdjustScaleCenter(imgNaturalSize);
    drawBoxes();
  };

  const handleRemoveBox = (key: string) => {
    const newBboxs = bboxs?.filter((box) => box.key !== key);
    onBboxChange?.(newBboxs ?? []);
  };

  const handleDetection = () => {
    if (!selectedImageFile) {
      return;
    }
    const reader = new FileReader();
    reader.onload = async (_) => {
      const base64Str = reader.result as string;
      setIsDetecting?.(true);

      const MAX_VIEW_PORT = {
        width: 512,
        height: 512,
      };
      const { scale: resizeScale } = getScaleFitImageToViewport({
        imgSize: {
          width: imgNaturalSize.width,
          height: imgNaturalSize.height,
        },
        viewPortSize: MAX_VIEW_PORT,
      });

      const resizedImgUrl = await resizeBase64Image(
        base64Str,
        imgNaturalSize.width * resizeScale,
        imgNaturalSize.height * resizeScale
      );

      const resp = await detectionService.detect(
        resizedImgUrl as string,
        imgNaturalSize.width * resizeScale,
        imgNaturalSize.height * resizeScale
      );

      const detectedBboxes = resp.data.detection.map(
        (box) =>
          ({
            key: String(bboxIdGen()),
            x: box.x / resizeScale,
            y: box.y / resizeScale,
            width: box.width / resizeScale,
            height: box.height / resizeScale,
            label: box.label,
            value: box.value,
            author: "llm",
            score: box.score,
          } as IBbox)
      );
      onBboxChange?.([...(bboxs ?? []), ...detectedBboxes]);
      setIsDetecting?.(false);
    };

    reader.readAsDataURL(selectedImageFile);
  };

  const handleSelectTag = useCallback(
    (tag: string) => {
      setActiveTag(tag);
      // Click on label switch to drawing mode
      if (!isDrawing) {
        setCurrentMode(MODE.SELECT);
      }
    },
    [isDrawing]
  );

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

  useEffect(() => {
    // reset
    setLoaded(false);
    setIsDragging(false);
    setIsDrawing(false);

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl); // Clean up the object URL when the component unmounts or image changes
      }
    };
  }, [imageUrl]);

  useResponsiveCanvas({
    canvasRef: canvasRef,
    viewportRef: viewportRef,
    drawFunc: drawBoxes,
  });

  useLabellerKeyBinding({
    currentMode,
    setCurrentMode,
    isDrawing,
    onSelectTag: handleSelectTag,
  });

  return (
    <div className="w-full h-full flex">
      <LabellerToolbar
        handleDetection={handleDetection}
        handleReset={handleReset}
        handleResetPosition={handleResetPosition}
        setCurrentMode={setCurrentMode}
        currentMode={currentMode}
        onScaleDown={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
        onScaleUp={() => setScale((prev) => Math.min(prev + 0.1, 8))}
        isDetecting={isDetecting}
      />

      <div className="flex-1 h-full flex flex-col">
        <TagSelectorBar
          onNext={onNext}
          onPrev={onPrev}
          activeTag={activeTag}
          onSelectTag={handleSelectTag}
        />
        <div className="pb-1 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            Image size: {imgNaturalSize.width}x{imgNaturalSize.height}
            <span className="ml-2">Scale: {(scale * 100).toFixed(0)}%</span>
          </span>
          {showDoneButton && (
            <Button
              className="-my-3 ml-3 rounded-b-none"
              size="sm"
              onClick={onMarkDone}
            >
              Mark as Done
            </Button>
          )}
        </div>
        {isDetecting && <Progress indeterminate className="h-[4px]" />}
        <div
          className={cn("relative flex-1 bg-accent overflow-hidden border")}
          ref={viewportRef}
        >
          <canvas
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
                className={cn(
                  "pointer-events-none object-none transition-opacity",
                  {
                    // avoid showing flick during resizing img
                    "opacity-0": !loaded,
                    "opacity-100": loaded,
                  }
                )}
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
              {box.label}_{index + 1} ({Math.round((box.score || 0) * 100)}%)
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
