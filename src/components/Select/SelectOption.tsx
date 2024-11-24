import { Dispatch, SetStateAction, forwardRef, memo } from "react";
import clsx from "clsx";

import {
  SelectOptionList,
  SelectOptionT,
} from "src/components/Select/types/selectTypes";
import { SelectApi, SelectStateSetters } from "src/hooks/select/useSelect";
import { isEmpty, isNil } from "lodash";

type SelectOptionProps = {
  labelKey: keyof SelectOptionT;
  option: SelectOptionT;
  isMultiValue: boolean;
  handleFocusOnClick: (optionId: string, optionCategory: string) => void;
  getSelectStateSetters: () => SelectStateSetters;
  isFocused: boolean;
  focusInput: () => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  isCategorized: boolean;
  closeDropdownOnOptionSelect?: boolean;
  categoryKey?: string;
  isSelected: boolean;
};

const SelectOption = memo(
  ({
    labelKey,
    option,
    isMultiValue,
    isFocused,
    closeDropdownOnOptionSelect,
    getSelectStateSetters,
    handleFocusOnClick,
    getSelectOptionsMap,
    categoryKey,
    focusInput,
    isCategorized,
    isSelected,
  }: SelectOptionProps) => {
    const shouldDropdownStayOpenAfterClick =
      !isNil(closeDropdownOnOptionSelect) && !closeDropdownOnOptionSelect;

    const handleOptionClick = (option: SelectOptionT) => {
      const hasCategories = categoryKey && isCategorized;
      const optionCategory = hasCategories ? option[categoryKey] : "";
      const selectStateSetters = getSelectStateSetters();
      handleFocusOnClick(option.id, optionCategory);
      selectStateSetters.addValue(option);
      !isMultiValue && selectStateSetters.clearInput();
      shouldDropdownStayOpenAfterClick && focusInput();
    };

    const handleMouseHover = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      const selectStateSetters = getSelectStateSetters();
      selectStateSetters.setFocusDetails(e.currentTarget.id);
    };

    return (
      <div
        onMouseMove={handleMouseHover}
        key={option.id}
        ref={(node) => {
          const selectOptionsMap = getSelectOptionsMap();
          if (node) {
            selectOptionsMap.set(option.id, node);
          } else {
            selectOptionsMap.delete(option.id);
          }
        }}
        id={option.id}
        className={clsx({
          select__option: true,
          "select__option--selected": isSelected,
          "select__option--focused": isFocused,
        })}
        onClick={() => handleOptionClick(option)}
      >
        {option[labelKey]}
      </div>
    );
  }
);

export default SelectOption;
