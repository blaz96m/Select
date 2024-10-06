import { MutableRefObject, useMemo, useRef } from "react";
const useSelectRef = () => {
  const selectListContainerRef = useRef<HTMLDivElement>(null);

  const refs = useMemo(
    () => ({
      selectListContainerRef,
    }),
    []
  );

  return refs;
};

export default useSelectRef;
