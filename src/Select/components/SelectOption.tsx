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
  SelectComponents,
  SelectOptionInnerProps,
  SelectOptionProps,
} from "src/Select/types/selectComponentTypes";
import { isFunction, isNil } from "lodash";
import { getFocusedOptionIdx, resolveClassNames } from "src/Select/utils";
import { useSelectContext } from "src/Select/components/SelectProvider";
import { FALLBACK_CATEGORY_NAME } from "src/Select/utils/constants";

const SelectOption = memo((props: SelectOptionProps) => {
  const { customComponentRenderer, ...otherProps } = props;

  const {
    option,
    isDisabled,
    isFocused,
    isSelected,
    categoryKey,
    getSelectOptionsMap,
    handleHover,
    isCategorized,
    labelKey,
    onClick,
    optionIndex,
  } = otherProps;

  const context = useSelectContext();

  const {
    components: { SelectOptionElement: customComponent },
    classNames: {
      selectOption: customOptionClassName,
      selectOptionDisabled: customOptionDisabledClassName,
      selectOptionFocused: customOptionFocusedClassName,
      selectOptionSelected: customOptionSelectedClassName,
    },
  } = context;

  const optionClassName = resolveClassNames(
    "select__option",
    customOptionClassName
  );

  const optionDisabledClassName = resolveClassNames(
    "select__option--disabled",
    customOptionDisabledClassName
  );
  const optionSelectedClassName = resolveClassNames(
    "select__option--selected",
    customOptionFocusedClassName
  );
  const optionFocusedClassName = resolveClassNames(
    "select__option--focused",
    customOptionSelectedClassName
  );

  const className = clsx({
    [optionClassName]: true,
    [optionDisabledClassName]: isDisabled,
    [optionSelectedClassName]: isSelected,
    [optionFocusedClassName]: isFocused,
  });

  const refCallback = (node: HTMLDivElement | null) => {
    const selectOptionsMap = getSelectOptionsMap();
    if (node) {
      selectOptionsMap.set(option.id, node);
    } else {
      selectOptionsMap.delete(option.id);
    }
  };
  if (isFunction(customComponent)) {
    const props = { ...otherProps, className, refCallback };
    return customComponentRenderer(props, customComponent);
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
      data-selected={isSelected}
      data-testid="select-option"
      data-focused={isFocused}
      ref={refCallback}
      id={option.id}
      className={className}
      onClick={() => onClick(option, isSelected)}
    >
      {option[labelKey]}
    </div>
  );
});

export default SelectOption;
