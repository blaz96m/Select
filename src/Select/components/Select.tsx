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

import { DEFAULT_SELECT_PLACEHOLDER } from "src/Select/utils/constants";
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
import {
  filterOptionListBySearchValue,
  initializeState,
} from "src/Select/utils";

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
  SelectAsyncApi,
} from "src/Select/types/selectStateTypes";

import { SelectProps } from "src/Select/types/selectComponentTypes";

import "../styles/_select.scss";

import { useSelectEventHandlerResolver } from "src/Select/hooks";
import { useSelectCustomComponentsHandler } from "src/general/hooks";

type SelectComponentProps = Omit<
  SelectProps,
  "customComponents" | "classNames" | "refs"
> & {
  selectApi: SelectApi;
  selectAsyncApi: SelectAsyncApi;
  customSelectEventHandlers: CustomSelectEventHandlers;
  eventHandlerFollowups: EventHandlerFollowupFunctions;
};

const Select = ({
  isMultiValue,
  isLoading,
  isOptionDisabled,
  selectApi,
  selectAsyncApi,
  customSelectEventHandlers,
  eventHandlerFollowups,
  clearInputOnIdicatorClick = true,
  hasInput = true,
  removeSelectedOptionsFromList = true,
  showClearIndicator = true,
  categoryKey = "",
  placeholder = DEFAULT_SELECT_PLACEHOLDER,
  labelKey = "name",
  isCategorized = false,
}: SelectComponentProps) => {
  const {
    selectDomRefs,
    displayedOptions,
    getSelectOptionsMap,
    selectFocusHandlers,
    selectFocusState,
    selectState,
  } = selectApi;

  const { fetchOnScrollToBottom } = selectAsyncApi;

  const { inputRef, selectListContainerRef } = selectDomRefs;

  const { isOpen, inputValue, value } = selectState;

  const {
    focusNextOption,
    focusPreviousOption,
    resetFocus,
    isOptionFocused,
    handleOptionHover,
  } = selectFocusHandlers;

  const { focusedOptionCategory, focusedOptionIndex } = selectFocusState;

  const selectEventHandlers = useSelectEventHandlerResolver(
    customSelectEventHandlers,
    eventHandlerFollowups,
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
    [focusedOptionCategory, focusedOptionIndex, isOptionDisabled, value]
  );

  return (
    <Select.Container>
      <Select.Top onClick={handleDropdownClick}>
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
            value={value}
          />
          {hasInput && (
            <Select.Input
              onInputChange={handleInputChange}
              inputValue={inputValue}
              handleKeyPress={handleKeyDown}
              customComponentRenderer={
                customComponentRenderers.handleCustomInputRender
              }
              handleOptionsSearchTrigger={selectApi.handleOptionsSearchTrigger}
              preventInputUpdate={selectApi.preventInputUpdate}
              isLoading={isLoading}
              ref={inputRef}
              hasInput={hasInput}
            />
          )}
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
Select.ValueSection = memo(SelectValueSection);
Select.IndicatorSection = memo(SelectIndicatorSection);
Select.Spinner = Spinner;
Select.Value = memo(SelectValue);
Select.Input = memo(SelectInput);
Select.DropdownIndicator = memo(SelectDropdownIndicator);
Select.ClearIndicator = memo(SelectClearIndicator);
Select.OptionList = memo(OptionList);
export default Select;
