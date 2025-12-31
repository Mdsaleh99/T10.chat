import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation";
import { createChatWithMessage, deleteChat, getChatById } from "../actions";
import { toast } from "sonner";

export const useCreateChat = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (values) => createChatWithMessage(values),
        onSuccess: (res) => {
            if (res.success && res.data) {
                
                queryClient.invalidateQueries({
                    queryKey: ["chats"]
                })
                router.push(`/chat/${res.data.id}?autoTrigger=true`);
            } 
        },
        onError: (error) => {
            console.error(`Create chat error: ${error}`);
            toast.error("Failed to create chat. Please try again.");
        }
    })
}

export const useDeleteChat = (chatId) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: () => deleteChat(chatId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats"]
            })
        },
        onError: () => {
            toast.error("Failed to delete chat. Please try again.");
        }
    })
}

export const useGetChatById = (chatId) => {
    return useQuery({
        queryKey: ["chats", chatId],
        queryFn: () => getChatById(chatId),
    })

    
}

