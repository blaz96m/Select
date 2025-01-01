import { Dispatch, SetStateAction, forwardRef, memo } from "react";
import clsx from "clsx";

import {
  SelectComponents,
  SelectOptionInnerProps,
  SelectOptionT,
  SelectStateSetters,
  CustomSelectOptionRenderer,
} from "src/components/Select/types/selectTypes";
import { isFunction, isNil } from "lodash";
import { generateComponentInnerProps } from "src/utils/select";

export type SelectOptionProps = {
  labelKey: keyof SelectOptionT;
  option: SelectOptionT;
  isMultiValue: boolean;
  handleFocusOnClick: (optionId: string, optionCategory: string) => void;
  getSelectStateSetters: () => SelectStateSetters;
  isFocused: boolean;
  focusInput: () => void;
  handleInputClear: () => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  isCategorized: boolean;
  isSelected: boolean;
  removeSelectedOptionsFromList: boolean;
  closeDropdownOnOptionSelect?: boolean;
  categoryKey?: keyof SelectOptionT;
  isLoading?: boolean;
};
console.log("RENDERED")

const SelectOption = memo(
  (
    props: SelectOptionProps & {
      customComponent?: CustomSelectOptionRenderer;
    }
  ) => {
    const {
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
      customComponent,
      removeSelectedOptionsFromList,
      handleInputClear,
      isLoading
    } = props;
    const shouldDropdownStayOpenAfterClick =
      !isNil(closeDropdownOnOptionSelect) && !closeDropdownOnOptionSelect;


    const hasCategories = categoryKey && isCategorized;
    const className = clsx({
      select__option: true,
      "select__option--selected": isSelected,
      "select__option--focused": isFocused,
    });

    const refCallback = (node: HTMLDivElement | null) => {
      const selectOptionsMap = getSelectOptionsMap();
      if (node) {
        selectOptionsMap.set(option.id, node);
      } else {
        selectOptionsMap.delete(option.id);
      }
    };

    const handleOptionClick = (option: SelectOptionT) => {
      if(isLoading) return;
      const optionCategory = hasCategories ? option[categoryKey] : "";
      const selectStateSetters = getSelectStateSetters();
      handleFocusOnClick(option.id, optionCategory);
      !removeSelectedOptionsFromList && isSelected
        ? selectStateSetters.clearValue(option.id)
        : selectStateSetters.addValue(option);
      !isMultiValue && handleInputClear();
      shouldDropdownStayOpenAfterClick && focusInput();
    };

    const handleMouseHover = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      const selectStateSetters = getSelectStateSetters();
      const optionCategory = e.currentTarget.dataset.category;
      selectStateSetters.setFocusDetails(e.currentTarget.id, optionCategory);
    };

    if (isFunction(customComponent)) {
      const innerProps = generateComponentInnerProps(
        SelectComponents.SELECT_OPTION,
        {
          option,
          handleOptionClick: () => handleOptionClick(option),
          handleMouseHover: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
            handleMouseHover(e),
          refCallback,
          className,
          isCategorized,
          categoryKey,
        }
      );
      return customComponent(props, innerProps as SelectOptionInnerProps);
    }

    return (
      <div
        onMouseMove={handleMouseHover}
        key={option.id}
        data-category={hasCategories ? option[categoryKey] : ""}
        ref={(node) => {
          const selectOptionsMap = getSelectOptionsMap();
          if (node) {
            selectOptionsMap.set(option.id, node);
          } else {
            selectOptionsMap.delete(option.id);
          }
        }}
        id={option.id}
        className={className}
        onClick={() => handleOptionClick(option)}
      >
        {option[labelKey]}
      </div>
    );
  }
);

export default SelectOption;
