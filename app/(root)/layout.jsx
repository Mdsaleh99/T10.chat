import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/modules/authentication/actions";
import { getAllChats } from "@/modules/chat/actions";
import ChatSidebar from "@/modules/chat/components/cha-sidebar";
import Header from "@/modules/chat/components/header";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
    
  const user = await getCurrentUser()
  const {data: chats} = await getAllChats()

  if (!session) {
    redirect("/signin");
  }
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Chat sidebar */}
      <ChatSidebar user={user} chats={chats} />
      <main className="flex-1 overflow-hidden">
              {/* header */}
              <Header />
        {children}
      </main>
    </div>
  );
}
