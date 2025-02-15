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
  CustomSelectCategorizeFunction,
  DefaultSelectEventHandlers,
  HandleClearIndicatorClick,
  HandleValueClear,
  InputChangeHandler,
  OptionClickHandler,
  PreventInputUpdate,
  SelectCategoryT,
  SelectCustomComponents,
  CustomSelectEventHandlers,
  SelectFetchFunc,
  SelectOptionList,
  SelectOptionT,
  SelectSorterFunction,
  SelectState,
  StateSetter,
  selectRendererOverload,
  CustomOptionClickHandler,
  CustomValueClearClickHandler,
  CustomClearIndicatorClickHandler,
  DropdownClickHandler,
  CustomScrollToBottomHandler,
  EventHandlerFollowupFunctions,
  SelectStateUpdaters,
} from "./types";

import "./styles/_select.scss";

import SelectCategory from "../SelectCategory";
import { SelectApi } from "src/hooks/select/useSelect";
import {
  SelectDomHelpers,
  SelectDomRefs,
} from "src/hooks/select/useSelectDomHelper";
import {
  useSelectEventHandlerResolver,
  useSelectFocus,
} from "src/hooks/select";

export type SelectComponentProps = SelectProps & {
  selectApi: SelectApi;
  selectStateUpdaters: SelectStateUpdaters;
  defaultSelectEventHandlers: DefaultSelectEventHandlers;
  customSelectEventHandlers: CustomSelectEventHandlers;
  eventHandlerFollowups: EventHandlerFollowupFunctions;
  handlePageChange: () => void;
  isInitialFetch: () => boolean;
  handlePageReset: () => void;
  selectState: SelectState;
};

export type SelectProps = {
  value: SelectOptionT[] | [];
  onOptionClick?: CustomOptionClickHandler;
  onAfterOptionClick?: CustomOptionClickHandler;
  onClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onAfterClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onDropdownClick?: DropdownClickHandler;
  onAfterDropdownClick?: DropdownClickHandler;
  onInputUpdate?: InputChangeHandler;
  onAfterInputUpdate?: InputChangeHandler;
  onValueClear?: CustomValueClearClickHandler;
  onAfterValueClear?: CustomValueClearClickHandler;
  onScrollToBottom?: CustomScrollToBottomHandler;
  onAfterScrollToBottom?: CustomScrollToBottomHandler;
  labelKey: keyof SelectOptionT;
  onChange: Dispatch<SetStateAction<SelectOptionT[]>>;
  isMultiValue: boolean;
  closeDropdownOnSelect?: boolean;
  fetchOnInputChange: boolean;
  removeSelectedOptionsFromList: boolean;
  disableInputFetchTrigger: boolean;
  disableInputUpdate: boolean;
  inputValue?: string;
  clearInputOnSelect: boolean;
  categoryKey: keyof SelectOptionT & string;
  isCategorized?: boolean;
  setInputValue?: StateSetter<string>;
  selectOptions?: SelectOptionT[] | undefined;
  setOptions?: StateSetter<SelectOptionList>;
  fetchOnScroll: boolean;
  isOptionDisabled?: (option: SelectOptionT) => boolean;
  inputFilterFunction: (
    selectOptions: SelectOptionList,
    inputValue: string
  ) => SelectOptionList;
  lazyInit: boolean;
  hasInput: boolean;
  isOpen?: boolean;
  setIsOpen?: StateSetter<boolean>;
  useInputUpdateTriggerEffect: boolean;
  inputUpdateDebounceDuration?: number;
  handleOptionsSearchTrigger: () => void;
  placeHolder?: string;
  preventInputUpdate: CustomPreventInputUpdate;
  fetchFunction?: SelectFetchFunc;
  sortFunction?: SelectSorterFunction;
  onPageChange?: (page: number) => void;
  showClearIndicator?: boolean;
  useDataPartitioning?: boolean;
  isLoading?: boolean;
  categorizeFunction?: CustomSelectCategorizeFunction;
  recordsPerPage?: number;
};

const Select = ({
  isMultiValue,
  isLoading,
  selectState,
  lazyInit = false,
  isOptionDisabled,
  selectApi,
  defaultSelectEventHandlers,
  customSelectEventHandlers,
  eventHandlerFollowups,
  isInitialFetch,
  fetchFunction,
  selectStateUpdaters,
  handlePageChange,
  handlePageReset,
  // TODO HANDLE THIS PROP
  disableInputFetchTrigger = false,
  hasInput = true,
  removeSelectedOptionsFromList = true,
  showClearIndicator = true,
  categoryKey = "",
  placeHolder = DEFAULT_SELECT_PLACEHOLDER,
  labelKey = "name",
  isCategorized = false,
}: SelectComponentProps) => {
  const { selectDomRefs, displayedOptions, getSelectOptionsMap } = selectApi;

  const { inputRef, selectListContainerRef } = selectDomRefs;

  const { isOpen, inputValue, value } = selectState;

  const { selectFocusHandlers, selectFocusState } = useSelectFocus({
    displayedOptions,
    isCategorized,
    categoryKey,
    getSelectOptionsMap,
    selectListContainerRef,
  });

  const {
    focusNextOption,
    focusPreviousOption,
    resetFocus,
    handleOptionFocusOnSelectByClick,
    handleOptionFocusOnSelectByKeyPress,
    isOptionFocused,
    handleOptionHover,
  } = selectFocusHandlers;

  const { focusedOptionCategory, focusedOptionIndex } = selectFocusState;

  const selectEventHandlers = useSelectEventHandlerResolver(
    defaultSelectEventHandlers,
    customSelectEventHandlers,
    eventHandlerFollowups,
    selectStateUpdaters,
    selectState,
    selectApi,
    {
      isLoading,
      fetchFunction,
      isInitialFetch,
      handlePageChange,
      handlePageReset,
      handleFocusOnClick: handleOptionFocusOnSelectByClick,
      resetFocus,
      lazyInit,
    }
  );

  const {
    handleClearIndicatorClick,
    handleDropdownClick,
    handleInputChange,
    handleOptionClick,
    handleScrollToBottom,
    handleValueClearClick,
  } = selectEventHandlers;

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
          onClick={handleOptionClick}
          optionIndex={index}
          getSelectOptionsMap={getSelectOptionsMap}
          handleHover={handleOptionHover}
          categoryKey={categoryKey}
          isCategorized={isCategorized}
          labelKey={labelKey}
          isFocused={isFocused}
          isSelected={isSelected}
          isDisabled={isDisabled}
        />
      );
    },
    [labelKey, isCategorized, categoryKey, handleOptionHover]
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
      const isCategoryFocused = categoryName === focusedOptionCategory;
      const focusedOptionIdx = isCategoryFocused ? focusedOptionIndex : -1;
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
      <Select.Top onClick={handleDropdownClick}>
        <Select.ValueSection isMultiValue={isMultiValue}>
          <Select.Value
            labelKey={labelKey}
            isMultiValue={isMultiValue}
            placeHolder={placeHolder}
            inputValue={inputValue}
            onClear={handleValueClearClick}
            value={value}
          />

          <Select.Input
            onInputChange={handleInputChange}
            inputValue={inputValue}
            focusNextOption={focusNextOption}
            focusPreviousOption={focusPreviousOption}
            addOptionOnKeyPress={handleOptionFocusOnSelectByKeyPress}
            handleOptionsSearchTrigger={selectApi.handleOptionsSearchTrigger}
            preventInputUpdate={selectApi.preventInputUpdate}
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
          handleScrollToBottom={handleScrollToBottom}
          ref={selectListContainerRef}
          displayedOptions={displayedOptions}
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
