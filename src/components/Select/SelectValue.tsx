import { map, isEmpty } from "lodash";
import { SelectOptionList, SelectOptionT } from "./types/selectTypes";
import SelectMultiValueElement from "./SelectMultiValueElement";
import { memo } from "react";
import { SelectStateSetters } from "src/hooks/select/useSelect";

type SelectValuePropTypes = {
  labelKey: keyof SelectOptionT;
  value: SelectOptionList;
  getSelectStateSetters: () => SelectStateSetters;
  children: any;
};

type SelectValueContainerPropTypes = SelectValuePropTypes & {
  isMultiValue: boolean;
  placeHolder: string;
  inputValue: string;
  children: any;
};

const SelectValue = ({
  labelKey,
  isMultiValue,
  children,
  placeHolder,
  inputValue,
  getSelectStateSetters,
  value,
}: SelectValueContainerPropTypes) => {
  console.count("DAFUQ");
  const showPlaceholder = isEmpty(value) && isEmpty(inputValue);
  return (
    <>
      <div className="select__value">
        {showPlaceholder && (
          <span className="select__placeholder">{placeHolder}</span>
        )}
        {isMultiValue ? (
          <MultiValue
            children={children}
            value={value}
            labelKey={labelKey}
            getSelectStateSetters={getSelectStateSetters}
          />
        ) : (
          <SingleValue value={value} labelKey={labelKey} children={children} />
        )}
      </div>
    </>
  );
};

const SingleValue = memo(
  ({
    value,
    labelKey,
    children,
  }: Omit<SelectValuePropTypes, "getSelectStateSetters">) => {
    console.count("LOL");
    const valueLabel = !isEmpty(value) ? value[0][labelKey] : "";
    return (
      <>
        {valueLabel}
        {children}
      </>
    );
  }
);

const MultiValue = ({
  value,
  labelKey,
  getSelectStateSetters,
  children,
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
      {children}
    </ul>
  );
};

export default SelectValue;
