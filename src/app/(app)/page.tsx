"use client";

import { ContainerLayout } from "@/components/common/ContainerLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  DownloadIcon,
  FolderOpen,
  SparklesIcon,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LabellingView } from "@/components/labelling/LabellingView";
import { IImageFile } from "@/schema/schema";

export default function HomePage() {
  const [imageFiles, setImageFiles] = useState<IImageFile[]>();
  const [hideHeadBar, setHideHeadBar] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: File[]) => {
      setImageFiles(
        files.map((file) => ({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          groundTruth: [],
          predictions: [],
          extension: file.name.split(".").pop(),
          isDone: false,
        }))
      );
    },
    accept: {
      "image/*": [],
    },
  });

  const isSelectedFile = Boolean(imageFiles?.length);

  return (
    <ContainerLayout
      className={cn("flex-1 flex flex-col pt-8 pb-10 overflow-hidden")}
    >
      <div>
        <h1 className="text-3xl font-semibold">UI Labelling</h1>
        <div className="mt-1 flex justify-between">
          <p className="text-muted-foreground">
            Upload a folder of images and label them efficiently with keyboard
            shortcuts
          </p>
          {hideHeadBar && (
            <Button
              variant="outline"
              className="-my-2"
              size="sm"
              onClick={() => setHideHeadBar((prev) => !prev)}
            >
              <ChevronDown />
            </Button>
          )}
        </div>
      </div>
      <div
        className={cn("transition-all", {
          "h-12": !hideHeadBar,
          "h-0 opacity-0 pointer-none:": hideHeadBar,
        })}
      >
        <div className="flex gap-3 mt-4">
          <Button size="sm">
            <FolderOpen />
            Upload Folder
          </Button>
          <Button variant="secondary" size="sm">
            <SparklesIcon />
            Predict All
          </Button>
          <div className="flex-1" />
          <div className="w-[200px] flex items-center mr-4 gap-2">
            <span className="text-muted-foreground">Progress:</span>
            <Progress value={20} />
          </div>
          <Button variant="outline" size="sm">
            <DownloadIcon />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHideHeadBar((prev) => !prev)}
          >
            <ChevronUp />
          </Button>
        </div>
      </div>
      {isSelectedFile ? (
        <LabellingView images={imageFiles} onImagesChanged={setImageFiles} />
      ) : (
        <div className="bg-muted flex-1 w-full mt-6 rounded-lg flex flex-col items-center justify-center relative">
          <Card
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center justify-center px-8 gap-0 w-[500px] py-8",
              "hover:shadow-lg border transition-all duration-200 cursor-pointer",
              {
                "shadow-lg": isDragActive,
              }
            )}
          >
            <input
              {...getInputProps()}
              // @ts-expect-error -- webkitdirectory is not recognized by TypeScript
              webkitdirectory=""
              className="invisible"
            />
            <h6 className="text-lg font-semibold text-center">
              Upload Images Folder
            </h6>
            <p className="text-muted-foreground text-center mt-2">
              Drop a folder containing UI screenshots to start batch labeling or
              click button below
            </p>
            <Button className="mt-4" size="lg">
              <FolderOpen />
              Choose Folder
            </Button>
          </Card>
        </div>
      )}
    </ContainerLayout>
  );
}
