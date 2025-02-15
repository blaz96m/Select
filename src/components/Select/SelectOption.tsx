import {
  Dispatch,
  SetStateAction,
  forwardRef,
  memo,
  useCallback,
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
import {
  generateComponentInnerProps,
  getFocusedOptionIdx,
} from "src/utils/select";
import { useSelectContext } from "src/stores/providers/SelectProvider";
import { FALLBACK_CATEGORY_NAME } from "src/utils/select/constants";

export type SelectOptionProps = {
  labelKey: keyof SelectOptionT;
  option: SelectOptionT;
  optionIndex: number;
  handleHover: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    isFocused: boolean,
    optionIndex: number
  ) => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  isCategorized: boolean;
  isFocused: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: OptionClickHandler;
  categoryKey?: keyof SelectOptionT;
};

const SelectOption = memo((props: SelectOptionProps) => {
  const {
    labelKey,
    option,
    optionIndex,
    getSelectOptionsMap,
    categoryKey,
    isCategorized,
    isSelected,
    handleHover,
    isDisabled,
    onClick,
    isFocused,
  } = props;

  const context = useSelectContext();

  const {
    components: { SelectOptionElement: customComponent },
  } = context;

  const className = clsx({
    select__option: true,
    "select__option--disabled": isDisabled,
    "select__option--selected": isSelected,
    "select__option--focused": isFocused,
  });

  const optionCategory = option[categoryKey!] || "";

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
          onClick(option, isFocused, optionIndex, optionCategory),
        handleMouseHover: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          handleHover(e, isFocused, optionIndex),
        refCallback,
        className,
        isCategorized,
        categoryKey,
      }
    );
    return customComponent({ ...props }, innerProps as SelectOptionInnerProps);
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
      onClick={() => onClick(option, isSelected, optionIndex, optionCategory)}
    >
      {option[labelKey]}
    </div>
  );
});

export default SelectOption;
