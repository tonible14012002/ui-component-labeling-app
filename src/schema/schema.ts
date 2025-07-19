export type IBbox = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  author?: "manual" | "llm";
  score?: number;
};

export type IImageFile = {
  file: File;
  url?: string;
  name: string;
  groundTruth: IBbox[];
  isDone: boolean;
  size: number;
  extension?: string;
};