import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { rpcClientQuery } from "../rpc/client";
import { rpcRoutesQuery } from "../rpc/server";

export async function loader({ queryClient }: { queryClient: QueryClient }) {
  await queryClient.prefetchQuery(rpcRoutesQuery.getCounter.queryOptions());
}

export function Page() {
  const getCounterQueryOptions = rpcClientQuery.getCounter.queryOptions();
  const getCounterQuery = useQuery(getCounterQueryOptions);

  const queryClient = useQueryClient();
  const updateCounterMutation = useMutation({
    ...rpcClientQuery.updateCounter.mutationOptions(),
    onSuccess(data, _variables, _context) {
      queryClient.setQueryData(getCounterQueryOptions.queryKey, data);
    },
  });

  return (
    <div className="flex flex-col gap-2 py-8 mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-2">
        Counter = {getCounterQuery.data ?? "..."}
        <div className="flex gap-2">
          <button
            className="antd-btn antd-btn-default px-2"
            onClick={() => updateCounterMutation.mutate(-1)}
          >
            -1
          </button>
          <button
            className="antd-btn antd-btn-default px-2"
            onClick={() => updateCounterMutation.mutate(+1)}
          >
            +1
          </button>
        </div>
      </div>
    </div>
  );
}
