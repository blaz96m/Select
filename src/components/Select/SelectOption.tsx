import { Dispatch, SetStateAction, memo } from "react";
import clsx from "clsx";

import {
  SelectOptionList,
  SelectOptionT,
} from "src/components/Select/types/selectTypes";
import { SelectApi } from "src/hooks/select/useSelect";
import { isNil } from "lodash";

type SelectOptionProps = {
  labelKey: keyof SelectOptionT;
  option: SelectOptionT;
  isMultiValue: boolean;
  selectApi: SelectApi;
  closeDropdownOnOptionSelect?: boolean;
};

const SelectOption = memo(
  ({
    labelKey,
    option,
    isMultiValue,
    selectApi,
    closeDropdownOnOptionSelect,
  }: SelectOptionProps) => {
    const { closeDropdown, clearInput, handleValueChange } = selectApi;

    const onOptionClick = (option: SelectOptionT) => {
      handleValueChange(option, isMultiValue);
      !isMultiValue && clearInput();
      //DEFAULT behaviour if the closeDropdownOnOptionSelect prop is not specified
      if (isNil(closeDropdownOnOptionSelect)) {
        return isMultiValue ? null : closeDropdown();
      }
      closeDropdownOnOptionSelect && closeDropdown();
    };

    return (
      <div
        key={option.id}
        //ref={ref}
        className={clsx({
          select__option: true,
          //"dropdown__option--focused": isFocused,
        })}
        //onClick={() => onOptionClick(option)}
      >
        {option[labelKey]}
      </div>
    );
  }
);

export default SelectOption;
