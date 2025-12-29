"use server";

import db from "@/lib/db";
import { getCurrentUser } from "@/modules/authentication/actions";
import { MessageRole, MessageType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const createChatWithMessage = async (values) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }
    const { content, model } = values;
    if (!content || !content.trim()) {
      return { success: false, message: "Message content is required" };
    }

    const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
    const chat = await db.chat.create({
      data: {
        title,
        model,
        userId: user.id,
        messages: {
          create: {
            content,
            messageRole: MessageRole.USER,
            messageType: MessageType.TEXT,
            model,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      data: chat,
      message: "Chat created successfully",
    };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { success: false, message: "Failed to create chat" };
  }
};

export const getAllChats = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const chats = await db.chat.findMany({
      where: {
        userId: user.id,
      },
      include: {
        messages: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: chats,
      message: "Chat fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching chat:", error);
    return { success: false, message: "Failed to fetch chats" };
  }
};

export const deleteChat = async (chatId) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const chat = await db.chat.findUnique({
      where: {
        userId: user.id,
        id: chatId,
      },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      return {
        success: false,
        message: "Chat not found",
      };
    }

    await db.chat.delete({
      where: {
        id: chatId,
      },
    });
      
      revalidatePath("/");

    return {
      success: true,
      data: {},
      message: "Chat deleted successfully",
    };
  } catch (error) {
    console.error("Error fetching chat:", error);
    return { success: false, message: "Failed to fetch chats" };
  }
};
