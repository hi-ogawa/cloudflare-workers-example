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
        <main className="flex flex-col gap-2 p-4 mx-auto w-full max-w-2xl">
          <CounterComponent label="Counter KV" useCounter={useCounterKV} />
          <CounterComponent label="Counter D1" useCounter={useCounterD1} />
        </main>
      </div>
    </React.Suspense>
  );
}

function CounterComponent(props: { label: string; useCounter: UseCounter }) {
  const { getCounterQuery, updateCounterMutation } = props.useCounter();
  const loading = getCounterQuery.isLoading || updateCounterMutation.isLoading;

  return (
    <div className="flex flex-col gap-2 border p-2">
      <div className="flex items-center gap-3">
        <span>
          {props.label} = {getCounterQuery.data ?? "..."}
        </span>
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
  );
}

type UseCounter = typeof useCounterKV;

function useCounterKV() {
  const queryKey = ["getCounterKV"];
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

  return { getCounterQuery, updateCounterMutation };
}

function useCounterD1() {
  const queryKey = ["getCounterD1"];
  const getCounterQuery = useQuery({
    queryKey,
    queryFn: import.meta.env.SSR
      ? serverOnly.rpcRoutes.getCounterD1
      : rpcClient.getCounterD1,
    suspense: import.meta.env.SSR,
  });

  const queryClient = useQueryClient();
  const updateCounterMutation = useMutation({
    mutationFn: rpcClient.updateCounterD1,
    onSuccess(data, _variables, _context) {
      queryClient.setQueryData(queryKey, data);
    },
  });

  return { getCounterQuery, updateCounterMutation };
}
