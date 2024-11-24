import React from "react";
import { SelectOptionT } from "./types/selectTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { SelectStateSetters } from "src/hooks/select/useSelect";

type SelectMultiValuePropsType = {
  value: SelectOptionT;
  labelKey: keyof SelectOptionT;
  getSelectStateSetters: () => SelectStateSetters;
};

const SelectMultiValueElement = ({
  value,
  labelKey,
  getSelectStateSetters,
}: SelectMultiValuePropsType) => {
  const valueLabel = value[labelKey];
  const onClearValueClick = () => {
    const selectStateSetters = getSelectStateSetters();
    selectStateSetters.clearValue(value.id);
  };
  return (
    <div className="select__value--multi">
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
