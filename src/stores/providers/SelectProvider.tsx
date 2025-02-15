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
  useSelectDomHelper,
  useSelectPropertiesResolver,
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
      closeDropdownOnSelect: customCloseDropdownOnSelect,
      lazyInit = false,
      fetchOnScroll = false,
      setIsOpen,
      isOpen,
      preventInputUpdate: customPreventInputUpdate,
      inputFilterFunction,
      inputUpdateDebounceDuration,
      isMultiValue = false,
      disableInputUpdate = false,
      hasInput = true,
      fetchOnInputChange = true,
      clearInputOnSelect: customClearInputOnSelect,
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

    const { selectState, resolvedStateUpdatters: selectStateUpdaters } =
      useSelectStateResolver(
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

    const resolvedSelectProperties = useSelectPropertiesResolver(
      {
        fetchFunction,
        fetchOnInputChange,
        hasInput,
        disableInputUpdate,
        customClearInputOnSelect,
        customPreventInputUpdate,
        isMultiValue,
        fetchOnScroll,
        recordsPerPage,
        customCloseDropdownOnSelect,
      },
      selectState
    );

    const {
      closeDropdownOnSelect,
      fetchOnScrollToBottom,
      hasPaging,
      preventInputUpdate,
      usesInputAsync,
      clearInputOnSelect,
    } = resolvedSelectProperties;

    const selectApi = useSelect(selectState, selectStateUpdaters, {
      isMultiValue,
      labelKey,
      isCategorized,
      customCategorizeFunction: categorizeFunction,
      sortFunction,
      fetchOnScroll,
      recordsPerPage,
      usesInputAsync,
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
      handleOptionsSearchTrigger,
      selectDomRefs,
      displayedOptions,
      filterSearchedOptions,
      loadNextPage,
      onDropdownExpand,
      selectEventHandlers,
      handlePageReset,
      getOriginalOptions,
      focusInput,
      getSelectOptionsMap,

      setOriginalOptions,
    } = selectApi;

    const { selectAsyncApi, selectAsyncState } = useSelectAsync(selectState, {
      isLazyInit: lazyInit,
      recordsPerPage,
      fetchOnInputChange,
      onDropdownExpand: selectApi.onDropdownExpand,
      fetchFunction,
      fetchOnScroll: fetchOnScrollToBottom,
      selectStateUpdaters,
      getOriginalOptions,
      setOriginalOptions,
      focusInput,
      selectListContainerRef: selectDomRefs.selectListContainerRef,
      inputValue: selectState.inputValue,
      setInputValue: selectStateUpdaters.setInputValue,
    });

    const {
      isLastPage,
      loadNextPageAsync,
      handlePageResetAsync,
      isInitialFetch,
    } = selectAsyncApi;

    const resolvedPageValue = fetchOnScrollToBottom
      ? selectAsyncState.page
      : selectState.page;

    const resolvedPageResetHandler = usesInputAsync
      ? handlePageResetAsync
      : handlePageReset;

    const resolvedPageChangeHandler = fetchOnScrollToBottom
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
          selectDomRefs={selectDomRefs}
          defaultSelectEventHandlers={selectEventHandlers}
          customSelectEventHandlers={customSelectEventHandlers}
          eventHandlerFollowups={selectEventHandlerFollowups}
          preventInputUpdate={preventInputUpdate}
          handleOptionsSearchTrigger={handleOptionsSearchTrigger}
          isInitialFetch={isInitialFetch}
          onDropdownExpand={onDropdownExpand}
          fetchOnScrollToBottom={fetchOnScrollToBottom}
          usesInputAsync={usesInputAsync}
          closeDropdownOnSelect={closeDropdownOnSelect}
          getSelectOptionsMap={getSelectOptionsMap}
          clearInputOnSelect={clearInputOnSelect}
          selectStateUpdaters={selectStateUpdaters}
          handlePageReset={resolvedPageResetHandler}
          handlePageChange={resolvedPageChangeHandler}
          setInputValue={selectStateUpdaters.setInputValue}
          isLastPage={isLastPage}
          displayedOptions={displayedOptions}
          hasPaging={hasPaging}
        />
      </SelectContext.Provider>
    );
  },
  arePropsEqual
);

export const useSelectContext = () => useContext(SelectContext);
