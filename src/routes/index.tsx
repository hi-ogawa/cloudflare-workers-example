import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Toaster } from "react-hot-toast";
import { rpcClient } from "../rpc/client";
import serverOnly from "../server-only";

export function Page() {
  return (
    <React.Suspense>
      <Toaster />
      <div className="flex flex-col">
        <header className="top-0 sticky antd-body flex items-center p-2 px-4 gap-3 shadow-md shadow-black/[0.05] dark:shadow-black/[0.7] z-1">
          <div>Example</div>
          <span className="flex-1"></span>
          <a
            className="antd-btn antd-btn-ghost i-ri-github-line w-6 h-6"
            href="https://github.com/hi-ogawa/cloudflare-workers-example"
            target="_blank"
          ></a>
        </header>
        <PageInner />
      </div>
    </React.Suspense>
  );
}

function PageInner() {
  const queryKey = ["getCounter"];
  const getCounterQuery = useQuery({
    queryKey,
    queryFn: import.meta.env.SSR
      ? serverOnly.rpcRoutes.getCounter
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

  const loading = getCounterQuery.isLoading || updateCounterMutation.isLoading;

  return (
    <div className="flex flex-col gap-2 py-4 mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span>Counter = {getCounterQuery.data ?? "..."}</span>
          {loading && <div className="antd-spin w-4 h-4"></div>}
        </div>
        <div className="flex gap-2">
          <button
            className="antd-btn antd-btn-default px-2"
            disabled={loading}
            onClick={() => updateCounterMutation.mutate(-1)}
          >
            -1
          </button>
          <button
            className="antd-btn antd-btn-default px-2"
            disabled={loading}
            onClick={() => updateCounterMutation.mutate(+1)}
          >
            +1
          </button>
        </div>
      </div>
    </div>
  );
}
