import { Client } from "@/lib/client";
import fetcher from "@/lib/fetcher";
import { ResponseWithData } from "@/schema/response";
import { LLMBBoxResponse } from "@/schema/schema";

class DetectionService extends Client {
  public detect(image: string) {
    return fetcher<ResponseWithData<LLMBBoxResponse[]>>(`${this.baseUrl}/v1/detect`, {
      method: "POST",
      body: JSON.stringify({ imageUrl: image }),
    });
  }
}

export const detectionService = new DetectionService();
