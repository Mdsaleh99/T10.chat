import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { getCurrentUser } from "@/modules/authentication/actions";
import UserButton from "@/modules/authentication/components/user-button";
import ChatMessageView from "@/modules/chat/components/chat-message-view";
import Image from "next/image";

export default async function Home() {
  const user = await getCurrentUser()
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <ChatMessageView user={user} />
    </div>
  );
}
