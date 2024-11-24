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
  DropdownIndicator,
  OptionList,
  SelectOption,
  SelectValueSection,
  SelectIndicatorSection,
} from "src/components/Select";
import { selectReducer } from "src/stores/reducers/selectReducer";
import {
  filterOptionListBySearchValue,
  initializeState,
} from "src/utils/select";

SelectTopContainer;

import {
  CategorizedSelectOptions,
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
  closeDropdownOnSelect?: boolean;
  fetchFunc?: SelectFetchFunc;
  sorterFn?: SelectSorterFunction;
  fetchOnInputChange: boolean;
  removeSelectedOptionsFromList: boolean;
  disableInputFetchTrigger: boolean;
  categoryKey: keyof SelectOptionT & string;
  categorizeFunction?: (options: SelectOptionList) => CategorizedSelectOptions;
  recordsPerPage?: number;
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
  recordsPerPage = 15,
  closeDropdownOnSelect = false,
  fetchOnInputChange = true,
  disableInputFetchTrigger = false,
  hasInput = true,
  fetchOnScroll = false,
  removeSelectedOptionsFromList = true,
  categoryKey = "",
}: SelectProps) => {
  const [state, dispatch] = useReducer(
    selectReducer,
    selectOptions,
    initializeState
  );
  // The originalOptions ref is only used in case all the data for the select comes from the frontend, enabling the partitioning of the options while storing the original value that never changes.
  const originalOptions = useRef<SelectOptionList>(state.selectOptions);
  const totalRecords = useRef<number>(0);

  const displayedOptions = useSelectComputation(
    { ...state, value },
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

  const { refs, refHelpers } = useSelectRef(state);

  const selectApi = useSelect(
    dispatch,
    { setValue: onChange },
    {
      ...state,
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
    state,
    selectApi,
    {
      isLazyInit: lazyInit,
      recordsPerPage,
      fetchOnInputChange,
      fetchFunc,
      fetchOnScroll,
    }
  );

  const { getIsLastPage, getSelectAsyncStateSetters } = selectAsyncApi;

  const usesInputAsync = isFunction(fetchFunc) && fetchOnInputChange;
  const selectInputValue = usesInputAsync
    ? selectAsyncState.searchQuery
    : state.inputValue;

  const renderOptionElement = useCallback(
    (option: SelectOptionT) => {
      const isSelected =
        !removeSelectedOptionsFromList &&
        some(value, (val) => val.id == option.id);
      const isFocused = state.focusedOptionId == option.id;
      return (
        <SelectOption
          isMultiValue={isMultiValue}
          closeDropdownOnOptionSelect={closeDropdownOnSelect}
          key={option.id}
          option={option}
          getSelectOptionsMap={refHelpers.getSelectOptionsMap}
          getSelectStateSetters={getSelectStateSetters}
          handleFocusOnClick={focusOptionAfterClick}
          categoryKey={categoryKey}
          isCategorized={isCategorized}
          labelKey={labelKey}
          focusInput={refHelpers.focusInput}
          isFocused={isFocused}
          isSelected={isSelected}
        />
      );
    },

    [
      isMultiValue,
      closeDropdownOnSelect,
      labelKey,
      state.focusedOptionId,
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
      state.focusedOptionId,
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
            inputValue={state.inputValue}
            value={value}
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
            usesInputAsync={usesInputAsync}
            getIsLastPage={getIsLastPage}
            getSelectAsyncStateSetters={getSelectAsyncStateSetters}
            onKeyPress={refHelpers.handleScrollToFocusedOption}
            filterSearchedOptions={filterSearchedOptions}
            disableInputFetchTrigger={disableInputFetchTrigger}
            ref={refs.inputRef}
            hasInput={hasInput}
          />
        </Select.ValueSection>
        <Select.IndicatorSection isLoading={false} spinner={<Select.Spinner />}>
          <Select.DropdownIndicator
            focusInput={refHelpers.focusInput}
            getSelectStateSetters={getSelectStateSetters}
            focusFirstOption={focusFirstOption}
            isOpen={state.isOpen}
          />
        </Select.IndicatorSection>
      </Select.Top>
      {state.isOpen && (
        <Select.OptionList
          categoryKey={categoryKey}
          ref={refs.selectListContainerRef}
          displayedOptions={displayedOptions}
          handlePageChange={handlePageChange}
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
Select.DropdownIndicator = DropdownIndicator;
Select.OptionList = OptionList;
export default Select;
