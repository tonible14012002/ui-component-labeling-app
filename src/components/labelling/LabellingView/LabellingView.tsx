import { cn } from "@/lib/utils";
import { ImageList } from "../ImageList";
import { ImageLabeller } from "../ImageLabeller";
import { IBbox, IImageFile } from "@/schema/schema";
import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LabellingViewProps {
  images?: IImageFile[];
  onImagesChanged?: (images: IImageFile[]) => void;
}

export const LabellingView = (props: LabellingViewProps) => {
  const { images, onImagesChanged } = props;

  const [selectedImage, setSelectedImage] = useState<IImageFile>();

  const [bboxs, setBboxs] = useState<IBbox[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    setBboxs(selectedImage?.groundTruth ?? []);
  }, [selectedImage]);

  useEffect(() => {
    if (images && images.length > 0 && !selectedImage) {
      setSelectedImage(images[0]);
    }
  }, [images, selectedImage]);

  const onSaveBbox = useCallback(
    (bboxes: IBbox[]) => {
      onImagesChanged?.(
        images?.map((img) => {
          if (img.key !== selectedImage?.key) return img;
          console.log("Saving bboxs for image:", img.name, bboxes);
          return {
            ...img,
            groundTruth: bboxes,
          };
        }) ?? []
      );
    },
    [images, onImagesChanged, selectedImage?.key]
  );

  const onSelectImage = useCallback(
    (name?: string) => {
      onSaveBbox(bboxs);
      if (!name) return;
      const image = images?.find((img) => img.name === name);
      if (image) {
        setSelectedImage(image);
      }
    },
    [bboxs, images, onSaveBbox]
  );

  const onNext = useCallback(() => {
    const currentIndex = images?.findIndex(
      (img) => img.name === selectedImage?.name
    );
    if (currentIndex !== undefined && currentIndex >= 0 && images) {
      const nextIndex = (currentIndex + 1) % images.length;
      onSelectImage(images[nextIndex].name);
    }
  }, [images, onSelectImage, selectedImage?.name]);

  const onPrev = useCallback(() => {
    const currentIndex = images?.findIndex(
      (img) => img.name === selectedImage?.name
    );
    if (currentIndex !== undefined && currentIndex >= 0 && images) {
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      onSelectImage(images[prevIndex].name);
    }
  }, [images, onSelectImage, selectedImage?.name]);

  return (
    <div
      className={cn("w-full mt-6 rounded-lg", {
        "flex-1 flex gap-8 overflow-hidden": !isMobile,
        "h-[90vh] flex flex-col gap-4": isMobile,
      })}
    >
      <div className="flex flex-col flex-3">
        <ImageLabeller
          selectedImageFile={selectedImage?.file}
          bboxs={bboxs}
          onBboxChange={setBboxs}
          onNext={onNext}
          onPrev={onPrev}
        />
      </div>
      {!isMobile && (
        <div className="w-full h-full flex-1 shrink-0 min-w-[300px]">
          <ImageList
            images={images}
            activeBbox={bboxs}
            onImageSelect={onSelectImage}
            selectedImage={selectedImage}
          />
        </div>
      )}
    </div>
  );
};
