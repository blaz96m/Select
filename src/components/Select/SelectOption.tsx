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
  HandleOptionHover,
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
  optionIndex: number;
  handleFocusOnClick: (optionIdx: number, optionCategory: string) => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  handleHover: HandleOptionHover;
  isCategorized: boolean;
  isFocused: boolean;
  isSelected: boolean;
  removeSelectedOptionsFromList: boolean;
  isDisabled: boolean;
  resetPage: () => void;
  onSelect: OptionClickHandler;
  categoryKey?: keyof SelectOptionT;
};

const SelectOption = memo((props: SelectOptionProps) => {
  const {
    labelKey,
    option,
    optionIndex,
    handleFocusOnClick,
    handleHover,
    getSelectOptionsMap,
    categoryKey,
    isCategorized,
    isSelected,
    isDisabled,
    onSelect,
    isFocused,
  } = props;

  const context = useSelectContext();

  const {
    components: { SelectOptionElement: customComponent },
    getSelectStateSetters,
  } = context;

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
  if (isFunction(customComponent)) {
    const innerProps = generateComponentInnerProps(
      SelectComponents.SELECT_OPTION,
      {
        option,
        handleOptionClick: () =>
          onSelect(option, optionIndex, isSelected, handleFocusOnClick),
        handleMouseHover: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          handleHover(e, isFocused, optionIndex),
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
      onMouseMove={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        handleHover(e, isFocused, optionIndex)
      }
      key={option.id}
      data-category={
        isCategorized ? option[categoryKey!] || FALLBACK_CATEGORY_NAME : ""
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
