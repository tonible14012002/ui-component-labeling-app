import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IBbox, IImageFile } from "@/schema/schema";
import { formatReadableFileSize } from "@/utils/file";

interface ImageItemProps extends IImageFile {
  onClick?: (name: string) => void;
  isSelected?: boolean;
  tempBbox?: IBbox[];
}

export const ImageItem = (props: ImageItemProps) => {
  const {
    name,
    onClick,
    extension,
    size,
    isSelected,
    tempBbox,
    groundTruth,
    isDone,
  } = props;

  const handleClick = () => {
    onClick?.(name);
  };

  return (
    <div
      className={cn(
        "p-4 w-full items-center gap-2 hover:bg-accent/70 cursor-pointer rounded-lg",
        "transition-colors duration-200 ease-in-out",
        {
          "bg-accent": isSelected,
        }
      )}
      onClick={handleClick}
    >
      <div className="w-full">
        <h4 className="font-semibold text-sm line-clamp-1">{name}</h4>
        <p className="text-xs text-muted-foreground">
          {formatReadableFileSize(size)} bytes - {extension}
        </p>
      </div>
      <div className="flex gap-2 mt-1.5">
        {isDone && (
          <Badge>
            Done
          </Badge>
        )}
        <Badge variant="outline" className="bg-background">
          {tempBbox ? tempBbox.length : groundTruth?.length} labels
        </Badge>
      </div>
    </div>
  );
};
