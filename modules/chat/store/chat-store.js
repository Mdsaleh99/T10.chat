import { create } from "zustand"

export const useChatStore = create((set) => ({
    activeChatId: null,
    setActiveChatId: (chatId) => set({ activeChatId: chatId }),
}))