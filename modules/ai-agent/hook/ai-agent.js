import { useQuery } from "@tanstack/react-query"

export const useAIModels = () => {
    return useQuery({
        queryKey: ['ai-models'],
        queryFn: async () => fetch('/api/ai/get-models').then(res => res.json()), 
    })
}