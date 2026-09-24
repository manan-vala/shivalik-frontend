import { useCallback, useEffect, useState } from "react";

/**
 * Loads data for a screen and tracks the request.
 *
 *   const { data, loading, error, reload } = useApiData(getLowStockBooks, []);
 *
 * `load` is called on mount and again by `reload()`. A response that lands
 * after the component unmounted, or after a newer load started, is dropped.
 */
export function useApiData(load, initial) {
  const [state, setState] = useState({ data: initial, loading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let current = true;
    load()
      .then((data) => {
        if (current) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (current) setState((prev) => ({ ...prev, loading: false, error }));
      });
    return () => {
      current = false;
    };
    // `load` is expected to be a module-level function; re-running on its
    // identity would refetch on every render for inline lambdas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setVersion((v) => v + 1);
  }, []);
  return { ...state, reload };
}
