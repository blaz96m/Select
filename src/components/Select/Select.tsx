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

export type SelectComponentProps = SelectProps & {
  usesInputAsync: boolean;
  isLastPage: () => boolean;
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  handlePageChange: () => void;
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
  handlePageChange: () => void;
  categoryKey: keyof SelectOptionT & string;
  onOptionSelect?: (option: SelectOptionT) => void;
  isCategorized?: boolean;
  selectOptions?: SelectOptionT[] | [];
  fetchOnScroll?: boolean;
  isOptionDisabled?: (option: SelectOptionT) => boolean;
  lazyInit?: boolean;
  hasInput?: boolean;
  placeHolder?: string;
  fetchFunc?: SelectFetchFunc;
  sorterFn?: SelectSorterFunction;
  onInputChange?: (inputValue?: string) => {};
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
  onInputChange,
  isLoading,
  onScrollToBottom,
  onPageChange,
  selectApi,
  selectState,
  hasPaging,
  displayedOptions,
  selectDomHelpers,
  selectDomRefs,
  usesInputAsync,
  handlePageChange,
  onOptionSelect,
  isOptionDisabled,
  onDropdownCollapse,
  isLazyInitFetchComplete,
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

  const {
    focusOptionAfterClick,
    getFocusValues,
    focusFirstOption,
    focusLastOption,
    addOptionOnKeyPress,
    filterSearchedOptions,
  } = selectApi;

  const { inputRef, selectListContainerRef } = selectDomRefs;

  const { isOpen, inputValue, page } = selectState;

  const renderOptionElement = useCallback(
    (option: SelectOptionT) => {
      const isSelected =
        !removeSelectedOptionsFromList &&
        some(value, (val) => val.id == option.id);
      const isFocused = focusedOptionId == option.id;
      const isDisabled =
        isFunction(isOptionDisabled) && isOptionDisabled(option);
      return (
        <SelectOption
          isMultiValue={isMultiValue}
          closeDropdownOnOptionSelect={closeDropdownOnSelect}
          key={option.id}
          option={option}
          getSelectOptionsMap={getSelectOptionsMap}
          handleFocusOnClick={focusOptionAfterClick}
          categoryKey={categoryKey}
          isCategorized={isCategorized}
          onOptionSelect={onOptionSelect}
          labelKey={labelKey}
          usesInputAsync={usesInputAsync}
          focusInput={focusInput}
          isFocused={isFocused}
          isSelected={isSelected}
          isDisabled={isDisabled}
          removeSelectedOptionsFromList={removeSelectedOptionsFromList}
        />
      );
    },

    [
      isMultiValue,
      closeDropdownOnSelect,
      labelKey,
      focusedOptionId,
      value,
      displayedOptions,
      isOptionDisabled,
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
            renderOption={renderOptionElement}
          />
        );
      } else {
        return renderOptionElement(value as SelectOptionT);
      }
    },
    [isMultiValue, closeDropdownOnSelect, labelKey, focusedOptionId, value]
  );

  return (
    <Select.Container>
      <Select.Top
        onDropdownExpand={onDropdownExpand}
        onDropdownCollapse={onDropdownCollapse}
        isOpen={isOpen}
        isLazyInitFetchComplete={isLazyInitFetchComplete}
        isLoading={isLoading}
      >
        <Select.ValueSection isMultiValue={isMultiValue}>
          <Select.Value
            labelKey={labelKey}
            isMultiValue={isMultiValue}
            placeHolder={placeHolder}
            inputValue={inputValue}
            value={value}
          />

          <Select.Input
            isMultiValue={isMultiValue}
            customOnChange={onInputChange}
            labelKey={labelKey}
            getFocusValues={getFocusValues}
            inputValue={inputValue}
            focusFirstOption={focusFirstOption}
            focusLastOption={focusLastOption}
            addOptionOnKeyPress={addOptionOnKeyPress}
            usesInputAsync={usesInputAsync}
            handlePageChange={handlePageChange}
            key="select-input"
            onKeyPress={handleScrollToFocusedOption}
            filterSearchedOptions={filterSearchedOptions}
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
              isMultiValue={isMultiValue}
              focusInput={focusInput}
              value={value}
              inputValue={inputValue}
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
