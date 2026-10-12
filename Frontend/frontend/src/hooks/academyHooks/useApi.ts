import { useCallback, useEffect, useState } from "react";
import type { DependencyList } from "react";
import { ApiError } from "../../apis/academyApi";

type ApiResult<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  reload: () => void;
};

// Generic GET hook: re-fetches whenever `deps` change, aborts stale requests,
// keeps the previous data on screen while the next page/filter is loading.
function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
): ApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetcher(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(
          err instanceof ApiError
            ? err
            : new ApiError(0, "Something went wrong. Please try again."),
        );
        setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, reload };
}

export default useApi;
export type { ApiResult };
