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
  getSelectStateSetters: () => SelectStateSetters;
};

const SelectContext = createContext<SelectContext>({
  components: {},
  getSelectStateSetters: () => ({
    addOptions: noop,
    selectValue: noop,
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
      onDropdownExpand,
      onChange,
      onInputChange: customOnInputChange,
      isMultiValue,
      closeDropdownOnSelect,
      lazyInit,
      fetchOnScroll,
      useDataPartitioning,
      preventInputUpdate,
      inputFilterFunction,
      onDropdownCollapse,
      inputUpdateDebounceDuration,
      disableInputUpdate = false,
      hasInput = true,
      fetchOnInputChange = true,
      clearInputOnSelect: customClearInputOnSelect,
      onValueClear,
      onOptionSelect,
      isLoading,
      selectOptions = [],
    } = props;

    const [selectState, dispatch] = useReducer(
      selectReducer,
      selectOptions,
      initializeState
    );

    // The originalOptions ref is only used in case all the data for the select comes from the frontend, enabling the partitioning of the options while storing the original value that never changes.
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

    const useInputAsync = isFunction(fetchFunc) && fetchOnInputChange;

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
        onDropdownExpand,
        isCategorized,
        recordsPerPage,
        hasInput,
        useInputAsync,
        fetchFunction: fetchFunc,
        preventInputUpdate,
        disableInputUpdate,
        onValueClear,
        onDropdownCollapse,
        clearInputOnSelect: customClearInputOnSelect,
        inputUpdateDebounceDuration,
        focusInput: domHelpers.focusInput,
        removeSelectedOptionsFromList,
        categoryKey,
        isLoading,
        closeDropdownOnSelect,
        selectListContainerRef: domRefs.selectListContainerRef,
        inputFilterFunction,
      }
    );

    const {
      setInputValue,
      handleInputUpdatePrevention,
      handleOptionsSearchTrigger,
      onOptionClick,
      onInputUpdate,
      toggleDropdown,
      handleClearIndicatorClick,
      onDropdownClick,
      handleValueClear,
      clearInputOnSelect,
    } = selectApi;

    const { selectAsyncApi, selectAsyncState } = useSelectAsync(
      selectState,
      selectApi,
      {
        isLazyInit: lazyInit,
        recordsPerPage,
        fetchOnInputChange,
        onDropdownExpand: selectApi.onDropdownExpand,
        fetchFunc,
        fetchOnScroll,
        originalOptions,
        focusInput: domHelpers.focusInput,
        selectListContainerRef: domRefs.selectListContainerRef,
        inputValue: selectState.inputValue,
        setInputValue,
      }
    );

    const { isLastPage, getIsInitialFetch, resetPage } = selectAsyncApi;

    const isInitialFetch = getIsInitialFetch();

    const isLazyInitFetchComplete = lazyInit && isInitialFetch;

    const fetchOnScrollToBottom = isFunction(fetchFunc) && fetchOnScroll;

    const hasPaging = fetchOnScrollToBottom || useDataPartitioning;

    const page = fetchOnScrollToBottom
      ? selectAsyncState.page
      : selectState.page;

    const resolvedSelectState = { ...selectState, page };

    const handleNextPageChange = useCallback(() => {
      const { handlePageChangeAsync } = selectAsyncApi;
      const { handlePageChange } = selectApi;
      fetchOnScrollToBottom ? handlePageChangeAsync() : handlePageChange();
    }, [selectState.page, selectAsyncState.page]);

    const handleInputChange = useCallback(
      (inputValue: string) => {
        onInputUpdate();
        if (useInputAsync) {
          resetPage();
        }
        isFunction(customOnInputChange) && customOnInputChange(inputValue);
      },
      [resetPage, selectState.inputValue]
    );

    const handleOptionClick = (
      option: SelectOptionT,
      optionIndex: number,
      isSelected: boolean,
      handleOptionFocusAfterClick: (
        optionIndex: number,
        optionCategory: string
      ) => void
    ) => {
      onOptionClick(
        option,
        optionIndex,
        isSelected,
        handleOptionFocusAfterClick
      );
      if (clearInputOnSelect && useInputAsync) {
        resetPage();
      }
      isFunction(onOptionSelect) && onOptionSelect(option);
    };

    const handleDropdownClick = useCallback(() => {
      if (isLoading) return;
      const isFetchingData = isFunction(fetchFunc) && !isLazyInitFetchComplete;
      const willOpen = !selectState.isOpen;
      if (isFetchingData && willOpen) {
        flushSync(() => toggleDropdown());
      } else {
        toggleDropdown();
      }
      onDropdownClick(willOpen);
    }, [selectState.isOpen, fetchFunc, isLazyInitFetchComplete]);

    const data = useMemo(
      () => ({
        components: { ...customComponents },
        getSelectStateSetters: selectApi.getSelectStateSetters,
      }),
      []
    );

    return (
      <SelectContext.Provider value={data}>
        <Select
          {...props}
          selectState={resolvedSelectState}
          selectApi={selectApi}
          selectDomHelpers={domHelpers}
          selectDomRefs={domRefs}
          onDropdownExpand={onDropdownExpand}
          preventInputUpdate={handleInputUpdatePrevention}
          handleOptionsSearchTrigger={handleOptionsSearchTrigger}
          useInputAsync={useInputAsync}
          handleOptionClick={handleOptionClick}
          handleValueClear={handleValueClear}
          handleClearIndicatorClick={handleClearIndicatorClick}
          resetPage={resetPage}
          handleInputChange={handleInputChange}
          handleDropdownClick={handleDropdownClick}
          setInputValue={setInputValue}
          isLazyInitFetchComplete={isLazyInitFetchComplete}
          isLastPage={isLastPage}
          displayedOptions={displayedOptions}
          hasPaging={hasPaging}
          handlePageChange={handleNextPageChange}
        />
      </SelectContext.Provider>
    );
  },
  arePropsEqual
);

export const useSelectContext = () => useContext(SelectContext);
