import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_UI_TAGS_ARRAY } from "@/constants/label";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface TagSelectorBarProps {
  activeTag?: string;
  onSelectTag?: (tag: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const TagSelectorBar = (props: TagSelectorBarProps) => {
  const { activeTag, onSelectTag, onNext, onPrev } = props;
  return (
    <div className="flex items-center justify-center p-4 rounded-lg gap-2">
      <Button variant="outline" size="icon" onClick={onPrev}>
        <ChevronLeftIcon size={14} />
      </Button>
      <div className="flex-1" />

      {DEFAULT_UI_TAGS_ARRAY.map((label, index) => (
        <Badge
          key={label.value}
          onClick={() => onSelectTag?.(label.value)}
          variant="outline"
          className={cn({
            "cursor-pointer transition-all": true,
            "bg-primary/10": activeTag === label.value,
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

