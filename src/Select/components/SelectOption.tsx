import { memo, MouseEvent } from "react";
import clsx from "clsx";
import { SelectOptionProps } from "src/Select/types/selectComponentTypes";
import { isFunction } from "lodash";
import { resolveClassNames } from "src/Select/utils";
import { useSelectContext } from "src/Select/context";
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

  const optionId = String(option.id);

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
      selectOptionsMap.set(optionId, node);
    } else {
      selectOptionsMap.delete(optionId);
    }
  };
  if (isFunction(customComponent)) {
    const props = { ...otherProps, className, refCallback };
    return customComponentRenderer(props, customComponent);
  }

  return (
    <div
      onMouseMove={(e: MouseEvent<HTMLDivElement>) =>
        handleHover(e, isFocused, optionIndex)
      }
      key={option.id}
      data-category={
        isCategorized ? option[categoryKey!] || FALLBACK_CATEGORY_NAME : ""
      }
      data-selected={isSelected}
      data-testid="select-option"
      data-focused={isFocused}
      data-disabled={isDisabled}
      ref={refCallback}
      id={optionId}
      className={className}
      onClick={() => onClick(option, isSelected, isDisabled)}
    >
      {option[labelKey]}
    </div>
  );
});

export default SelectOption;
