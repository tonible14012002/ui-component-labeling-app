import { NextRequest, NextResponse } from "next/server";
import Ajv, { JSONSchemaType } from "ajv";
import { DetectionResponse, DetectRequestBody } from "@/schema/schema";
import { gpt } from "@/_backend/lib/gpt";
import { ResponseWithData } from "@/schema/response";
import { ErrorResponse } from "@/schema/error";

const postSchema: JSONSchemaType<DetectRequestBody> = ({
    type: "object",
    properties: {
        imageUrl: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
    },
    required: ["imageUrl", "width", "height"],
    additionalProperties: false,
})


export const POST = async (request: NextRequest) => {

    try {
        const body = await request.json();
        const validator = new Ajv().compile(postSchema);
        if (validator(body)) {
            const detections = await gpt.detectImage(body.imageUrl, body.width, body.height);
            return NextResponse.json({
                data: detections,
                status: 200,
            } as ResponseWithData<DetectionResponse>,
            {
                status: 200,
            })
        }
        throw new Error("Invalid request body");
    }
    catch (e) {
        console.error("[v1/detect]", e);
        return NextResponse.json({
            err: "Internal Server Error",
            status: 500,
        } as ErrorResponse, {
            status: 500,
        });
    }
}