import { map, isEmpty } from "lodash";
import { SelectOptionList, SelectOptionT } from "./types/selectTypes";
import SelectMultiValueElement from "./SelectMultiValueElement";
import { memo } from "react";

type SelectValueContainerPropTypes = {
  labelKey: keyof SelectOptionT;
  isMultiValue: boolean;
  placeHolder: string;
  inputValue: string;
  value: SelectOptionList | [];
};

type SelectValuePropTypes = {
  labelKey: keyof SelectOptionT;
  value: SelectOptionList;
};

const SelectValue = memo(
  ({
    labelKey,
    isMultiValue,
    placeHolder,
    inputValue,
    value,
  }: SelectValueContainerPropTypes) => {
    const renderPlaceHolder = !inputValue ? placeHolder : "";
    return (
      <div className="dropdown__values__container">
        {!isEmpty(value) ? (
          isMultiValue ? (
            <MultiValue value={value} labelKey={labelKey} />
          ) : (
            <SingleValue value={value} labelKey={labelKey} />
          )
        ) : (
          renderPlaceHolder
        )}
      </div>
    );
  }
);

const SingleValue = ({ value, labelKey }: SelectValuePropTypes) => {
  const valueLabel = value[0][labelKey];
  return <div className="dropdown__value">{valueLabel}</div>;
};

const MultiValue = ({ value, labelKey }: SelectValuePropTypes) => {
  return (
    <ul className="dropdown__value__list">
      {map(value, (val) => (
        <SelectMultiValueElement key={val.id} value={val} labelKey={labelKey} />
      ))}
    </ul>
  );
};

export default SelectValue;
