import { useCallback, useMemo, useRef } from "react";

import { isFocusedOptionInViewport, scrollToTarget } from "src/utils/select";

export type SelectRefHelpers = {
  handleScrollToFocusedOption: (optionId: string) => void;
  focusInput: () => void;
};

const useSelectRef = (state: any) => {
  const selectListContainerRef = useRef<HTMLDivElement>(null);
  const selectOptionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectOptionsRef = useRef<Map<string, HTMLDivElement> | null>(null);

  const refs = useMemo(
    () => ({
      selectListContainerRef,
      selectOptionRef,
      inputRef,
      selectOptionsRef,
    }),
    []
  );

  const getSelectOptionsMap = useCallback(() => {
    if (!selectOptionsRef.current) {
      selectOptionsRef.current = new Map();
    }
    return selectOptionsRef.current;
  }, []);

  const handleScrollToFocusedOption = useCallback(
    (optionId: string) => {
      const listContainer = selectListContainerRef.current;
      const selectOptionMap = getSelectOptionsMap();
      const targetNode = selectOptionMap.get(optionId);
      if (listContainer && targetNode) {
        !isFocusedOptionInViewport(listContainer, targetNode) &&
          scrollToTarget(targetNode);
      }
    },
    [state.isOpen]
  );

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return {
    refs,
    refHelpers: {
      handleScrollToFocusedOption,
      focusInput,
      getSelectOptionsMap,
    },
  };
};

export default useSelectRef;
