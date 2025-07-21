import { Button } from "@/components/ui/button";
import {
  SparklesIcon,
  SquareDashedMousePointer,
  HandIcon,
  Trash,
  Crosshair,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { MODE } from "./const";

interface LabellerToolbarProps {
  handleDetection: () => void;
  handleReset: () => void;
  handleResetPosition: () => void;
  setCurrentMode: (mode: string) => void;
  currentMode: string;
  onScaleUp?: () => void;
  onScaleDown?: () => void;
  isDetecting?: boolean;
}

export const LabellerToolbar = (props: LabellerToolbarProps) => {
  const {
    handleDetection,
    handleReset,
    handleResetPosition,
    setCurrentMode,
    currentMode,
    onScaleDown,
    onScaleUp,
    isDetecting,
  } = props;
  return (
    <div className="flex flex-col items-center pt-16 w-8 gap-3 mr-6 rounded-l-lg ml-1">
      <Button
        size="icon"
        variant="outline"
        onClick={handleDetection}
        disabled={isDetecting}
        className="relative"
      >
        <SparklesIcon size={14} />
      </Button>

      <Button
        size="icon"
        variant={currentMode === MODE.SELECT ? "default" : "outline"}
        onClick={() => setCurrentMode(MODE.SELECT)}
      >
        <SquareDashedMousePointer size={14} />
      </Button>
      <Button
        size="icon"
        variant={currentMode === MODE.PAN ? "default" : "outline"}
        onClick={() => setCurrentMode(MODE.PAN)}
      >
        <HandIcon size={14} />
      </Button>
      <Button variant="destructive" size="icon" onClick={handleReset}>
        <Trash size={14} />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleResetPosition}
        className="mt-8"
      >
        <Crosshair size={14} />
      </Button>
      <Button variant="outline" size="icon" onClick={onScaleUp}>
        <ZoomIn size={14} />
      </Button>

      <Button variant="outline" size="icon" onClick={onScaleDown}>
        <ZoomOut size={14} />
      </Button>
    </div>
  );
};
