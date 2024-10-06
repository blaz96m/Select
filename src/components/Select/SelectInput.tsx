import { useCallback, memo } from "react";
import { isFunction, trim } from "lodash";
import { SelectOptionList, SelectOptionT } from "src/components/Select/types";

import { SelectApi } from "src/hooks/select/useSelect";

import { useInput } from "src/hooks/input";
import { filterOptionListBySearchValue } from "src/utils/select";

type SelectInputProps = {
  isMultiValue: boolean;
  customOnChange?: (inputValue?: string) => {};
  inputValue: string;
  selectApi: SelectApi;
  selectOptions: SelectOptionList;
  labelKey: keyof SelectOptionT;
  filterSearchedOptions: () => void;
  clearValues: () => void;
};

const SelectInput = memo(
  ({
    isMultiValue,
    customOnChange,
    inputValue,
    selectApi,
    clearValues,
    filterSearchedOptions,
  }: SelectInputProps) => {
    const { openDropdown, setInputValue } = selectApi;

    const shouldPreventInputChange = useCallback(
      (updatedValue: string) => !trim(updatedValue) && !inputValue,
      [inputValue]
    );
    const afterInputUpdate = useCallback(() => {
      openDropdown();
      if (!isMultiValue) {
        clearValues();
      }
      if (isFunction(customOnChange)) {
        customOnChange(inputValue);
      }
    }, [inputValue, isMultiValue]);

    function filterSearchedValues() {
      const timeoutId = setTimeout(() => {
        filterSearchedOptions();
      }, 1000);
      return timeoutId;
    }

    const [_, onInputChange] = useInput(
      afterInputUpdate,
      shouldPreventInputChange,
      filterSearchedValues,
      inputValue,
      setInputValue
    );

    return (
      <div className="select__input__wrapper">
        <input className="select__input" onChange={onInputChange} />
      </div>
    );
  }
);

export default SelectInput;
