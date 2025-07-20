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
  key: string
  file: File;
  url?: string;
  name: string;
  groundTruth: IBbox[];
  isDone: boolean;
  size: number;
  extension?: string;
};

export type DetectionResponse = {
  detection: LLMBBoxResponse[];
  // describe: string;
}

export type LLMBBoxResponse = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  author: "llm";
  score: number;
  reasoning?: string;
}

export type DetectRequestBody = {
  width: number;
  height: number;
  imageUrl: string
}