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
  OptionClickHandler,
  SelectComponents,
  SelectOptionInnerProps,
  SelectOptionT,
  SelectStateSetters,
} from "src/components/Select/types/selectTypes";
import { isFunction, isNil } from "lodash";
import { generateComponentInnerProps } from "src/utils/select";
import { useSelectContext } from "src/stores/providers/SelectProvider";
import { FALLBACK_CATEGORY_NAME } from "src/utils/select/constants";

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
  resetPage: () => void;
  onSelect: OptionClickHandler;
  onOptionSelect?: (option: SelectOptionT) => void;
  closeDropdownOnOptionSelect?: boolean;
  useInputAsync?: boolean;
  categoryKey?: keyof SelectOptionT;
  isLoading?: boolean;
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
    onSelect,
    removeSelectedOptionsFromList,
    onOptionSelect,
    useInputAsync,
    isFocused,
    isLoading,
  } = props;

  const keepDropdownOpenOnOptionSelect =
    !isNil(closeDropdownOnOptionSelect) && !closeDropdownOnOptionSelect;

  const context = useSelectContext();

  const {
    components: { SelectOptionElement: customComponent },
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
    const { clearInput } = getSelectStateSetters();
    clearInput();
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
        handleOptionClick: () =>
          onSelect(option, optionIndex, isSelected, handleFocusOnClick),
        handleMouseHover: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          handleMouseHover(e),
        refCallback,
        className,
        isCategorized,
        categoryKey,
      }
    );
    return customComponent(
      { ...props, getSelectStateSetters },
      innerProps as SelectOptionInnerProps
    );
  }

  return (
    <div
      onMouseMove={handleMouseHover}
      key={option.id}
      data-category={
        hasCategories ? option[categoryKey] || FALLBACK_CATEGORY_NAME : ""
      }
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
      onClick={() =>
        onSelect(option, optionIndex, isSelected, handleFocusOnClick)
      }
    >
      {option[labelKey]}
    </div>
  );
});

export default SelectOption;
