import { ImageItem } from "./ImageItem";
import { IBbox, IImageFile } from "@/schema/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ImageListProps {
  images?: IImageFile[];
  onImageSelect?: (name: string) => void;
  selectedImage?: IImageFile;
  activeBbox?: IBbox[];
  disabled?: boolean;
}

export const ImageList = (props: ImageListProps) => {
  const { images, onImageSelect, selectedImage, activeBbox, disabled } = props;
  return (
    <div className="rounded-lg flex flex-col h-full overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h3 className="font-semibold">Images</h3>
        <span className="text-sm text-muted-foreground">
          Total {images?.length}
        </span>
      </div>
      <ScrollArea
        className={cn(
          "flex flex-col flex-1 overflow-y-auto",
          "[&_[data-slot='scroll-area-viewport']>div]:py-3"
        )}
      >
        <div className="absolute top-0 w-full bg-gradient-to-b h-3 from-background/100" />
        <div className="absolute bottom-0 w-full bg-gradient-to-t h-3 from-background/100" />
        {images?.map(({key, ...imageProps}) => (
          <ImageItem
            key={key}
            {...imageProps}
            onClick={onImageSelect}
            isSelected={selectedImage?.key === key}
            tempBbox={selectedImage?.key === key ? activeBbox : undefined}
            disabled={disabled}
          />
        ))}
      </ScrollArea>
    </div>
  );
};
