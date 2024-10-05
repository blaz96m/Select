import { useRef, useEffect, RefObject } from "react";

const useForwardedRef = <T>(ref: React.ForwardedRef<T>) => {
  const internalRef = useRef<T>(null);

  useEffect(() => {
    if (typeof ref === "function") {
      ref(internalRef.current);
    } else if (ref) {
      ref.current = internalRef.current;
    }
  }, [ref]);

  return internalRef;
};

export default useForwardedRef;
