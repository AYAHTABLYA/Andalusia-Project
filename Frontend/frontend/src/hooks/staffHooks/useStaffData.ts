import { useCallback, useEffect, useState } from "react";

// Loads data for a staff page: aborts on unmount / dependency change and exposes loading, error and reload().
// `deps` are extra values (period, search…) that should trigger a new load.
function useStaffData<T>(
  load: (signal: AbortSignal) => Promise<T>,
  initial: T,
  fallbackError: string,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    load(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(e instanceof Error && e.message ? e.message : fallbackError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, ...deps]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { data, loading, error, reload };
}

export default useStaffData;
