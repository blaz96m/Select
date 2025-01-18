import { useCallback, useMemo, useRef } from "react";
import { SelectState } from "src/components/Select/types";

import { isFocusedOptionInViewport, scrollToTarget } from "src/utils/select";

export type SelectDomHelpers = {
  handleScrollToFocusedOption: (optionId: string) => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  focusInput: () => void;
};

export type SelectDomRefs = {
  selectListContainerRef: React.RefObject<HTMLDivElement>;
  selectOptionRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  selectOptionsRef: React.MutableRefObject<Map<string, HTMLDivElement> | null>;
};

const useSelectDomHelper = (
  state: SelectState
): { domHelpers: SelectDomHelpers; domRefs: SelectDomRefs } => {
  const selectListContainerRef = useRef<HTMLDivElement>(null);
  const selectOptionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectOptionsRef = useRef<Map<string, HTMLDivElement> | null>(null);

  const domRefs = useMemo(
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
    domRefs,
    domHelpers: {
      handleScrollToFocusedOption,
      focusInput,
      getSelectOptionsMap,
    },
  };
};

export default useSelectDomHelper;
