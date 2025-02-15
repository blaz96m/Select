import React from "react";
import {
  SelectOptionT,
  SelectStateSetters,
  SelectMultiValueCustomComponentProps,
  SelectCustomComponents,
  CustomSelectMultiValueRenderer,
  SelectMultiValueInnerProps,
  SelectOptionList,
  HandleValueClear,
  ValueClearClickHandler,
} from "./types/selectTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { isFunction } from "lodash";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectMultiValueProps = {
  value: SelectOptionT;
  labelKey: keyof SelectOptionT;
  valueList: SelectOptionList;
  handleValueClear: ValueClearClickHandler;
};

const SelectMultiValueElement = ({
  value,
  labelKey,
  valueList,
  handleValueClear,
}: SelectMultiValueProps) => {
  const className = "select__value--multi";
  const valueLabel = value[labelKey];

  const context = useSelectContext();
  const {
    components: { SelectMultiValueElement: customComponent },
  } = context;

  if (isFunction(customComponent)) {
    const props = {
      value,
      labelKey,
      valueList,
      handleValueClear,
    };
    const innerProps = { onClick: handleValueClear, className };
    return customComponent({ ...props }, innerProps);
  }
  return (
    <div className={className}>
      <span>{valueLabel}</span>
      <div
        className="select__value--icon__container"
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          handleValueClear(e, value)
        }
      >
        <FontAwesomeIcon className="select__value--icon" icon={faTimes} />
      </div>
    </div>
  );
};

export default SelectMultiValueElement;
