import { useSyncExternalStore } from "react";

export const useMounted = () =>{
  const mounted = useSyncExternalStore(() => () =>{}, () => true, () => false);
  return {
    mounted,
  }
}
