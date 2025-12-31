import db from "@/lib/db";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
import { MessageRole, MessageType } from "@prisma/client";
import { convertToModelMessages, streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const provider = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

function convertStoreMessageToUI(msg) {
  try {
    const parts = JSON.parse(msg.content);
    const validParts = parts.filter((part) => part.type === "text");
    if (validParts.length === 0) return null;
    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase(),
      parts: validParts,
      createdAt: msg.createdAt,
    };
  } catch (error) {
    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase(),
      parts: [{ type: "text", text: msg.content }],
      createdAt: msg.createdAt,
    };
  }
}

function extractPartsAsJSON(message) {
  if (message.parts && Array.isArray(message.parts)) {
    return JSON.stringify(message.parts);
  }
  const content = message.content || "";
  return JSON.stringify([{ type: "text", text: content }]);
}

export async function POST(req) {
  try {
    const {
      chatId,
      messages: newMessages,
      model,
      skipMessage,
    } = await req.json();
    const previousMessages = chatId
      ? await db.message.findMany({
          where: {
            chatId,
          },
          orderBy: {
            createdAt: "asc",
          },
        })
      : [];

    const uiMessages = previousMessages
      .map(convertStoreMessageToUI)
      .filter((msg) => msg !== null);

    const normalizedNewMessages = Array.isArray(newMessages)
      ? newMessages
      : [newMessages];

    const allUIMessages = [...uiMessages, ...normalizedNewMessages];
    let modelMessages;
    try {
      modelMessages = await convertToModelMessages(allUIMessages);
    } catch (conversionError) {
      modelMessages = allUIMessages
        .map((msg) => ({
          role: msg.role,
          content: msg.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("\n"),
        }))
        .filter((m) => m.content);
    }
    const result = await streamText({
      model: provider.chat(model),
      messages: modelMessages,
      system: CHAT_SYSTEM_PROMPT,
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      originalMessages: allUIMessages,
      onFinish: async ({ responseMessage }) => {
        try {
          const messagesToSave = [];
          if (!skipMessage) {
            const latestUserMessage =
              normalizedNewMessages[normalizedNewMessages.length - 1];
            if (latestUserMessage.role === "user") {
              const userPartsJSON = extractPartsAsJSON(latestUserMessage);
              messagesToSave.push({
                chatId,
                content: userPartsJSON,
                messageRole: MessageRole.USER,
                model,
                messageType: MessageType.NORMAL,
              });
            }

            // Save assistant response
            if (responseMessage?.parts && responseMessage.parts.length > 0) {
              const assistantPartsJSON = extractPartsAsJSON(responseMessage);

              messagesToSave.push({
                chatId,
                content: assistantPartsJSON,
                messageRole: MessageRole.ASSISTANT,
                model,
                messageType: "NORMAL",
              });
            }

            if (messagesToSave.length > 0) {
              await db.message.createMany({
                data: messagesToSave,
              });
            }
          }
        } catch (error) {
          console.error("Error in saving messages", error);
        }
      },
    });
  } catch (error) {
    console.error("❌ API Route Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
