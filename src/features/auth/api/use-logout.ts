import { client } from "@/lib/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { InferResponseType } from "hono"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"], 200>

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.auth.logout["$post"]();
            
            if (!response.ok) {
                throw new Error('Failed to log out.')
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success('Logged out!')
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },
        onError: () => {
            toast.error('Failed to log out.')
        }
    })
    return mutation;
}