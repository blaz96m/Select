import React from "react";
import {
  CustomSelectClearIndicatorRenderer,
  SelectOptionList,
  SelectStateSetters,
} from "src/components/Select/types";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEmpty, isFunction } from "lodash";
import clsx from "clsx";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectClearIndicatorProps = {
  value: SelectOptionList;
  inputValue: string;
  focusInput: () => void;
  isMultiValue: boolean;
  usesInputAsync?: boolean;
  isLoading?: boolean;
};

const SelectClearIndicator = ({
  value,
  isMultiValue,
  inputValue,
  usesInputAsync,
  focusInput,
  isLoading,
}: SelectClearIndicatorProps) => {
  const clearInput = () => {
    const selectAsyncStateSetters = getSelectAsyncStateSetters();
    const selectStateSetters = getSelectStateSetters();
    usesInputAsync
      ? selectAsyncStateSetters.clearSearchQuery()
      : selectStateSetters.clearInput();
  };

  const clearAll = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isLoading) return;
    event.stopPropagation();
    const { clearAllValues } = getSelectStateSetters();
    !isEmpty(value) && clearAllValues();
    inputValue && clearInput();
    focusInput();
  };

  const context = useSelectContext();
  const {
    components: { SelectClearIndicatorElement },
    getSelectStateSetters,
    getSelectAsyncStateSetters,
  } = context;

  const customComponent = SelectClearIndicatorElement;

  const className = clsx({
    select__indicator: true,
    "select__indicator--clear": true,
    disabled: isLoading,
  });

  if (isFunction(customComponent)) {
    return customComponent(
      {
        getSelectStateSetters,
        usesInputAsync,
        value,
        inputValue,
        focusInput,
        isMultiValue,
        getSelectAsyncStateSetters,
      },
      { onClick: clearAll }
    );
  }
  return (
    <div onClick={clearAll} className={className}>
      <FontAwesomeIcon icon={faClose} />
    </div>
  );
};

export default SelectClearIndicator;
