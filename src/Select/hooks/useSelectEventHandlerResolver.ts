import { isFunction, isNull, isNumber } from "lodash";
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
  SelectAsyncApi,
} from "src/Select/types/selectStateTypes";
import { SelectFocusState } from "src/Select/types/selectStateTypes";

type SelectProps = {
  isLoading: boolean | undefined;
  clearInputOnIdicatorClick: boolean;
  handlePageChange: () => void;
  handlePageReset: () => void;
  handleOptionFocusOnClick: (
    focusedOptionIdx: number,
    focusedCategory: string
  ) => void;
  resetFocus: () => void;
};

const useSelectEventHandlerResolver = (
  defaultEventHandlers: DefaultSelectEventHandlers,
  customEventHandlers: CustomSelectEventHandlers,
  eventHandlerFollowupFunctions: EventHandlerFollowupFunctions,
  selectApi: SelectApi,
  selectAsyncApi: SelectAsyncApi,
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
    clearInputOnSelect,

    displayedOptions,
    closeDropdownOnSelect,
    selectState,
    selectStateUpdaters,
    selectFocusHandlers,
  } = selectApi;

  const { value, isOpen, page, inputValue } = selectState;

  const {
    isLoading,
    resetFocus,
    handlePageReset,
    handlePageChange,
    handleOptionFocusOnClick,
    clearInputOnIdicatorClick,
  } = selectProps;

  const { toggleDropdownVisibility } = selectStateUpdaters;

  const handleInputChange = useCallback(
    (inputValue: string) => {
      if (isFunction(onInputUpdate)) {
        onInputUpdate(inputValue, value);
      } else {
        defaultEventHandlers.handleInputChange(inputValue);
        handlePageReset();
        isFunction(onAfterInputUpdate) && onAfterInputUpdate(inputValue, value);
      }
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
        // Keep the focus logic due to its state being controlled.
        !closeDropdownOnSelect &&
          handleOptionFocusOnClick(focusedOptionIdx, focusedCategory);
        closeDropdownOnSelect && resetFocus();
      } else {
        defaultEventHandlers.handleOptionClick(
          option,
          isSelected,
          focusedOptionIdx,
          focusedCategory
        );
        clearInputOnSelect && handlePageReset();

        isFunction(onAfterOptionClick) &&
          onAfterOptionClick(option, isSelected);
      }
    },
    [
      onOptionClick,
      defaultEventHandlers.handleOptionClick,
      clearInputOnSelect,
      resetFocus,
      handlePageReset,
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
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (isFunction(onClearIndicatorClick))
        return onClearIndicatorClick(e, inputValue, value);

      defaultEventHandlers.handleClearIndicatorClick(e);
      if (inputValue && clearInputOnIdicatorClick) {
        handlePageReset();
      }
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
