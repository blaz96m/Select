import { useCallback, useRef } from "react";

const useThrottle = (callback: (...args: any) => any, limit = 400) => {
  const lastCallTimeRef = useRef<number>(0);

  const throttledFunction = useCallback(
    (...args: any) => {
      const now = Date.now();

      if (now - lastCallTimeRef.current > limit) {
        lastCallTimeRef.current = Date.now();
        return callback(...args);
      }
    },
    [callback, limit]
  );

  return throttledFunction;
};

export default useThrottle;
