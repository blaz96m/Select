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
} from "src/components/Select/types/selectTypes";

import Select, { SelectProps } from "src/components/Select/Select";
import {
  useSelect,
  useSelectAsync,
  useSelectComputation,
  useSelectDomHelper,
} from "src/hooks/select";
import { selectReducer } from "../reducers/selectReducer";
import { initializeState } from "src/utils/select";
import { omit, isFunction, noop, every } from "lodash";
import { SelectAsyncStateSetters } from "src/hooks/select/useSelectAsync";
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
  getSelectStateSetters: () => SelectStateSetters;
  getSelectAsyncStateSetters: () => SelectAsyncStateSetters;
};

const SelectContext = createContext<SelectContext>({
  components: {},
  getSelectStateSetters: () => ({
    addOptions: noop,
    addValue: noop,
    clearAllValues: noop,
    clearInput: noop,
    clearValue: noop,
    closeDropdown: noop,
    loadNextPage: noop,
    openDropdown: noop,
    setFocusDetails: noop,
    setInputValue: noop,
    setOptions: noop,
    toggleDropdown: noop,
  }),
  getSelectAsyncStateSetters: () => ({
    clearSearchQuery: noop,
    goToNextPage: noop,
    setSearchQuery: noop,
  }),
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
      sorterFn,
      fetchFunc,
      recordsPerPage,
      removeSelectedOptionsFromList,
      value,
      onChange,
      isMultiValue,
      closeDropdownOnSelect,
      lazyInit,
      onOptionSelect,
      fetchOnScroll,
      useDataPartitioning,
      fetchOnInputChange = true,
      selectOptions = [],
    } = props;

    const [selectState, dispatch] = useReducer(
      selectReducer,
      selectOptions,
      initializeState
    );

    // The originalOptions ref is only used in case all the data for the select comes from the frontend, enabling the pagination of the options while storing the original value that never changes.
    const originalOptions = useRef<SelectOptionList>(selectState.selectOptions);
    const totalRecords = useRef<number>(0);

    const displayedOptions = useSelectComputation(
      { ...selectState, value },
      {
        isCategorized,
        labelKey,
        categoryKey,
        categorizeFunction,
        sorterFn,
        fetchFunc,
        recordsPerPage,
        removeSelectedOptionsFromList,
      }
    );

    const { domRefs, domHelpers } = useSelectDomHelper(selectState);

    const selectApi = useSelect(
      dispatch,
      { setValue: onChange },
      {
        ...selectState,
        displayedOptions,
        originalOptions: originalOptions.current,
        totalRecords: totalRecords.current,
      },
      domHelpers,
      {
        isMultiValue,
        labelKey,
        isCategorized,
        recordsPerPage,
        categoryKey,
        closeDropdownOnSelect,
        selectListContainerRef: domRefs.selectListContainerRef,
      }
    );

    const { getSelectStateSetters } = selectApi;

    const { selectAsyncApi, selectAsyncState } = useSelectAsync(
      selectState,
      selectApi,
      {
        isLazyInit: lazyInit,
        recordsPerPage,
        fetchOnInputChange,
        fetchFunc,
        fetchOnScroll,
        originalOptions,
        focusInput: domHelpers.focusInput,
        selectListContainerRef: domRefs.selectListContainerRef,
      }
    );

    const { isLastPage, getSelectAsyncStateSetters } = selectAsyncApi;

    const usesInputAsync = isFunction(fetchFunc) && fetchOnInputChange;
    const inputValue = usesInputAsync
      ? selectAsyncState.searchQuery
      : selectState.inputValue;

    const fetchOnScrollToBottom = isFunction(fetchFunc) && fetchOnScroll;

    const hasPaging = fetchOnScrollToBottom || useDataPartitioning;

    const page = fetchOnScrollToBottom
      ? selectAsyncState.page
      : selectState.page;

    const handleInputChange = useCallback(
      (value: string) => {
        const { setSearchQuery } = getSelectAsyncStateSetters();
        const { setInputValue } = getSelectStateSetters();
        usesInputAsync ? setSearchQuery(value) : setInputValue(value);
      },
      [usesInputAsync]
    );

    const handleInputClear = useCallback(() => {
      const selectAsyncStateSetters = getSelectAsyncStateSetters();
      const selectStateSetters = getSelectStateSetters();
      usesInputAsync
        ? selectAsyncStateSetters.clearSearchQuery()
        : selectStateSetters.clearInput();
    }, [usesInputAsync]);

    const handleNextPageChange = useCallback(() => {
      const { handlePageChangeAsync } = selectAsyncApi;
      const { handlePageChange } = selectApi;
      fetchOnScrollToBottom ? handlePageChangeAsync() : handlePageChange();
    }, [selectState.page, selectAsyncState.page]);

    const data = useMemo(
      () => ({
        components: { ...customComponents },
        getSelectStateSetters: selectApi.getSelectStateSetters,
        getSelectAsyncStateSetters: selectAsyncApi.getSelectAsyncStateSetters,
      }),
      []
    );

    return (
      <SelectContext.Provider value={data}>
        <Select
          hasPaging={hasPaging}
          usesInputAsync={usesInputAsync}
          selectApi={selectApi}
          inputValue={inputValue}
          categoryKey={categoryKey}
          disableInputFetchTrigger={props.disableInputFetchTrigger}
          displayedOptions={displayedOptions}
          focusedOptionId={selectState.focusedOptionId}
          value={value}
          isLastPage={isLastPage}
          isMultiValue={isMultiValue}
          isOpen={selectState.isOpen}
          labelKey={labelKey}
          onOptionSelect={onOptionSelect}
          page={page}
          removeSelectedOptionsFromList={removeSelectedOptionsFromList}
          selectDomHelpers={domHelpers}
          selectDomRefs={domRefs}
          closeDropdownOnSelect={closeDropdownOnSelect}
          hasInput={props.hasInput}
          isCategorized={isCategorized}
          isLoading={props.isLoading}
          onInputChange={props.onInputChange}
          onPageChange={props.onPageChange}
          onScrollToBottom={props.onScrollToBottom}
          placeHolder={props.placeHolder}
          handlePageChange={handleNextPageChange}
          fetchOnScroll={fetchOnScrollToBottom}
          showClearIndicator={props.showClearIndicator}
        />
      </SelectContext.Provider>
    );
  },
  arePropsEqual
);

export const useSelectContext = () => useContext(SelectContext);
