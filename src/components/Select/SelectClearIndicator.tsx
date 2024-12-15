import React from "react";
import {
  CustomSelectClearIndicatorRenderer,
  SelectOptionList,
  SelectStateSetters,
} from "src/components/Select/types";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEmpty, isFunction } from "lodash";

export type SelectClearIndicatorProps = {
  getSelectStateSetters: () => SelectStateSetters;
  value: SelectOptionList;
  inputValue: string;
  isMultiValue: boolean;
};

const SelectClearIndicator = ({
  getSelectStateSetters,
  value,
  isMultiValue,
  inputValue,
  customComponent,
}: SelectClearIndicatorProps & {
  customComponent?: CustomSelectClearIndicatorRenderer;
}) => {
  const clearAll = () => {
    const selectStateSetters = getSelectStateSetters();
    !isEmpty(value) && selectStateSetters.clearAllValues();
    !isEmpty(inputValue) && selectStateSetters.clearInput();
  };
  if (isFunction(customComponent)) {
    return customComponent(
      { getSelectStateSetters, value, inputValue, isMultiValue },
      { onClick: clearAll }
    );
  }
  return (
    <div onClick={clearAll} className="select__indicator--clear">
      <FontAwesomeIcon icon={faClose} />
    </div>
  );
};

export default SelectClearIndicator;
