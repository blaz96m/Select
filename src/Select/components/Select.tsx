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
  SelectCategory,
} from "src/Select/components";
import { selectReducer } from "src/Select/stores/reducers/selectReducer";
import {
  filterOptionListBySearchValue,
  initializeState,
} from "src/utils/select";

import {
  CustomPreventInputUpdate,
  CustomSelectCategorizeFunction,
  DefaultSelectEventHandlers,
  InputChangeHandler,
  SelectCategoryT,
  CustomSelectEventHandlers,
  SelectOptionList,
  SelectOptionT,
  SelectSorterFunction,
  CustomOptionClickHandler,
  CustomValueClearClickHandler,
  CustomClearIndicatorClickHandler,
  DropdownClickHandler,
  CustomScrollToBottomHandler,
  EventHandlerFollowupFunctions,
  SelectFetchFunction,
} from "src/Select/types/selectGeneralTypes";

import {
  SelectState,
  StateSetter,
  SelectApi,
  SelectStateUpdaters,
} from "src/Select/types/selectStateTypes";

import { SelectProps } from "src/Select/types/selectComponentTypes";

import "../styles/_select.scss";

import {
  useSelectEventHandlerResolver,
  useSelectFocus,
} from "src/Select/hooks";

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
  placeholder = DEFAULT_SELECT_PLACEHOLDER,
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
            placeholder={placeholder}
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
