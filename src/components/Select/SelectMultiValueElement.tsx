import React from "react";
import { SelectOptionT } from "./types/selectTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

type SelectMultiValuePropsType = {
  value: SelectOptionT;
  labelKey: keyof SelectOptionT;
};

const SelectMultiValueElement = ({
  value,
  labelKey,
}: SelectMultiValuePropsType) => {
  const valueLabel = value[labelKey];
  return (
    <div className="dropdown__value--multi">
      <span>{valueLabel}</span>
      <div
        className="dropdown__value--icon__container"
        onClick={(e) => console.log("CLEAR HERE")}
      >
        <FontAwesomeIcon className="dropdown__value--icon" icon={faTimes} />
      </div>
    </div>
  );
};

export default SelectMultiValueElement;
