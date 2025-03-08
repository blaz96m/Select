import {
  useContext,
  createContext,
  useMemo,
  memo,
  useRef,
  useReducer,
  useCallback,
} from "react";
import {
  SelectCustomClassNames,
  CustomSelectEventHandlers,
  EventHandlerFollowupFunctions,
  SelectCustomRefs,
} from "src/Select/types/selectGeneralTypes";

import {
  SelectCustomComponents,
  SelectProps,
} from "src/Select/types/selectComponentTypes";

import { SelectComponent } from "src/Select/components";
import { useSelect, useSelectAsync } from "src/Select/hooks";
import { every } from "lodash";
import { getObjectKeys } from "src/utils/data-types/objects/helpers";

const arePropsEqual = (oldProps: SelectProps, newProps: SelectProps) => {
  return every(getObjectKeys(oldProps), (propName: keyof SelectProps) => {
    if (
      propName === "customComponents" ||
      propName === "classNames" ||
      propName === "refs"
    )
      return true;
    else {
      return (
        oldProps[propName as keyof typeof oldProps] ===
        newProps[propName as keyof typeof newProps]
      );
    }
  });
};

type SelectContext = {
  components: Partial<SelectCustomComponents>;
  classNames: Partial<SelectCustomClassNames>;
  refs: Partial<SelectCustomRefs>;
};

const SelectContext = createContext<SelectContext>({
  components: {},
  classNames: {},
  refs: {},
});

export const SelectProvider = memo(
  ({
    customComponents = {},
    classNames = {},
    refs = {},
    ...props
  }: SelectProps) => {
    const {
      labelKey,
      categoryKey,
      categorizeFunction,
      sortFunction,
      fetchFunction,
      recordsPerPage,
      removeSelectedOptionsFromList,
      defaultSelectOptions,
      onChange,
      closeDropdownOnSelect,
      setIsOpen: customSetIsOpen,
      preventInputUpdate,
      inputFilterFunction,
      optionFilter,
      value,
      setSelectOptions: customSetSelectOptions,
      isOpen: customIsOpen,
      selectOptions: customSelectOptions,
      isLoading,
      page: customPage,
      setPage: customSetPage,
      setInputValue: customSetInputValue,
      inputValue: customInputValue,
      useAsync = false,
      debounceInputUpdate = false,
      inputUpdateDebounceDuration = 700,
      clearInputOnSelect = true,
      isCategorized = false,
      disableInputEffect = false,
      clearInputOnIdicatorClick = true,
      updateSelectOptionsAfterFetch = true,
      lazyInit = false,
      fetchOnScroll = false,
      isMultiValue = false,
      disableInputUpdate = false,
      hasInput = true,
      fetchOnInputChange = true,
    } = props;

    const customState = {
      customInputValue,
      customIsOpen,
      customSelectOptions,
      customPage,
    };

    const customStateSetters = {
      customSetIsOpen,
      customSetSelectOptions,
      customSetInputValue,
      setValue: onChange,
      customSetPage,
    };

    const selectApi = useSelect({
      isMultiValue,
      labelKey,
      isCategorized,
      defaultSelectOptions,
      value,
      optionFilter,
      customCategorizeFunction: categorizeFunction,
      preventInputUpdate,
      useAsync,
      disableInputUpdate,
      disableInputEffect,
      clearInputOnIdicatorClick,
      sortFunction,
      customState,
      customStateSetters,
      fetchOnScroll,
      recordsPerPage,
      fetchOnInputChange,
      hasInput,
      clearInputOnSelect,
      removeSelectedOptionsFromList,
      categoryKey,
      isLoading,
      closeDropdownOnSelect,
      inputFilterFunction,
    });

    const { selectAsyncApi } = useSelectAsync(selectApi, {
      isLazyInit: lazyInit,
      updateSelectOptionsAfterFetch,
      inputUpdateDebounceDuration,
      useAsync,
      debounceInputUpdate,
      recordsPerPage,
      fetchOnInputChange,
      fetchOnScroll,
      isLoading,
      fetchFunction,
    });

    const data: SelectContext = useMemo(
      () => ({
        components: customComponents,
        classNames,
        refs,
      }),
      []
    );

    const customSelectEventHandlers: CustomSelectEventHandlers = {
      onClearIndicatorClick: props.onClearIndicatorClick,
      onDropdownClick: props.onDropdownClick,
      onInputChange: props.onInputChange,
      onOptionClick: props.onOptionClick,
      onScrollToBottom: props.onScrollToBottom,
      onValueClear: props.onValueClear,
      onKeyDown: props.onKeyDown,
    };

    const selectEventHandlerFollowups: EventHandlerFollowupFunctions = {
      onAfterClearIndicatorClick: props.onAfterClearIndicatorClick,
      onAfterDropdownClick: props.onAfterDropdownClick,
      onAfterInputUpdate: props.onAfterInputUpdate,
      onAfterOptionClick: props.onAfterOptionClick,
      onAfterScrollToBottom: props.onAfterScrollToBottom,
      onAfterValueClear: props.onAfterValueClear,
    };

    return (
      <SelectContext.Provider value={data}>
        <SelectComponent
          {...props}
          selectApi={selectApi}
          selectAsyncApi={selectAsyncApi}
          customSelectEventHandlers={customSelectEventHandlers}
          eventHandlerFollowups={selectEventHandlerFollowups}
        />
      </SelectContext.Provider>
    );
  },
  arePropsEqual
);

export const useSelectContext = () => useContext(SelectContext);
