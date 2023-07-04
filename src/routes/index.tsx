import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpcClient } from "../rpc/client";

export function Page() {
  const queryKey = ["getCounter"];
  const getCounterQuery = useQuery({
    queryKey,
    // TODO: absurd workaround to eliminate server code on client build
    queryFn: import.meta.env.SSR
      ? () => import("../rpc/server").then((lib) => lib.rpcRoutes.getCounter())
      : rpcClient.getCounter,
    suspense: import.meta.env.SSR,
  });

  const queryClient = useQueryClient();
  const updateCounterMutation = useMutation({
    mutationFn: rpcClient.updateCounter,
    onSuccess(data, _variables, _context) {
      queryClient.setQueryData(queryKey, data);
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
