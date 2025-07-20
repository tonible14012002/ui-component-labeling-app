import { Client } from "@/lib/client";
import fetcher from "@/lib/fetcher";
import { ResponseWithData } from "@/schema/response";
import { DetectionResponse } from "@/schema/schema";

class DetectionService extends Client {
  public detect(image: string, width: number, height: number) {
    return fetcher<ResponseWithData<DetectionResponse>>(
      `${this.baseUrl}/v1/detect`,
      {
        method: "POST",
        body: JSON.stringify({ imageUrl: image, width, height }),
      }
    );
  }
}

export const detectionService = new DetectionService();
