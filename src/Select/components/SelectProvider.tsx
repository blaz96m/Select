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
    if (propName === "customComponents") return true;
    return (
      oldProps[propName as keyof typeof oldProps] ===
      newProps[propName as keyof typeof newProps]
    );
  });
};

type SelectContext = {
  components: SelectCustomComponents;
};

const SelectContext = createContext<SelectContext>({
  components: {},
});

export const SelectProvider = memo(
  ({
    customComponents,
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
      onChange,
      closeDropdownOnSelect,
      setIsOpen: customSetIsOpen,
      preventInputUpdate,
      inputFilterFunction,
      inputUpdateDebounceDuration,
      value,
      clearInputOnSelect,
      setSelectOptions: customSetSelectOptions,
      isOpen: customIsOpen,
      selectOptions: customSelectOptions,
      isLoading,
      setInputValue: customSetInputValue,
      inputValue: customInputValue,
      usesAsync = false,
      isCategorized = false,
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
    };

    const customStateSetters = {
      customSetIsOpen,
      customSetSelectOptions,
      customSetInputValue,
      setValue: onChange,
    };

    const selectApi = useSelect({
      isMultiValue,
      labelKey,
      isCategorized,
      defaultSelectOptions: customSelectOptions,
      value,
      customCategorizeFunction: categorizeFunction,
      preventInputUpdate,
      usesAsync,
      disableInputUpdate,
      clearInputOnIdicatorClick,
      sortFunction,
      customState,
      customStateSetters,
      fetchOnScroll,
      recordsPerPage,
      fetchOnInputChange,
      hasInput,
      fetchFunction,
      clearInputOnSelect,
      inputUpdateDebounceDuration,
      removeSelectedOptionsFromList,
      categoryKey,
      isLoading,
      closeDropdownOnSelect,
      inputFilterFunction,
    });

    const {
      selectState,
      selectStateUpdaters,
      loadNextPage,
      selectEventHandlers,
      handlePageReset,
    } = selectApi;

    const { selectAsyncApi, selectAsyncState } = useSelectAsync(
      selectState,
      selectApi,
      selectStateUpdaters,
      {
        isLazyInit: lazyInit,
        updateSelectOptionsAfterFetch,
        recordsPerPage,
        fetchOnInputChange,
        isLoading,
        fetchFunction,
        fetchOnScroll: selectApi.fetchOnScrollToBottom,
      }
    );

    const { loadNextPageAsync, handlePageResetAsync, isInitialFetch } =
      selectAsyncApi;

    const resolvedPageValue = selectApi.fetchOnScrollToBottom
      ? selectAsyncState.page
      : selectState.page;

    const resolvedPageResetHandler = selectApi.usesInputAsync
      ? handlePageResetAsync
      : handlePageReset;

    const resolvedPageChangeHandler = selectApi.fetchOnScrollToBottom
      ? loadNextPageAsync
      : loadNextPage;

    const data = useMemo(
      () => ({
        components: { ...customComponents },
      }),
      []
    );

    const customSelectEventHandlers: CustomSelectEventHandlers = {
      onClearIndicatorClick: props.onClearIndicatorClick,
      onDropdownClick: props.onDropdownClick,
      onInputUpdate: props.onInputUpdate,
      onOptionClick: props.onOptionClick,
      onScrollToBottom: props.onScrollToBottom,
      onValueClear: props.onValueClear,
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
          selectState={{ ...selectState, page: resolvedPageValue }}
          defaultSelectEventHandlers={selectEventHandlers}
          customSelectEventHandlers={customSelectEventHandlers}
          eventHandlerFollowups={selectEventHandlerFollowups}
          isInitialFetch={isInitialFetch}
          selectStateUpdaters={selectStateUpdaters}
          handlePageReset={resolvedPageResetHandler}
          handlePageChange={resolvedPageChangeHandler}
          selectApi={selectApi}
          selectAsyncApi={selectAsyncApi}
        />
      </SelectContext.Provider>
    );
  },
  arePropsEqual
);

export const useSelectContext = () => useContext(SelectContext);
