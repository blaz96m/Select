import { map, isEmpty, isFunction } from "lodash";
import {
  SelectOptionList,
  SelectOptionT,
  SelectStateSetters,
  SelectSingleValueProps,
  CustomSelectMultiValueRenderer,
  CustomSelectSingleValueRenderer,
} from "./types/selectTypes";
import SelectMultiValueElement from "./SelectMultiValueElement";
import { memo } from "react";

export type SelectValueProps = {
  labelKey: keyof SelectOptionT;
  value: SelectOptionList;
  getSelectStateSetters: () => SelectStateSetters;
};

type SelectValueContainerPropTypes = SelectValueProps & {
  isMultiValue: boolean;
  placeHolder: string;
  inputValue: string;
  singleValueCustomComponent?: CustomSelectSingleValueRenderer;
  multiValueCustomComponent?: CustomSelectMultiValueRenderer;
};

const SelectValue = memo(
  ({
    labelKey,
    isMultiValue,
    placeHolder,
    inputValue,
    getSelectStateSetters,
    singleValueCustomComponent,
    multiValueCustomComponent,
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
              customComponent={multiValueCustomComponent}
            />
          ) : (
            <SingleValue
              value={value[0]}
              labelKey={labelKey}
              getSelectStateSetters={getSelectStateSetters}
              customComponent={singleValueCustomComponent}
            />
          )}
        </div>
      </>
    );
  }
);

const SingleValue = ({
  value,
  labelKey,
  customComponent,
  getSelectStateSetters,
}: SelectSingleValueProps & {
  customComponent?: (props: SelectSingleValueProps) => JSX.Element;
}) => {
  const valueLabel = !isEmpty(value) ? value[labelKey] : "";
  if (!isEmpty(value)) {
    if (isFunction(customComponent)) {
      return customComponent({
        getSelectStateSetters,
        value: value || {},
        labelKey,
      });
    }
    return <>{valueLabel}</>;
  }
};

const MultiValue = ({
  value,
  labelKey,
  getSelectStateSetters,
  customComponent,
}: SelectValueProps & {
  customComponent?: CustomSelectMultiValueRenderer;
}) => {
  if (isEmpty(value)) {
    return;
  }
  return (
    <ul className="select__value__list">
      {map(value, (val) => (
        <SelectMultiValueElement
          valueList={value}
          key={val.id}
          value={val}
          labelKey={labelKey}
          getSelectStateSetters={getSelectStateSetters}
          customComponent={customComponent}
        />
      ))}
    </ul>
  );
};

export default SelectValue;
