import { useCallback, useEffect, useState } from "react";

export function useRequest(load, dependencies = []) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const reload = useCallback(() => {
    setState({ loading: true, error: null, data: null });
    return load().then((data) => setState({ loading: false, error: null, data })).catch((error) => setState({ loading: false, error, data: null }));
  }, dependencies);
  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}
