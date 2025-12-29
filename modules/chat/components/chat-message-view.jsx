"use client"

import { useState } from "react";
import ChatWelcomeTabs from "./chat-welcom-tab";
import ChatMessageForm from "./chat-message-form";

export default function ChatMessageView({ user }) {
    const [selectedMessage, setSelectedMessage] = useState("");

    const handleMessageSelect = (message) => {
      setSelectedMessage(message);
    };

    const handleMessageChange = () => {
      setSelectedMessage("");
    };
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-10">
      <ChatWelcomeTabs
        userName={user?.name}
        onMessageSelect={handleMessageSelect}
      />
      <ChatMessageForm
        initialMessage={selectedMessage}
        onMessageChange={handleMessageChange}
      />
    </div>
  );
}