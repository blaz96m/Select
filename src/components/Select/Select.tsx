import React, {
  useCallback,
  useReducer,
  useRef,
  useEffect,
  Dispatch,
  useMemo,
  SetStateAction,
  memo,
} from "react";
import {
  filter,
  hasIn,
  noop,
  map,
  create,
  isEmpty,
  isFunction,
  isNil,
  slice,
  find,
  includes,
  some,
} from "lodash";

import { DEFAULT_SELECT_PLACEHOLDER } from "src/utils/select/constants";
import { Spinner } from "src/components/Spinner";
import {
  SelectContainer,
  SelectInput,
  SelectValue,
  SelectTopSection,
  OptionList,
  SelectOption,
  SelectValueSection,
  SelectIndicatorSection,
  SelectDropdownIndicator,
  SelectClearIndicator,
} from "src/components/Select";
import { selectReducer } from "src/stores/reducers/selectReducer";
import {
  filterOptionListBySearchValue,
  initializeState,
} from "src/utils/select";

import {
  CategorizedSelectOptions,
  SelectCustomComponents,
  SelectFetchFunc,
  SelectOptionList,
  SelectOptionT,
  SelectSorterFunction,
  selectRendererOverload,
} from "./types";
import { useSelect, useSelectRef } from "src/hooks/select";
import "./styles/_select.scss";
import useSelectComputation from "src/hooks/select/useSelectComputation";
import SelectCategory from "../SelectCategory";
import useSelectAsync from "src/hooks/select/useSelectAsync";
import SelectTopContainer from "./SelectTopSection";

export type SelectProps = {
  value: SelectOptionT[] | [];
  labelKey: keyof SelectOptionT;
  isCategorized?: boolean;
  selectOptions?: SelectOptionT[] | [];
  onChange: Dispatch<SetStateAction<SelectOptionT[]>>;
  hasInput?: boolean;
  fetchOnScroll?: boolean;
  lazyInit?: boolean;
  isMultiValue: boolean;
  closeDropdownOnOptionSelect?: boolean;
  placeHolder?: string;
  onInputChange?: (inputValue?: string) => {};
  onScrollToBottom?: (
    page: number,
    options: SelectOptionList | CategorizedSelectOptions
  ) => void;
  closeDropdownOnSelect?: boolean;
  fetchFunc?: SelectFetchFunc;
  sorterFn?: SelectSorterFunction;
  fetchOnInputChange: boolean;
  removeSelectedOptionsFromList: boolean;
  disableInputFetchTrigger: boolean;
  onPageChange?: (page: number) => void;
  categoryKey: keyof SelectOptionT & string;
  showClearIndicator?: boolean;
  useDataPartitioning?: boolean;
  isLoading?: boolean;
  categorizeFunction?: (options: SelectOptionList) => CategorizedSelectOptions;
  recordsPerPage?: number;
  customComponents: SelectCustomComponents;
};

const Select = ({
  value,
  onChange,
  isMultiValue,
  onInputChange,
  placeHolder = DEFAULT_SELECT_PLACEHOLDER,
  selectOptions = [],
  categorizeFunction,
  labelKey = "name",
  isCategorized = false,
  sorterFn,
  fetchFunc,
  lazyInit,
  closeDropdownOnOptionSelect,
  useDataPartitioning,
  onScrollToBottom,
  onPageChange,
  recordsPerPage = 15,
  closeDropdownOnSelect = false,
  fetchOnInputChange = true,
  disableInputFetchTrigger = false,
  hasInput = true,
  fetchOnScroll = false,
  removeSelectedOptionsFromList = true,
  showClearIndicator = true,
  customComponents = {},
  categoryKey = "",
  isLoading
}: SelectProps) => {
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

  const { refs, refHelpers } = useSelectRef(selectState);

  const {focusInput} = refHelpers 

  const { selectListContainerRef } = refs

  const selectApi = useSelect(
    dispatch,
    { setValue: onChange },
    {
      ...selectState,
      displayedOptions,
      originalOptions: originalOptions.current,
      totalRecords: totalRecords.current,
    },
    refHelpers,
    {
      isMultiValue,
      labelKey,
      isCategorized,
      recordsPerPage,
      categoryKey,
      closeDropdownOnOptionSelect,
      selectListContainerRef
    }
  );

  const {
    getSelectStateSetters,
    handlePageChange,
    filterSearchedOptions,
    focusOptionAfterClick,
    getFocusValues,
    focusLastOption,
    focusFirstOption,
    addOptionOnKeyPress,
  } = selectApi;

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
      focusInput,
      selectListContainerRef: refs.selectListContainerRef
    }
  );

  const { isLastPage, getSelectAsyncStateSetters } = selectAsyncApi;
  const usesInputAsync = isFunction(fetchFunc) && fetchOnInputChange;
  const selectInputValue = usesInputAsync
    ? selectAsyncState.searchQuery
    : selectState.inputValue;

  const fetchOnScrollToBottom = isFunction(fetchFunc) && fetchOnScroll;

  const hasPaging = fetchOnScrollToBottom || useDataPartitioning;

  const currentPage = fetchOnScrollToBottom
    ? selectAsyncState.page
    : selectState.page;

    const handleInputChange = useCallback((value: string) => {
      const {setSearchQuery} = getSelectAsyncStateSetters();
      const {setInputValue} = getSelectStateSetters();
      usesInputAsync ? setSearchQuery(value) : setInputValue(value)

}, [usesInputAsync])

  const handleInputClear = useCallback(() => {
    const selectAsyncStateSetters = getSelectAsyncStateSetters();
    const selectStateSetters = getSelectStateSetters();
     usesInputAsync ? selectAsyncStateSetters.clearSearchQuery() : selectStateSetters.clearInput();
  }, [usesInputAsync]);



  const handleNextPageChange = useCallback(() => {
    const { handlePageChangeAsync } = selectAsyncApi;
    const { handlePageChange } = selectApi;
    fetchOnScrollToBottom ? handlePageChangeAsync() : handlePageChange()
  }, [selectState.page, selectAsyncState.page])



  const renderOptionElement = useCallback(
    (option: SelectOptionT) => {
      const isSelected =
        !removeSelectedOptionsFromList &&
        some(value, (val) => val.id == option.id);
      const isFocused = selectState.focusedOptionId == option.id;
      return (
        <SelectOption
          isMultiValue={isMultiValue}
          closeDropdownOnOptionSelect={closeDropdownOnSelect}
          key={option.id}
          option={option}
          getSelectOptionsMap={refHelpers.getSelectOptionsMap}
          getSelectStateSetters={getSelectStateSetters}
          handleInputClear={handleInputClear}
          handleFocusOnClick={focusOptionAfterClick}
          categoryKey={categoryKey}
          isCategorized={isCategorized}
          labelKey={labelKey}
          focusInput={refHelpers.focusInput}
          isFocused={isFocused}
          isSelected={isSelected}
          removeSelectedOptionsFromList={removeSelectedOptionsFromList}
          customComponent={customComponents.SelectOptionElement}
        />
      );
    },

    [
      isMultiValue,
      closeDropdownOnSelect,
      labelKey,
      selectState.focusedOptionId,
      value,
    ]
  );

  const selectRenderFn: selectRendererOverload = useCallback(
    (value) => {
      if (value.categoryOptions) {
        const { categoryName, categoryOptions } = value;
        return (
          <SelectCategory
            key={categoryName}
            categoryName={categoryName}
            categoryOptions={categoryOptions}
            customComponent={customComponents.SelectCategoryElement}
            renderOption={renderOptionElement}
          />
        );
      } else {
        return renderOptionElement(value as SelectOptionT);
      }
    },
    [
      isMultiValue,
      closeDropdownOnSelect,
      labelKey,
      selectState.focusedOptionId,
      value,
    ]
  );

  return (
    <Select.Container>
      <Select.Top focusInput={refHelpers.focusInput}>
        <Select.ValueSection isMultiValue={isMultiValue}>
          <Select.Value
            getSelectStateSetters={getSelectStateSetters}
            labelKey={labelKey}
            isMultiValue={isMultiValue}
            placeHolder={placeHolder}
            inputValue={selectInputValue}
            value={value}
            singleValueCustomComponent={
              customComponents.SelectSingleValueElement
            }
            multiValueCustomComponent={customComponents.SelectMultiValueElement}
          />

          <Select.Input
            inputValue={selectInputValue}
            isMultiValue={isMultiValue}
            customOnChange={onInputChange}
            labelKey={labelKey}
            getSelectStateSetters={getSelectStateSetters}
            getFocusValues={getFocusValues}
            focusFirstOption={focusFirstOption}
            focusLastOption={focusLastOption}
            addOptionOnKeyPress={addOptionOnKeyPress}
            handlePageChange={handleNextPageChange}
            usesInputAsync={usesInputAsync}
            key="select-input"
            isLastPage={isLastPage}
            setInput={handleInputChange}
            onKeyPress={refHelpers.handleScrollToFocusedOption}
            filterSearchedOptions={filterSearchedOptions}
            disableInputFetchTrigger={disableInputFetchTrigger}
            isLoading={isLoading}
            customComponent="yep"
            ref={refs.inputRef}
            hasInput={hasInput}
            renderInputContainerForCustomComponent="nope"
          />
        </Select.ValueSection>
        <Select.IndicatorSection isLoading={isLoading} spinner={<Select.Spinner />}>
          <Select.DropdownIndicator
            focusInput={refHelpers.focusInput}
            getSelectStateSetters={getSelectStateSetters}
            focusFirstOption={focusFirstOption}
            customComponent={customComponents.SelectDropdownIndicatorElement}
            isOpen={selectState.isOpen}
            isLoading={isLoading}
          />
          {showClearIndicator && (
            <Select.ClearIndicator
              getSelectStateSetters={getSelectStateSetters}
              isMultiValue={isMultiValue}
              value={value}
              inputValue={selectInputValue}
              clearInput={handleInputClear}
              customComponent={customComponents.SelectClearIndicatorElement}
              isLoading={isLoading}
            /> 
          )}
        </Select.IndicatorSection>
      </Select.Top>
      {selectState.isOpen && (
        <Select.OptionList
          categoryKey={categoryKey}
          ref={refs.selectListContainerRef}
          displayedOptions={displayedOptions}
          handlePageChange={handleNextPageChange}
          customOnScrollToBottom={onScrollToBottom}
          onPageChange={onPageChange}
          page={currentPage}
          hasPaging={hasPaging}
          isLoading={isLoading}
          renderFn={selectRenderFn}
          isCategorized={isCategorized}
        />
      )}
    </Select.Container>
  );
};

Select.Container = memo(SelectContainer);
Select.Top = memo(SelectTopSection);
Select.ValueSection = memo(SelectValueSection);
Select.IndicatorSection = memo(SelectIndicatorSection);
Select.Spinner = Spinner;
Select.Value = SelectValue;
Select.Input = SelectInput;
Select.DropdownIndicator = SelectDropdownIndicator;
Select.ClearIndicator = SelectClearIndicator;
Select.OptionList = OptionList;
export default Select;
