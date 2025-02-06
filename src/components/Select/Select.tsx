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
  join,
  some,
  split,
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
  CustomPreventInputUpdate,
  HandleClearIndicatorClick,
  HandleValueClear,
  OptionClickHandler,
  PreventInputUpdate,
  SelectCategoryT,
  SelectCustomComponents,
  SelectFetchFunc,
  SelectOptionList,
  SelectOptionT,
  SelectSorterFunction,
  SelectState,
  selectRendererOverload,
} from "./types";

import "./styles/_select.scss";

import SelectCategory from "../SelectCategory";
import { SelectApi } from "src/hooks/select/useSelect";
import {
  SelectDomHelpers,
  SelectDomRefs,
} from "src/hooks/select/useSelectDomHelper";
import { useSelectFocus } from "src/hooks/select";

export type SelectComponentProps = SelectProps & {
  useInputAsync: boolean;
  isLastPage: () => boolean;
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  preventInputUpdate: PreventInputUpdate;
  handlePageChange: () => void;
  handleValueClear: HandleValueClear;
  setInputValue: (inputValue: string) => void;
  handleOptionClick: OptionClickHandler;
  handleClearIndicatorClick: HandleClearIndicatorClick;
  handleDropdownClick: () => void;
  handleInputChange: (inputValue: string) => void;
  resetPage: () => void;
  hasPaging?: boolean;
  isLazyInitFetchComplete?: boolean;
} & { selectState: SelectState } & {
  selectApi: SelectApi;
} & {
  selectDomHelpers: SelectDomHelpers;
} & {
  selectDomRefs: SelectDomRefs;
};

export type SelectProps = {
  value: SelectOptionT[] | [];
  labelKey: keyof SelectOptionT;
  onChange: Dispatch<SetStateAction<SelectOptionT[]>>;
  isMultiValue: boolean;
  closeDropdownOnSelect?: boolean;
  fetchOnInputChange: boolean;
  removeSelectedOptionsFromList: boolean;
  disableInputFetchTrigger: boolean;
  disableInputUpdate: boolean;
  onValueClear: HandleValueClear;
  handlePageChange: () => void;
  clearInputOnSelect?: boolean;
  categoryKey: keyof SelectOptionT & string;
  onOptionSelect?: (option: SelectOptionT) => void;
  isCategorized?: boolean;
  selectOptions?: SelectOptionT[] | [];
  fetchOnScroll?: boolean;
  isOptionDisabled?: (option: SelectOptionT) => boolean;
  inputFilterFunction: (
    selectOptions: SelectOptionList,
    inputValue: string
  ) => SelectOptionList;

  lazyInit?: boolean;
  hasInput: boolean;
  handlePageReset: () => void;
  useInputUpdateTriggerEffect: boolean;
  inputUpdateDebounceDuration?: number;
  handleOptionsSearchTrigger: () => void;
  placeHolder?: string;
  preventInputUpdate: CustomPreventInputUpdate;
  fetchFunc?: SelectFetchFunc;
  sorterFn?: SelectSorterFunction;
  onInputChange: (inputValue: string) => void;
  onScrollToBottom?: (
    page: number,
    options: SelectOptionList | CategorizedSelectOptions
  ) => void;
  onPageChange?: (page: number) => void;
  showClearIndicator?: boolean;
  useDataPartitioning?: boolean;
  isLoading?: boolean;
  onDropdownExpand?: () => void;
  onDropdownCollapse?: () => void;
  categorizeFunction?: (options: SelectOptionList) => CategorizedSelectOptions;
  recordsPerPage?: number;
};

const Select = ({
  value,
  isMultiValue,
  isLoading,
  onScrollToBottom,
  onPageChange,
  selectApi,
  selectState,
  hasPaging,
  displayedOptions,
  selectDomHelpers,
  selectDomRefs,
  handlePageChange,
  isOptionDisabled,
  preventInputUpdate,
  handleOptionClick,
  handleInputChange,
  handleOptionsSearchTrigger,
  setInputValue,
  handleValueClear,
  resetPage,
  handleDropdownClick,
  handleClearIndicatorClick,
  closeDropdownOnSelect = false,
  disableInputFetchTrigger = false,
  hasInput = true,
  removeSelectedOptionsFromList = true,
  showClearIndicator = true,
  categoryKey = "",
  placeHolder = DEFAULT_SELECT_PLACEHOLDER,
  labelKey = "name",
  isCategorized = false,
}: SelectComponentProps) => {
  const { getSelectOptionsMap, focusInput, handleScrollToFocusedOption } =
    selectDomHelpers;

  const { filterSearchedOptions } = selectApi;

  const { inputRef, selectListContainerRef } = selectDomRefs;

  const { isOpen, inputValue, page } = selectState;

  const { selectFocusHandlers, state: focusState } = useSelectFocus({
    displayedOptions,
    isCategorized,
    categoryKey,
    handleScrollToFocusedOption,
  });

  const { focusedOptionCategory, focusedOptionIndex } = focusState;

  const {
    focusNextOption,
    focusPreviousOption,
    setFocusOnHover,
    handleOptionFocusOnSelectByClick,
    handleOptionFocusOnSelectByKeyPress,
    isOptionFocused,
    handleOptionHover,
  } = selectFocusHandlers;

  const handleOptionRender = useCallback(
    (
      option: SelectOptionT,
      index: number,
      isFocused: boolean,
      isDisabled: boolean,
      isSelected: boolean
    ) => {
      return (
        <SelectOption
          key={option.id}
          option={option}
          optionIndex={index}
          getSelectOptionsMap={getSelectOptionsMap}
          handleFocusOnClick={handleOptionFocusOnSelectByClick}
          onSelect={handleOptionClick}
          handleHover={handleOptionHover}
          categoryKey={categoryKey}
          isCategorized={isCategorized}
          resetPage={resetPage}
          labelKey={labelKey}
          isFocused={isFocused}
          isSelected={isSelected}
          isDisabled={isDisabled}
          removeSelectedOptionsFromList={removeSelectedOptionsFromList}
        />
      );
    },
    [
      handleOptionFocusOnSelectByClick,
      isMultiValue,
      closeDropdownOnSelect,
      labelKey,
      removeSelectedOptionsFromList,
      resetPage,
      isCategorized,
      categoryKey,
      setFocusOnHover,
    ]
  );

  const renderOptionFromList = useCallback(
    (option: SelectOptionT, index: number) => {
      const isFocused = isOptionFocused(option, index);
      const isDisabled =
        isFunction(isOptionDisabled) && isOptionDisabled(option);
      const isSelected =
        !removeSelectedOptionsFromList &&
        some(value, (val) => val.id == option.id);
      return handleOptionRender(
        option,
        index,
        isFocused,
        isDisabled,
        isSelected
      );
    },
    [handleOptionRender, isOptionFocused, isOptionDisabled, value]
  );

  const renderOptionFromCategory = useCallback(
    (
      option: SelectOptionT,
      index: number,
      focusedOptionIdx: number | null,
      selectedOptions: SelectOptionList | null
    ) => {
      const isFocused = focusedOptionIdx === index;
      const isDisabled =
        isFunction(isOptionDisabled) && isOptionDisabled(option);
      const isSelected = some(
        selectedOptions,
        (selectedOption) => selectedOption.id === option.id
      );

      return handleOptionRender(
        option,
        index,
        isFocused,
        isDisabled,
        isSelected
      );
    },
    [isOptionDisabled, handleOptionRender]
  );

  const renderCategory = useCallback(
    (category: SelectCategoryT) => {
      const { categoryName, categoryOptions } = category;
      const isCategoryFocused =
        categoryName === focusState.focusedOptionCategory;
      const focusedOptionIdx = isCategoryFocused
        ? focusState.focusedOptionIndex
        : -1;
      const selectedOptionsInCategory = filter(
        value,
        (val) => val[categoryKey] === categoryName
      );

      return (
        <SelectCategory
          key={categoryName}
          categoryName={categoryName}
          focusedOptionIdx={focusedOptionIdx}
          categoryOptions={categoryOptions}
          selectedOptions={
            !isEmpty(selectedOptionsInCategory)
              ? selectedOptionsInCategory
              : null
          }
          renderOption={renderOptionFromCategory}
        />
      );
    },
    [focusedOptionCategory, focusedOptionIndex, isOptionDisabled, value]
  );

  return (
    <Select.Container>
      <Select.Top handleDropdownClick={handleDropdownClick}>
        <Select.ValueSection isMultiValue={isMultiValue}>
          <Select.Value
            labelKey={labelKey}
            isMultiValue={isMultiValue}
            placeHolder={placeHolder}
            inputValue={inputValue}
            handleValueClear={handleValueClear}
            value={value}
          />

          <Select.Input
            onInputChange={handleInputChange}
            inputValue={inputValue}
            focusNextOption={focusNextOption}
            focusPreviousOption={focusPreviousOption}
            addOptionOnKeyPress={handleOptionFocusOnSelectByKeyPress}
            setInput={setInputValue}
            handleOptionsSearchTrigger={handleOptionsSearchTrigger}
            preventInputUpdate={preventInputUpdate}
            key="select-input"
            disableInputFetchTrigger={disableInputFetchTrigger}
            isLoading={isLoading}
            ref={inputRef}
            hasInput={hasInput}
          />
        </Select.ValueSection>
        <Select.IndicatorSection
          isLoading={isLoading}
          spinner={<Select.Spinner />}
        >
          <Select.DropdownIndicator isOpen={isOpen} isLoading={isLoading} />
          {showClearIndicator && (
            <Select.ClearIndicator
              handleClearIndicatorClick={handleClearIndicatorClick}
              isLoading={isLoading}
            />
          )}
        </Select.IndicatorSection>
      </Select.Top>
      {isOpen && (
        <Select.OptionList
          categoryKey={categoryKey}
          ref={selectListContainerRef}
          displayedOptions={displayedOptions}
          customOnScrollToBottom={onScrollToBottom}
          handlePageChange={handlePageChange}
          onPageChange={onPageChange}
          page={page}
          hasPaging={hasPaging}
          isLoading={isLoading}
          renderFunction={isCategorized ? renderCategory : renderOptionFromList}
          isCategorized={isCategorized}
        />
      )}
    </Select.Container>
  );
};

Select.Container = SelectContainer;
Select.Top = SelectTopSection;
Select.ValueSection = memo(SelectValueSection);
Select.IndicatorSection = memo(SelectIndicatorSection);
Select.Spinner = Spinner;
Select.Value = memo(SelectValue);
Select.Input = memo(SelectInput);
Select.DropdownIndicator = memo(SelectDropdownIndicator);
Select.ClearIndicator = memo(SelectClearIndicator);
Select.OptionList = memo(OptionList);
export default Select;
