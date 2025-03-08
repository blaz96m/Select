import { isFunction } from "lodash";
import { KeyboardEvent, MouseEvent, useCallback } from "react";

import {
  EventHandlerFollowupFunctions,
  CustomSelectEventHandlers,
  SelectEventHandlers,
  SelectOptionT,
} from "src/Select/types/selectGeneralTypes";

import { SelectApi, SelectAsyncApi } from "src/Select/types/selectStateTypes";

type SelectProps = {
  isLoading: boolean | undefined;
  clearInputOnIdicatorClick: boolean;
  resetFocus: () => void;
};

const useSelectEventHandlerResolver = (
  customEventHandlers: CustomSelectEventHandlers,
  eventHandlerFollowupFunctions: EventHandlerFollowupFunctions,
  selectApi: SelectApi,
  selectAsyncApi: SelectAsyncApi,
  selectProps: SelectProps
): SelectEventHandlers => {
  const {
    onInputChange,
    onOptionClick,
    onDropdownClick,
    onClearIndicatorClick,
    onValueClear,
    onScrollToBottom,
    onKeyDown,
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
    clearInputOnSelect,
    displayedOptions,
    closeDropdownOnSelect,
    selectState,
    selectFocusState,
    selectFocusHandlers,
    selectEventHandlers,
    loadNextPage,
  } = selectApi;

  const { loadNextPageAsync, fetchOnScrollToBottom } = selectAsyncApi;

  const handlePageChange = fetchOnScrollToBottom
    ? loadNextPageAsync
    : loadNextPage;

  const defaultEventHandlers = selectEventHandlers;

  const { resetFocus, setFocusedOptionCategory, setFocusedOptionIndex } =
    selectFocusHandlers;

  const { focusedOptionCategory, focusedOptionIndex } = selectFocusState;

  const { value, isOpen, page, inputValue } = selectState;

  const { clearInputOnIdicatorClick } = selectProps;

  const handleInputChange = useCallback(
    (inputValue: string) => {
      if (isFunction(onInputChange)) {
        onInputChange(inputValue, value);
      } else {
        defaultEventHandlers.handleInputChange(inputValue);
        isFunction(onAfterInputUpdate) && onAfterInputUpdate(inputValue, value);
      }
    },
    [defaultEventHandlers.handleInputChange, onInputChange, onAfterInputUpdate]
  );

  const handleOptionClick = useCallback(
    (option: SelectOptionT, isSelected: boolean) => {
      if (isFunction(onOptionClick)) {
        onOptionClick(option, isSelected);
        // Keep the focus logic due to its state being controlled.
        closeDropdownOnSelect && resetFocus();
      } else {
        defaultEventHandlers.handleOptionClick(option, isSelected);

        isFunction(onAfterOptionClick) &&
          onAfterOptionClick(option, isSelected);
      }
    },
    [
      onOptionClick,
      defaultEventHandlers.handleOptionClick,
      clearInputOnSelect,
      closeDropdownOnSelect,
      resetFocus,
      onAfterOptionClick,
    ]
  );

  const handleDropdownClick = useCallback(() => {
    const willOpen = !isOpen;
    if (isFunction(onDropdownClick)) {
      onDropdownClick(isOpen);
      !willOpen && resetFocus();
    } else {
      defaultEventHandlers.handleDropdownClick();
      isFunction(onAfterDropdownClick) && onAfterDropdownClick(willOpen);
    }
  }, [
    isOpen,
    onDropdownClick,
    onAfterDropdownClick,
    resetFocus,
    defaultEventHandlers.handleDropdownClick,
  ]);

  const handleClearIndicatorClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isFunction(onClearIndicatorClick))
        return onClearIndicatorClick(e, inputValue, value);

      defaultEventHandlers.handleClearIndicatorClick(e);

      isFunction(onAfterClearIndicatorClick) &&
        onAfterClearIndicatorClick(e, inputValue, value);
    },
    [
      onClearIndicatorClick,
      onAfterClearIndicatorClick,
      clearInputOnIdicatorClick,
      defaultEventHandlers.handleClearIndicatorClick,
    ]
  );

  const handleValueClearClick = useCallback(
    (e: MouseEvent<HTMLDivElement>, option: SelectOptionT) => {
      if (isFunction(onValueClear)) return onValueClear(e, option);
      defaultEventHandlers.handleValueClearClick(e, String(option.id));
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (isFunction(onKeyDown)) {
        onKeyDown(
          e,
          {
            focusedOptionCategory,
            focusedOptionIndex,
            setFocusedOptionCategory,
            setFocusedOptionIndex,
          },
          displayedOptions
        );
      } else {
        defaultEventHandlers.handleKeyDown(e);
      }
    },
    [onKeyDown, focusedOptionCategory, focusedOptionIndex, displayedOptions]
  );

  return {
    handleClearIndicatorClick,
    handleDropdownClick,
    handleKeyDown,
    handleInputChange,
    handleOptionClick,
    handleScrollToBottom,
    handleValueClearClick,
    handlePageChange,
  };
};

export default useSelectEventHandlerResolver;
