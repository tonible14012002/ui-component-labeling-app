import { useCallback, useEffect } from "react";
import { MODE } from "./const";
import { DEFAULT_UI_TAGS_ARRAY } from "@/constants/label";


interface UseKeyBindingArgs {
    currentMode: string;
    setCurrentMode: (mode: string) => void;
    isDrawing: boolean;
    onSelectTag: (tag: string) => void;
}

export const useLabellerKeyBinding = (args: UseKeyBindingArgs) => {
    const { currentMode, setCurrentMode, isDrawing, onSelectTag } = args;

  const handleShortcutEffect = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        if (currentMode === MODE.SELECT && !isDrawing) {
          setCurrentMode(MODE.PAN);
        }
      }
      try {
        const number = parseInt(e.key, 10);
        if (number >= 1 && number <= DEFAULT_UI_TAGS_ARRAY.length) {
          const index = number - 1;
          onSelectTag(DEFAULT_UI_TAGS_ARRAY[index].value);
        }
      } catch (_) {
        // Ignore non-number keys
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        // Reset to select mode on space release
        if (currentMode === MODE.PAN && !isDrawing) {
          setCurrentMode(MODE.SELECT);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentMode, isDrawing, setCurrentMode, onSelectTag]);

  useEffect(handleShortcutEffect, [handleShortcutEffect]);
}