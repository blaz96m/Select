import { useCallback } from "react";
import { filter, isEmpty, isFunction, some } from "lodash-es";

import { DEFAULT_SELECT_PLACEHOLDER } from "src/Select/utils/constants";

import SelectContainer from "src/Select/components/SelectContainer";
import SelectInput from "src/Select/components/SelectInput";
import SelectValue from "src/Select/components/SelectValue";
import SelectTopSection from "src/Select/components/SelectTopSection";
import SelectOptionList from "src/Select/components/SelectOptionList";
import SelectOption from "src/Select/components/SelectOption";
import SelectValueSection from "src/Select/components/SelectValueSection";
import SelectIndicatorSection from "src/Select/components/SelectIndicatorSection";
import SelectDropdownIndicator from "src/Select/components/SelectDropdownIndicator";
import SelectClearIndicator from "src/Select/components/SelectClearIndicator";
import SelectCategory from "src/Select/components/SelectCategory";
import SelectLoader from "src/Select/components/SelectLoader";

import {
  SelectCategoryT,
  CustomSelectEventHandlers,
  SelectOptionList as SelectOptionListT,
  SelectOptionT,
  EventHandlerFollowupFunctions,
} from "src/Select/types/selectGeneralTypes";

import { SelectComponentProps } from "src/Select/types/selectComponentTypes";

import "src/Select/styles/select.css";

import {
  useSelectEventHandlerResolver,
  useSelectCustomComponentsHandler,
  useSelect,
  useSelectAsync,
} from "src/Select/hooks";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Prevent FontAwesome from dynamically injecting its own CSS

const Select = ({
  labelKey,
  sortFunction,
  fetchFunction,
  recordsPerPage,
  removeSelectedOptionsFromList = true,
  defaultSelectOptions,
  onChange,
  closeDropdownOnSelect,
  setIsOpen: customSetIsOpen,
  preventInputUpdate,
  inputFilterFunction,
  optionFilter,
  value,
  setSelectOptions: customSetSelectOptions,
  onClearIndicatorClick,
  onKeyDown,
  onValueClear,
  onScrollToBottom,
  onOptionClick,
  onInputChange,
  onDropdownClick,
  onAfterValueClear,
  onAfterScrollToBottom,
  onAfterOptionClick,
  onAfterInputChange,
  onAfterDropdownClick,
  onAfterClearIndicatorClick,
  isOpen: customIsOpen,
  categoryKey,
  isOptionDisabled,
  selectOptions: customSelectOptions,
  isLoading,
  page: customPage,
  setPage: customSetPage,
  setInputValue: customSetInputValue,
  clearInputOnSelect,
  inputValue: customInputValue,
  placeholder = DEFAULT_SELECT_PLACEHOLDER,
  isDisabled = false,
  showClearIndicator = true,
  clearValueOnInputChange = true,
  useAsync = false,
  disableCloseOnOutsideClick = false,
  debounceInputUpdate = false,
  inputUpdateDebounceDuration = 600,
  isCategorized = false,
  clearInputOnIdicatorClick = true,
  updateSelectOptionsAfterFetch = true,
  lazyInit = false,
  fetchOnScroll = false,
  isMultiValue = false,
  hasInput = true,
  fetchOnInputChange = false,
}: SelectComponentProps) => {
  const customState = {
    value,
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
    debounceInputUpdate,
    inputUpdateDebounceDuration,
    optionFilter,
    preventInputUpdate,
    clearValueOnInputChange,
    useAsync,
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

  const {
    selectDomRefs,
    displayedOptions,
    getSelectOptionsMap,
    selectFocusHandlers,
    selectFocusState,
    selectState,
    closeDropdown,
  } = selectApi;

  const { selectAsyncApi } = useSelectAsync(selectApi, {
    isLazyInit: lazyInit,
    updateSelectOptionsAfterFetch,
    inputUpdateDebounceDuration,
    useAsync,
    recordsPerPage,
    fetchOnInputChange,
    fetchOnScroll,
    isLoading,
    fetchFunction,
  });

  const { fetchOnScrollToBottom } = selectAsyncApi;

  const { inputRef, selectListContainerRef, selectTopRef } = selectDomRefs;

  const { isOpen, inputValue, value: selectValue } = selectState;

  const { resetFocus, isOptionFocused, handleOptionHover } =
    selectFocusHandlers;

  const { focusedOptionCategory, focusedOptionIndex } = selectFocusState;

  const isLastPage =
    useAsync && fetchOnScroll
      ? selectAsyncApi.isLastPage
      : selectApi.isLastPage;

  const customSelectEventHandlers: CustomSelectEventHandlers = {
    onClearIndicatorClick,
    onDropdownClick,
    onInputChange,
    onOptionClick,
    onScrollToBottom,
    onValueClear,
    onKeyDown,
  };

  const selectEventHandlerFollowups: EventHandlerFollowupFunctions = {
    onAfterClearIndicatorClick,
    onAfterDropdownClick,
    onAfterInputChange,
    onAfterOptionClick,
    onAfterScrollToBottom,
    onAfterValueClear,
  };

  const selectEventHandlers = useSelectEventHandlerResolver(
    customSelectEventHandlers,
    selectEventHandlerFollowups,
    selectApi,
    selectAsyncApi,
    {
      isLoading,
      clearInputOnIdicatorClick,
      resetFocus,
    }
  );

  const customComponentRenderers = useSelectCustomComponentsHandler(
    selectApi,
    selectAsyncApi,
    selectEventHandlers,
    {
      isMultiValue,
      isCategorized,
      clearValueOnInputChange,
      categoryKey,
      fetchOnScrollToBottom,
      clearInputOnIdicatorClick,
    }
  );

  const {
    handleClearIndicatorClick,
    handleDropdownClick,
    handleInputChange,
    handleOptionClick,
    handleScrollToBottom,
    handleValueClearClick,
    handleKeyDown,
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
          customComponentRenderer={
            customComponentRenderers.handleCustomOptionRender
          }
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
    [
      labelKey,
      isCategorized,
      categoryKey,
      handleOptionHover,
      handleOptionClick,
      customComponentRenderers.handleCustomOptionListRender,
    ]
  );

  const renderOptionFromList = useCallback(
    (option: SelectOptionT, index: number) => {
      const isFocused = isOptionFocused(option, index);
      const isDisabled =
        isFunction(isOptionDisabled) && isOptionDisabled(option);
      const isSelected =
        !removeSelectedOptionsFromList &&
        some(selectValue, (val) => val.id == option.id);
      return handleOptionRender(
        option,
        index,
        isFocused,
        isDisabled,
        isSelected
      );
    },
    [handleOptionRender, isOptionFocused, isOptionDisabled, selectValue]
  );

  const renderOptionFromCategory = useCallback(
    (
      option: SelectOptionT,
      index: number,
      focusedOptionIdx: number | null,
      selectedOptions: SelectOptionListT | null
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
        selectValue,
        (val) => val[categoryKey!] === categoryName
      );

      return (
        <SelectCategory
          key={categoryName}
          categoryName={categoryName}
          focusedOptionIdx={focusedOptionIdx}
          customComponentRenderer={
            customComponentRenderers.handleCustomCategoryRender
          }
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
    [focusedOptionCategory, focusedOptionIndex, isOptionDisabled, selectValue]
  );

  return (
    <Select.Container>
      <Select.Top
        ref={selectTopRef}
        isDisabled={isDisabled}
        onClick={handleDropdownClick}
      >
        <Select.ValueSection isMultiValue={isMultiValue}>
          <Select.Value
            labelKey={labelKey}
            isMultiValue={isMultiValue}
            customComponentRenderer={
              customComponentRenderers.handleCustomMultiValueRenderer
            }
            placeholder={placeholder}
            inputValue={inputValue}
            onClear={handleValueClearClick}
            value={selectValue}
          />

          <Select.Input
            hasInput={hasInput}
            onInputChange={handleInputChange}
            debounceInputUpdate={debounceInputUpdate}
            inputValue={inputValue}
            handleKeyPress={handleKeyDown}
            customComponentRenderer={
              customComponentRenderers.handleCustomInputRender
            }
            handleOptionsInputFilter={selectApi.handleOptionsInputFilter}
            preventInputUpdate={selectApi.preventInputUpdate}
            isLoading={isLoading}
            ref={inputRef}
          />
        </Select.ValueSection>
        <Select.IndicatorSection
          isLoading={isLoading}
          spinner={<Select.Spinner />}
        >
          <Select.DropdownIndicator
            isOpen={isOpen}
            isLoading={isLoading}
            customComponentRenderer={
              customComponentRenderers.handleCustomDrodpownIndicatorRender
            }
          />
          {showClearIndicator && (
            <Select.ClearIndicator
              customComponentRenderer={
                customComponentRenderers.handleCustomClearIndicatorRender
              }
              handleClearIndicatorClick={handleClearIndicatorClick}
              isLoading={isLoading}
            />
          )}
        </Select.IndicatorSection>
      </Select.Top>
      {isOpen && (
        <Select.OptionList
          handleScrollToBottom={handleScrollToBottom}
          disableCloseOnOutsideClick={disableCloseOnOutsideClick}
          selectTopRef={selectTopRef}
          isLastPage={isLastPage}
          closeDropdown={closeDropdown}
          ref={selectListContainerRef}
          customComponentRenderer={
            customComponentRenderers.handleCustomOptionListRender
          }
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
Select.ValueSection = SelectValueSection;
Select.IndicatorSection = SelectIndicatorSection;
Select.Spinner = SelectLoader;
Select.Value = SelectValue;
Select.Input = SelectInput;
Select.DropdownIndicator = SelectDropdownIndicator;
Select.ClearIndicator = SelectClearIndicator;
Select.OptionList = SelectOptionList;
export default Select;
