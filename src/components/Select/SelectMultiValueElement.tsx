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
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectMultiValueProps = {
  value: SelectOptionT;
  labelKey: keyof SelectOptionT;
  valueList: SelectOptionList;
};

const SelectMultiValueElement = ({
  value,
  labelKey,
  valueList,
}: SelectMultiValueProps) => {
  const className = "select__value--multi";
  const valueLabel = value[labelKey];

  const context = useSelectContext();
  const {
    components: { SelectMultiValueElement: customComponent },
    getSelectAsyncStateSetters,
    getSelectStateSetters,
  } = context;

  const onClearValueClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    const { clearValue } = getSelectStateSetters();
    clearValue(value.id);
  };
  if (isFunction(customComponent)) {
    const props = { value, labelKey, getSelectStateSetters, valueList };
    const innerProps = { onClick: onClearValueClick, className };
    return customComponent(
      { ...props, getSelectAsyncStateSetters, getSelectStateSetters },
      innerProps
    );
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
