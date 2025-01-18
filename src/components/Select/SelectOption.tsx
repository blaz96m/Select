import { Dispatch, SetStateAction, forwardRef, memo } from "react";
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
  handleFocusOnClick: (optionId: string, optionCategory: string) => void;
  isFocused: boolean;
  focusInput: () => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  isCategorized: boolean;
  isSelected: boolean;
  removeSelectedOptionsFromList: boolean;
  onOptionSelect?: (option: SelectOptionT) => void;
  closeDropdownOnOptionSelect?: boolean;
  usesInputAsync?: boolean;
  categoryKey?: keyof SelectOptionT;
  isLoading?: boolean;
};

const SelectOption = memo((props: SelectOptionProps) => {
  const {
    labelKey,
    option,
    isMultiValue,
    isFocused,
    closeDropdownOnOptionSelect,
    handleFocusOnClick,
    getSelectOptionsMap,
    categoryKey,
    focusInput,
    isCategorized,
    isSelected,
    removeSelectedOptionsFromList,
    onOptionSelect,
    usesInputAsync,
    isLoading,
  } = props;

  const shouldDropdownStayOpenAfterClick =
    !isNil(closeDropdownOnOptionSelect) && !closeDropdownOnOptionSelect;

  const context = useSelectContext();

  const {
    components: { SelectOptionElement: customComponent },
    getSelectAsyncStateSetters,
    getSelectStateSetters,
  } = context;

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
    handleFocusOnClick(option.id, optionCategory);
    !removeSelectedOptionsFromList && isSelected
      ? selectStateSetters.clearValue(option.id)
      : selectStateSetters.addValue(option);
    !isMultiValue && handleInputClear();
    shouldDropdownStayOpenAfterClick && focusInput();
    isFunction(onOptionSelect) && onOptionSelect(option);
  };

  const handleMouseHover = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (isFocused) {
      return;
    }
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
});

export default SelectOption;
