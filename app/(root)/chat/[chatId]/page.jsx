import ActiveChatLoader from "@/modules/messages/components/active-chat-loader";
import MessageViewWithForm from "@/modules/messages/components/message-view-form";
import React from "react";

const Page = async ({ params }) => {
  const { chatId } = await params;

  return (
    <>
      <ActiveChatLoader chatId={chatId} />

      <MessageViewWithForm chatId={chatId} />
    </>
  );
};

export default Page;
