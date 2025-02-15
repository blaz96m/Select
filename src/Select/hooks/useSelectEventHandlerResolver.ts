import { isFunction } from "lodash";
import { useCallback } from "react";

import {
  DefaultSelectEventHandlers,
  EventHandlerFollowupFunctions,
  CustomSelectEventHandlers,
  SelectEventHandlers,
  SelectFetchFunction,
  SelectOptionT,
} from "src/Select/types/selectGeneralTypes";

import {
  SelectState,
  SelectStateUpdaters,
  SelectApi,
} from "src/Select/types/selectStateTypes";

type SelectProps = {
  isLoading: boolean | undefined;
  fetchFunction: SelectFetchFunction | undefined;
  isInitialFetch: () => boolean;
  lazyInit: boolean;
  handlePageChange: () => void;
  handlePageReset: () => void;
  handleFocusOnClick: (
    focusedOptionIdx: number,
    focusedCategory: string
  ) => void;
  resetFocus: () => void;
};

const useSelectEventHandlerResolver = (
  defaultEventHandlers: DefaultSelectEventHandlers,
  customEventHandlers: CustomSelectEventHandlers,
  eventHandlerFollowupFunctions: EventHandlerFollowupFunctions,
  selectStateUpdaters: SelectStateUpdaters,
  selectState: SelectState,
  selectApi: SelectApi,
  selectProps: SelectProps
): SelectEventHandlers => {
  const {
    onInputUpdate,
    onOptionClick,
    onDropdownClick,
    onClearIndicatorClick,
    onValueClear,
    onScrollToBottom,
  } = customEventHandlers;
  const {
    onAfterInputUpdate,
    onAfterOptionClick,
    onAfterDropdownClick,
    onAfterClearIndicatorClick,
    onAfterValueClear,
    onAfterScrollToBottom,
  } = eventHandlerFollowupFunctions;

  const {
    usesInputAsync,
    clearInputOnSelect,
    onDropdownExpand,
    displayedOptions,
    closeDropdownOnSelect,
  } = selectApi;

  const { value, isOpen, page, inputValue } = selectState;

  const { loadNextPage, toggleDropdownVisibility } = selectStateUpdaters;
  const {
    fetchFunction,
    isInitialFetch,
    isLoading,
    lazyInit,
    resetFocus,
    handlePageReset,
    handlePageChange,
    handleFocusOnClick,
  } = selectProps;

  const isFetchingDataOnLazyInit =
    isFunction(fetchFunction) && lazyInit && !isInitialFetch();

  const handleInputChange = useCallback(
    (inputValue: string) => {
      if (isFunction(onInputUpdate)) return onInputUpdate(inputValue, value);
      defaultEventHandlers.handleInputChange(inputValue);
      handlePageReset();
      resetFocus();
      isFunction(onAfterInputUpdate) && onAfterInputUpdate(inputValue, value);
    },
    [defaultEventHandlers.handleInputChange, onInputUpdate, onAfterInputUpdate]
  );

  const handleOptionClick = useCallback(
    (
      option: SelectOptionT,
      isSelected: boolean,
      focusedOptionIdx: number,
      focusedCategory: string
    ) => {
      if (isFunction(onOptionClick)) {
        onOptionClick(option, isSelected);
      } else {
        defaultEventHandlers.handleOptionClick(option, isSelected);
        clearInputOnSelect && handlePageReset();
        if (clearInputOnSelect || closeDropdownOnSelect) {
          resetFocus();
        }
        isFunction(onAfterOptionClick) &&
          onAfterOptionClick(option, isSelected);
      }
      handleFocusOnClick(focusedOptionIdx, focusedCategory);
    },
    [
      onOptionClick,
      defaultEventHandlers.handleOptionClick,
      clearInputOnSelect,
      usesInputAsync,
    ]
  );

  const handleDropdownClick = useCallback(() => {
    if (isFunction(onDropdownClick)) return onDropdownClick(isOpen);
    if (isLoading) return;
    const willOpen = !isOpen;
    toggleDropdownVisibility();
    if (willOpen) {
      onDropdownExpand();
    } else {
      resetFocus();
    }
    isFunction(onAfterDropdownClick) && onAfterDropdownClick(willOpen);
  }, [
    isLoading,
    isOpen,
    isFetchingDataOnLazyInit,
    onDropdownClick,
    onAfterDropdownClick,
  ]);

  const handleClearIndicatorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (isFunction(onClearIndicatorClick))
        return onClearIndicatorClick(e, inputValue, value);

      defaultEventHandlers.handleClearIndicatorClick(e);
      isFunction(onAfterClearIndicatorClick) &&
        onAfterClearIndicatorClick(e, inputValue, value);
    },
    [
      onClearIndicatorClick,
      onAfterClearIndicatorClick,
      defaultEventHandlers.handleClearIndicatorClick,
    ]
  );

  const handleValueClearClick = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      option: SelectOptionT
    ) => {
      if (isFunction(onValueClear)) return onValueClear(e, option);
      defaultEventHandlers.handleValueClearClick(e, option.id);
      isFunction(onAfterValueClear) && onAfterValueClear(e, option);
    },
    [
      onValueClear,
      onAfterValueClear,
      defaultEventHandlers.handleValueClearClick,
    ]
  );

  const handleScrollToBottom = useCallback(() => {
    if (isFunction(onScrollToBottom))
      return onScrollToBottom(displayedOptions, page);
    handlePageChange();
    isFunction(onAfterScrollToBottom) &&
      onAfterScrollToBottom(displayedOptions, page + 1);
  }, [
    handlePageChange,
    displayedOptions,
    page,
    onAfterScrollToBottom,
    onScrollToBottom,
  ]);

  return {
    handleClearIndicatorClick,
    handleDropdownClick,
    handleInputChange,
    handleOptionClick,
    handleScrollToBottom,
    handleValueClearClick,
  };
};

export default useSelectEventHandlerResolver;
