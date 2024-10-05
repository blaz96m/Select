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
} from "lodash";

import { DEFAULT_SELECT_PLACEHOLDER } from "src/utils/select/constants";
import { Spinner } from "src/components/Spinner";
import {
  SelectContainer,
  SelectInput,
  SelectValue,
  TopContainer,
  ValueSection,
  IndicatorSection,
  DropdownIndicator,
  OptionList,
  SelectOption,
} from "src/components/Select";
import {
  SelectReducerActionTypes,
  selectReducer,
  SelectReducerDispatch,
} from "src/stores/reducers/selectReducer";
import {
  categorizeOptions,
  filterOptionListBySearchValue,
  initializeState,
} from "src/utils/select";

import {
  CategorizedSelectOptions,
  SelectFetchFunction,
  SelectOptionList,
  SelectOptionT,
  SelectSorterFunction,
} from "./types";
import { useSelect } from "src/hooks/select";
import "./styles/_select.scss";
import useSelectComputation from "src/hooks/select/useSelectComputation";
import { stat } from "fs";

export type SelectProps = {
  value: SelectOptionT[] | [];
  labelKey: keyof SelectOptionT;
  isCategorized?: boolean;
  selectOptions?: SelectOptionT[] | [];
  onChange: Dispatch<SetStateAction<SelectOptionT[]>>;
  hasInput?: boolean;
  fetchOnScrool?: boolean;
  lazyInit?: boolean;
  isMultiValue: boolean;
  closeDropdownOnOptionSelect?: boolean;
  placeHolder?: string;
  onInputChange?: (inputValue?: string) => {};
  closeDropdownOnSelect?: boolean;
  fetchFunc?: SelectFetchFunction;
  sorterFn?: SelectSorterFunction;
  categoryKey?: keyof SelectOptionT;
  categorizeFunction?: (options: SelectOptionList) => CategorizedSelectOptions;
};

const Select = ({
  value,
  onChange,
  isMultiValue,
  onInputChange,
  placeHolder = DEFAULT_SELECT_PLACEHOLDER,
  selectOptions = [],
  categoryKey,
  categorizeFunction,
  labelKey = "name",
  isCategorized = false,
  sorterFn,
  fetchFunc,
  hasInput = true,
  fetchOnScrool,
  lazyInit,
  closeDropdownOnSelect,
}: SelectProps) => {
  const [state, dispatch] = useReducer(
    selectReducer,
    selectOptions,
    initializeState
  );
  const selectApi = useSelect(dispatch, { setValue: onChange }, state, {
    isMultiValue,
    labelKey,
  });

  const displayedOptions = useSelectComputation(
    { ...state, value },
    { isCategorized, labelKey, categoryKey, categorizeFunction },
    sorterFn
  );

  const { clearAllValues, setOptions } = selectApi;

  const originalOptions = useRef<SelectOptionList>(state.selectOptions);

  //INPUT
  /*TODO CHECK IF THE FILTERING WORKS AFTER FETCHING NEXT PAGE*/
  const filterSearchedOptions = useCallback(() => {
    const filteredOptions = filterOptionListBySearchValue(
      originalOptions.current,
      labelKey,
      state.inputValue
    );
    setOptions(filteredOptions);
  }, [state.selectOptions, state.inputValue]);

  const renderOptionElement = useCallback(
    (option: SelectOptionT) => (
      <SelectOption
        selectApi={selectApi}
        isMultiValue={isMultiValue}
        closeDropdownOnOptionSelect={closeDropdownOnSelect}
        //getNextFocusedOptionOnClick={getNextFocusedOptionOnClick}
        key={option.id}
        option={option}
        //ref={option.id === focusedOptionId ? ref : null}
        labelKey={labelKey}
      />
    ),

    [selectApi, isMultiValue, closeDropdownOnSelect, labelKey]
  );

  return (
    <Select.Container>
      <Select.Top>
        <Select.ValueSection isMultiValue={isMultiValue}>
          <Select.Value
            labelKey={labelKey}
            isMultiValue={isMultiValue}
            placeHolder={placeHolder}
            inputValue={state.inputValue}
            value={value}
          />

          <Select.Input
            inputValue={state.inputValue}
            isMultiValue={isMultiValue}
            customOnChange={onInputChange}
            clearValues={clearAllValues}
            selectOptions={state.selectOptions}
            labelKey={labelKey}
            selectApi={selectApi}
            filterSearchedOptions={filterSearchedOptions}
          />
        </Select.ValueSection>
        <Select.IndicatorSection isLoading={false} spinner={<Select.Spinner />}>
          <Select.DropdownIndicator
            toggleDropdown={selectApi.toggleDropdown}
            isOpen={state.isOpen}
          />
        </Select.IndicatorSection>
      </Select.Top>
      {state.isOpen && (
        <Select.OptionList
          displayedOptions={displayedOptions}
          renderOption={renderOptionElement}
        />
      )}
    </Select.Container>
  );
};

Select.Container = SelectContainer;
Select.Top = TopContainer;
Select.ValueSection = ValueSection;
Select.IndicatorSection = IndicatorSection;
Select.Spinner = Spinner;
Select.Value = SelectValue;
Select.Input = SelectInput;
Select.DropdownIndicator = DropdownIndicator;
Select.OptionList = OptionList;
export default Select;
