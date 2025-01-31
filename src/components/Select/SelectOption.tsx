import {
  Dispatch,
  SetStateAction,
  forwardRef,
  memo,
  useEffect,
  useState,
} from "react";
import clsx from "clsx";

import {
  SelectComponents,
  SelectOptionInnerProps,
  SelectOptionT,
  SelectStateSetters,
} from "src/components/Select/types/selectTypes";
import { isFunction, isNil } from "lodash";
import { generateComponentInnerProps } from "src/utils/select";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectOptionProps = {
  labelKey: keyof SelectOptionT;
  option: SelectOptionT;
  isMultiValue: boolean;
  optionIndex: number;
  handleFocusOnClick: (optionIdx: number, optionCategory: string) => void;
  focusInput: () => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  handleHover: (optionIdx: number, optionCategory: string) => void;
  isCategorized: boolean;
  isFocused: boolean;
  isSelected: boolean;
  removeSelectedOptionsFromList: boolean;
  isDisabled: boolean;
  onOptionSelect?: (option: SelectOptionT) => void;
  closeDropdownOnOptionSelect?: boolean;
  usesInputAsync?: boolean;
  categoryKey?: keyof SelectOptionT;
  isLoading?: boolean;
};

const compareProps = (oldProps, newProps) => {
  let isValid = true;
  for (const key in oldProps) {
    const oldProp = oldProps[key];
    const newProp = newProps[key];
    const isHehe = Object.is(oldProp, newProp);
    if (!isHehe) {
      isValid = false;
    }
  }
  return isValid;
};

const SelectOption = memo((props: SelectOptionProps) => {
  const {
    labelKey,
    option,
    optionIndex,
    isMultiValue,
    closeDropdownOnOptionSelect,
    handleFocusOnClick,
    handleHover,
    getSelectOptionsMap,
    categoryKey,
    focusInput,
    isCategorized,
    isSelected,
    isDisabled,
    removeSelectedOptionsFromList,
    onOptionSelect,
    usesInputAsync,
    isFocused,
    isLoading,
  } = props;

  const keepDropdownOpenOnOptionSelect =
    !isNil(closeDropdownOnOptionSelect) && !closeDropdownOnOptionSelect;

  const context = useSelectContext();

  const {
    components: { SelectOptionElement: customComponent },
    getSelectAsyncStateSetters,
    getSelectStateSetters,
  } = context;

  const hasCategories = !!categoryKey && isCategorized;

  const className = clsx({
    select__option: true,
    "select__option--disabled": isDisabled,
    "select__option--selected": isSelected,
    "select__option--focused": isFocused,
  });

  const refCallback = (node: HTMLDivElement | null) => {
    const selectOptionsMap = getSelectOptionsMap();
    if (node) {
      selectOptionsMap.set(option.id, node);
    } else {
      //TODO RETURN THIS INSTEAD OF ELSE
      selectOptionsMap.delete(option.id);
    }
  };
  const handleInputClear = () => {
    const { clearSearchQuery } = getSelectAsyncStateSetters();
    const { clearInput } = getSelectStateSetters();
    usesInputAsync ? clearSearchQuery() : clearInput();
  };

  const handleOptionClick = (option: SelectOptionT) => {
    if (isLoading) return;
    const optionCategory = hasCategories ? option[categoryKey] : "";
    const selectStateSetters = getSelectStateSetters();
    handleFocusOnClick(optionIndex, optionCategory);
    !removeSelectedOptionsFromList && isSelected
      ? selectStateSetters.clearValue(option.id)
      : selectStateSetters.selectValue(option);
    !isMultiValue && handleInputClear();
    keepDropdownOpenOnOptionSelect && focusInput();
    isFunction(onOptionSelect) && onOptionSelect(option);
  };

  const handleMouseHover = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (isFocused) {
      return;
    }

    const optionCategory = hasCategories
      ? e.currentTarget.dataset?.category
      : "";
    handleHover(optionIndex, optionCategory!);
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
    return customComponent(
      { ...props, getSelectAsyncStateSetters, getSelectStateSetters },
      innerProps as SelectOptionInnerProps
    );
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
}, compareProps);

export default SelectOption;
