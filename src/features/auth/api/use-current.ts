import { InferRequestType, InferResponseType } from "hono";
import { client } from '@/lib/rpc';
import { useQuery } from "@tanstack/react-query";

type ResponseType = InferResponseType<typeof client.api.auth.current["$get"], 200>;
type RequestType = InferRequestType<typeof client.api.auth.current['$get']>

export const useCurrent = () => {
    const query = useQuery<RequestType, Error, ResponseType>({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const response = await client.api.auth.current['$get']();
            if (!response.ok) {
                return null
            }
            return await response.json();
        }
    })
    return query
}