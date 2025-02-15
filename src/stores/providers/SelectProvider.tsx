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
  SelectCustomComponents,
  SelectOptionList,
  SelectStateSetters,
  SelectOptionT,
  CustomSelectEventHandlers,
  EventHandlerFollowupFunctions,
} from "src/components/Select/types/selectTypes";

import Select, { SelectProps } from "src/components/Select/Select";
import {
  useSelect,
  useSelectAsync,
  useSelectStateResolver,
} from "src/hooks/select";
import {
  SelectReducerActionTypes,
  selectReducer,
} from "../reducers/selectReducer";
import { initializeState } from "src/utils/select";
import { omit, isFunction, noop, every } from "lodash";
import { getObjectKeys } from "src/utils/data-types/objects/helpers";
import { flushSync } from "react-dom";

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
      isCategorized,
      labelKey,
      categoryKey,
      categorizeFunction,
      sortFunction,
      fetchFunction,
      recordsPerPage,
      removeSelectedOptionsFromList,
      onChange,
      closeDropdownOnSelect,
      lazyInit = false,
      fetchOnScroll = false,
      setIsOpen,
      isOpen,
      preventInputUpdate,
      inputFilterFunction,
      inputUpdateDebounceDuration,
      isMultiValue = false,
      disableInputUpdate = false,
      hasInput = true,
      fetchOnInputChange = true,
      clearInputOnSelect,
      inputValue,
      setOptions,
      isLoading,
      setInputValue: customSetInputValue,
      selectOptions,
    } = props;

    const [defaultSelectState, dispatch] = useReducer(
      selectReducer,
      selectOptions,
      initializeState
    );

    const resolvedStateData = useSelectStateResolver(
      defaultSelectState,
      { selectOptions, inputValue, isOpen },
      {
        setIsOpen,
        setOptions,
        setInputValue: customSetInputValue,
        setValue: onChange,
      },
      isMultiValue,
      dispatch
    );

    const { selectState, selectStateUpdaters } = resolvedStateData;

    const selectApi = useSelect(selectState, selectStateUpdaters, {
      isMultiValue,
      labelKey,
      isCategorized,
      customCategorizeFunction: categorizeFunction,
      preventInputUpdate,
      disableInputUpdate,
      sortFunction,
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

    const { selectAsyncApi, selectAsyncState } = useSelectAsync(
      selectState,
      selectApi,
      selectStateUpdaters,
      {
        isLazyInit: lazyInit,
        recordsPerPage,
        fetchOnInputChange,
        fetchFunction,
        fetchOnScroll: selectApi.fetchOnScrollToBottom,
      }
    );

    const { loadNextPage, selectEventHandlers, handlePageReset } = selectApi;

    const { loadNextPageAsync, handlePageResetAsync, isInitialFetch } =
      selectAsyncApi;

    const resolvedPageValue = selectApi.fetchOnScrollToBottom
      ? selectAsyncState.page
      : selectState.page;

    const resolvedPageResetHandler = selectApi.usesInputAsync
      ? handlePageResetAsync
      : handlePageReset;

    const resolvedPageChangeHandler = selectApi.fetchOnScrollToBottom
      ? loadNextPage
      : loadNextPageAsync;

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
      onAfterOptionClick: props.onOptionClick,
      onAfterScrollToBottom: props.onAfterScrollToBottom,
      onAfterValueClear: props.onAfterValueClear,
    };

    return (
      <SelectContext.Provider value={data}>
        <Select
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
        />
      </SelectContext.Provider>
    );
  },
  arePropsEqual
);

export const useSelectContext = () => useContext(SelectContext);
