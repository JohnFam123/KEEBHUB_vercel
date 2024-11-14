import { HfInference } from "@huggingface/inference";
import { auth } from '@/lib/auth'

export const POST = auth(async (req: any) => {
    const client = new HfInference("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")

    let out = "";

    const stream = client.chatCompletionStream({
    model: "Qwen/Qwen2.5-Coder-32B-Instruct",
    messages: [
        {
        role: "user",
        content: "What is the capital of France?"
        }
    ],
    max_tokens: 500
    });

    for await (const chunk of stream) {
    if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        out += newContent;
        console.log(newContent);
    }  
    }
}) as any
