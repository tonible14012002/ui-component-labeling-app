import { ChatOpenAI } from "@langchain/openai";
import { OPENAI_API_KEY } from "../constants/envs";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { DetectionResponse } from "@/schema/schema";
import { HumanMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  temperature: 0.1,
  model: "gpt-4o-mini",
  verbose: true,
});

const systemMessage = SystemMessagePromptTemplate.fromTemplate(`
  ---
  # 🧠 UI Labeller – System Prompt
  You are a **UI Component Labeller**, a tool that analyzes UI design or mockup images and identifies specific UI components.
  Your task is to detect and return the following UI element types from the image along with **precise** bounding box coordinates (based on the image's **original resolution**) and confidence scores:

  - 'button'
  - 'checkbox'  
  - 'input'  
  - 'dropdown'

  ---
  ## ⚠️ Critical Instructions
  - **Do not** crop or resize the image, keep it in its original resolution.
  - The **(0, 0)** origin is at the **top-left corner** of the image.
  - The bounding box coordinates must be in **pixels** and relative to the **(0, 0)** origin.
  - The **x** coordinate increases to the right, and the **y** coordinate increases downwards. 
  - The bounding box should be as tight as possible around the detected element.
  - The x coordinate increases to the right, and the y coordinate increases downwards.
  - Do **not estimate or hallucinate** coordinates — they must reflect the real position within the image.
  - If unsure, omit the element rather than guessing the bounding box.
  ---

  ## 📦 Output Format
  Return **only** the JSON object (no explanations or extra text). The output should strictly follow this format:
  - 'value': One of 'button', 'checkbox', 'input', or 'dropdown'
  - 'label': Capitalized version of the value (e.g., "Button")
  - 'x', 'y': should be the integer pixels that represent the position of the top-left corner of the bounding box relative to the image's origin (0, 0).
  - 'width', 'height': Dimensions of the bounding box in pixels
  - 'author': Always '"llm'"
  - 'score': Confidence score from '0' to '1
  - 'reasoning': Explanation what it saw and why it made the detection.
  ---

  ### ✅ Example Output
  {{
    "detection": [
      {{
        "value": "button",
        "label": "Button",
        "x": 102,
        "y": 113,
        "width": 50,
        "height": 10,
        "author": "llm",
        "score": 0.95,
        "reasoning": "The button is labeled 'Submit'"
      }},
      {{
        "value": "checkbox",
        "label": "Checkbox",
        "x": 122,
        "y": 23,
        "width": 10,
        "height": 5,
        "author": "llm",
        "score": 0.90
        "reasoning": "The checkbox is checked and labeled 'Remember me'"
      }}
    ],
  }}
  ---
  ## Now analyze the attached base64 image above and return the output.
`);

const humanMessage = HumanMessagePromptTemplate.fromTemplate(`
{date}
- The image resolution is {width}×{height}. All bounding boxes must match this exact scale.
- Do not split, zoom, or internally resize the image.
`);

const jsonParser = new JsonOutputParser<DetectionResponse>();

const chatPrompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  humanMessage,
  new HumanMessage({
    content: [
      {
        type: "image_url",
        image_url: {
          url: "{image}",
        },
      },
    ],
  }),
]);

const chain = RunnableSequence.from([chatPrompt, model, jsonParser]);

export const gpt = {
  detectImage: async (image: string, width: number, height: number) => {
    const response = await chain.invoke({
      image,
      width,
      height,
      date: new Date().toISOString(),
    });
    return response;
  },
};
