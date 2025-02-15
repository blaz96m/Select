import { isFunction } from "lodash";
import { useCallback } from "react";
import { flushSync } from "react-dom";
import {
  CategorizedSelectOptions,
  DefaultSelectEventHandlers,
  EventHandlerFollowupFunctions,
  SelectAsyncStateUpdaters,
  CustomSelectEventHandlers,
  SelectEventHandlers,
  SelectFetchFunc,
  SelectOptionList,
  SelectOptionT,
  SelectState,
  SelectStateUpdaters,
} from "src/components/Select/types";
import { SelectAsyncState } from "./useSelectAsync";

type SelectProps = {
  usesInputAsync: boolean;
  clearInputOnSelect: boolean;
  isLoading: boolean | undefined;
  fetchFunction: SelectFetchFunc | undefined;
  isInitialFetch: () => boolean;
  lazyInit: boolean;
  fetchOnScrollToBottom: boolean | undefined;
  value: SelectOptionList;
  inputValue: string;
  onDropdownExpand: () => void;
  handlePageChange: () => void;
  handlePageReset: () => void;
  handleFocusOnClick: (
    focusedOptionIdx: number,
    focusedCategory: string
  ) => void;
  isOpen: boolean;
  page: number;
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  resetFocus: () => void;
  closeDropdownOnSelect: boolean | undefined;
};

const useSelectEventHandlerResolver = (
  defaultEventHandlers: DefaultSelectEventHandlers,
  customEventHandlers: CustomSelectEventHandlers,
  eventHandlerFollowupFunctions: EventHandlerFollowupFunctions,
  selectStateUpdaters: SelectStateUpdaters,
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

  const { loadNextPage, toggleDropdownVisibility } = selectStateUpdaters;
  const {
    usesInputAsync,
    clearInputOnSelect,
    fetchFunction,
    isInitialFetch,
    isLoading,
    lazyInit,
    onDropdownExpand,
    displayedOptions,
    value,
    isOpen,
    inputValue,
    page,
    resetFocus,
    handlePageReset,
    handlePageChange,
    handleFocusOnClick,
    closeDropdownOnSelect,
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
