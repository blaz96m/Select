import { map, isEmpty } from "lodash";
import { SelectOptionList, SelectOptionT } from "./types/selectTypes";
import SelectMultiValueElement from "./SelectMultiValueElement";
import { memo } from "react";
import { SelectStateSetters } from "src/hooks/select/useSelect";

type SelectValuePropTypes = {
  labelKey: keyof SelectOptionT;
  value: SelectOptionList;
  getSelectStateSetters: () => SelectStateSetters;
};

type SelectValueContainerPropTypes = SelectValuePropTypes & {
  isMultiValue: boolean;
  placeHolder: string;
  inputValue: string;
};

const SelectValue = memo(
  ({
    labelKey,
    isMultiValue,
    placeHolder,
    inputValue,
    getSelectStateSetters,
    value,
  }: SelectValueContainerPropTypes) => {
    const showPlaceholder = isEmpty(value) && isEmpty(inputValue);
    return (
      <>
        <div className="select__value">
          {showPlaceholder && (
            <span className="select__placeholder">{placeHolder}</span>
          )}
          {isMultiValue ? (
            <MultiValue
              value={value}
              labelKey={labelKey}
              getSelectStateSetters={getSelectStateSetters}
            />
          ) : (
            <SingleValue value={value} labelKey={labelKey} />
          )}
        </div>
      </>
    );
  }
);

const SingleValue = ({
  value,
  labelKey,
}: Omit<SelectValuePropTypes, "getSelectStateSetters">) => {
  const valueLabel = !isEmpty(value) ? value[0][labelKey] : "";
  return <>{valueLabel}</>;
};

const MultiValue = ({
  value,
  labelKey,
  getSelectStateSetters,
}: SelectValuePropTypes) => {
  return (
    <ul className="select__value__list">
      {map(value, (val) => (
        <SelectMultiValueElement
          key={val.id}
          value={val}
          labelKey={labelKey}
          getSelectStateSetters={getSelectStateSetters}
        />
      ))}
    </ul>
  );
};

export default SelectValue;
