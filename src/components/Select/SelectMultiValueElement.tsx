import React from "react";
import {
  SelectOptionT,
  SelectStateSetters,
  SelectMultiValueCustomComponentProps,
  SelectCustomComponents,
  CustomSelectMultiValueRenderer,
  SelectMultiValueInnerProps,
  SelectOptionList,
} from "./types/selectTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { isFunction } from "lodash";

export type SelectMultiValueProps = {
  value: SelectOptionT;
  labelKey: keyof SelectOptionT;
  valueList: SelectOptionList;
  getSelectStateSetters: () => SelectStateSetters;
};

const SelectMultiValueElement = ({
  value,
  labelKey,
  getSelectStateSetters,
  customComponent,
  valueList,
}: SelectMultiValueProps & {
  customComponent?: CustomSelectMultiValueRenderer;
}) => {
  const className = "select__value--multi";
  const valueLabel = value[labelKey];
  const onClearValueClick = () => {
    const selectStateSetters = getSelectStateSetters();
    selectStateSetters.clearValue(value.id);
  };
  if (isFunction(customComponent)) {
    const props = { value, labelKey, getSelectStateSetters, valueList };
    const innerProps = { onClick: onClearValueClick, className };
    return customComponent(props, innerProps);
  }
  return (
    <div className={className}>
      <span>{valueLabel}</span>
      <div
        className="select__value--icon__container"
        onClick={onClearValueClick}
      >
        <FontAwesomeIcon className="select__value--icon" icon={faTimes} />
      </div>
    </div>
  );
};

export default SelectMultiValueElement;
