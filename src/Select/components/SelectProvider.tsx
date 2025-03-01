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
  CustomClassNames,
  CustomSelectEventHandlers,
  EventHandlerFollowupFunctions,
} from "src/Select/types/selectGeneralTypes";

import {
  SelectCustomComponents,
  SelectProps,
} from "src/Select/types/selectComponentTypes";

import { SelectComponent } from "src/Select/components";
import {
  useSelect,
  useSelectAsync,
  useSelectStateResolver,
} from "src/Select/hooks";
import { selectReducer } from "src/Select/stores";
import { initializeState } from "src/Select/utils";
import { omit, isFunction, noop, every } from "lodash";
import { getObjectKeys } from "src/utils/data-types/objects/helpers";

const arePropsEqual = (
  oldProps: SelectProps & { customComponents: SelectCustomComponents },
  newProps: SelectProps & { customComponents: SelectCustomComponents }
) => {
  return every(getObjectKeys(oldProps), (propName) => {
    if (propName === "customComponents" || propName === "classNames")
      return true;
    else {
      if (
        oldProps[propName as keyof typeof oldProps] !==
        newProps[propName as keyof typeof newProps]
      ) {
      }
      return (
        oldProps[propName as keyof typeof oldProps] ===
        newProps[propName as keyof typeof newProps]
      );
    }
  });
};

type SelectContext = {
  components: SelectCustomComponents;
  classNames: Partial<CustomClassNames>;
};

const SelectContext = createContext<SelectContext>({
  components: {},
  classNames: {},
});

export const SelectProvider = memo(
  ({
    customComponents = {},
    ...props
  }: SelectProps & { customComponents: SelectCustomComponents }) => {
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
      inputUpdateDebounceDuration,
      value,
      setSelectOptions: customSetSelectOptions,
      isOpen: customIsOpen,
      selectOptions: customSelectOptions,
      isLoading,
      page: customPage,
      setPage: customSetPage,
      setInputValue: customSetInputValue,
      inputValue: customInputValue,
      classNames = {},
      useAsync = false,
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
      inputUpdateDebounceDuration,
      removeSelectedOptionsFromList,
      categoryKey,
      isLoading,
      closeDropdownOnSelect,
      inputFilterFunction,
    });

    const { selectEventHandlers } = selectApi;

    const { selectAsyncApi } = useSelectAsync(selectApi, {
      isLazyInit: lazyInit,
      updateSelectOptionsAfterFetch,
      useAsync,
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
          defaultSelectEventHandlers={selectEventHandlers}
          customSelectEventHandlers={customSelectEventHandlers}
          eventHandlerFollowups={selectEventHandlerFollowups}
        />
      </SelectContext.Provider>
    );
  },
  arePropsEqual
);

export const useSelectContext = () => useContext(SelectContext);
