import { useEffect } from "react";

interface UseResponsiveCanvasArgs {
  canvasRef: React.RefObject<HTMLCanvasElement| null>;
  viewportRef: React.RefObject<HTMLDivElement |null> ;
  drawFunc: () => void;
}

export const useResponsiveCanvas = (args: UseResponsiveCanvasArgs) => {
  const { canvasRef, viewportRef, drawFunc } = args;
  
  useEffect(() => {
    const updateCanvasSize = () => {
        console.log("Updating canvas size");
      if (!viewportRef.current || !canvasRef.current) return;

      canvasRef.current.width = viewportRef.current.clientWidth;
      canvasRef.current.height = viewportRef.current.clientHeight;
      drawFunc();
    };

    updateCanvasSize();
    const viewportResizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    if (!viewportRef.current) return;

    viewportResizeObserver.observe(viewportRef.current);

    return () => {
      viewportResizeObserver.disconnect();
    };
  }, [drawFunc, canvasRef, viewportRef]);
};
