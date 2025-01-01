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

export type SelectClearIndicatorProps = {
  getSelectStateSetters: () => SelectStateSetters;
  value: SelectOptionList;
  inputValue: string;
  isMultiValue: boolean;
  clearInput: () => void;
  isLoading?: boolean;
};

const SelectClearIndicator = ({
  getSelectStateSetters,
  value,
  isMultiValue,
  inputValue,
  clearInput,
  customComponent,
  isLoading
}: SelectClearIndicatorProps & {
  customComponent?: CustomSelectClearIndicatorRenderer;
}) => {
  const clearAll = () => {
    if(isLoading) return;
    const selectStateSetters = getSelectStateSetters();
    !isEmpty(value) && selectStateSetters.clearAllValues();
    clearInput();
  };

  const className = clsx({
    select__indicator: true,
    "select__indicator--clear": true,
    disabled: isLoading

  })

  if (isFunction(customComponent)) {
    return customComponent(
      { getSelectStateSetters, value, inputValue, isMultiValue, clearInput },
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
