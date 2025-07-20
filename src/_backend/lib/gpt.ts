import { ChatOpenAI } from "@langchain/openai";
import { OPENAI_API_KEY } from "../constants/envs";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { JsonOutputParser }  from "@langchain/core/output_parsers";
import { LLMBBoxResponse } from "@/schema/schema";

const model = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  temperature: 0.7,
  model: "gpt-4o-mini-2024-07-18",
});

const systemMessage = SystemMessagePromptTemplate.fromTemplate(`
    # 🧠 UI Labeller – System Prompt
    You are a **UI component Labeller**, a tool that analyzes design or mockup images and identifies specific UI components.
    Your task is to detect and return the following UI element types from the image with their bounding boxes and confidence scores:
    - 'button'
    - 'checkbox'  
    - 'input'  
    - 'dropdown'
    ---

    ## 📦 Output Format

    Return JSON output without any additional prefix of suffix text. The output should strictly follow the specified format below.
    Return a **list of detected UI elements**, where each element is an object containing:

    - 'value': One of 'button', 'checkbox', 'input', or 'dropdown'
    - 'label': One of 'Button', 'Checkbox', 'Input', or 'Dropdown'
    - 'x': The x-coordinate of the top-left corner of the bounding box
    - 'y': The y-coordinate of the top-left corner of the bounding box
    - 'width': The width of the bounding box
    - 'height': The height of the bounding box
    - 'author': Always "llm"
    - 'score': A confidence score between 0 and 1 indicating the model's certainty about the detection

    ## Important:
    - (origin '(0,0)' is the **top-left** corner of the image)

    ### ✅ Example output
    [
        {{
            "value": "button",
            "label": "Button",
            "x": 100,
            "y": 150,
            "width": 200,
            "height": 50,
            "author": "llm",
            "score": 0.95
        }},
        {{
            "value": "checkbox",
            "label": "Checkbox",
            "x": 300,
            "y": 200,
            "width": 20,
            "height": 20,
            "author": "llm",
            "score": 0.90
        }}
    ]
`);

const jsonParser = new JsonOutputParser<LLMBBoxResponse[]>()

// question and images
const humanMessage = HumanMessagePromptTemplate.fromTemplate(`
    Detect UI elements in the provided image.
    Image URL (base64 encoded): {image}
`);

const chatPrompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  humanMessage,
]);

const chain = RunnableSequence.from([
  chatPrompt,
  model,
  jsonParser
]);


export const gpt = {
  detectImage: async (image: string) => {
    const response = await chain.invoke({ image });
    return response;
  },
};
