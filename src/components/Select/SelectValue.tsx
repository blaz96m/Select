import { map, isEmpty, isFunction } from "lodash";
import {
  SelectOptionList,
  SelectOptionT,
  SelectSingleValueProps,
  CustomSelectMultiValueRenderer,
  CustomSelectSingleValueRenderer,
} from "./types/selectTypes";
import SelectMultiValueElement from "./SelectMultiValueElement";
import { memo, useContext } from "react";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectValueProps = {
  labelKey: keyof SelectOptionT;
  value: SelectOptionList;
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
    value,
  }: SelectValueContainerPropTypes) => {
    const showPlaceholder = isEmpty(value) && isEmpty(inputValue);
    return (
      <>
        {showPlaceholder && (
          <span className="select__placeholder">{placeHolder}</span>
        )}
        {isMultiValue ? (
          <MultiValue value={value} labelKey={labelKey} />
        ) : (
          <SingleValue value={value[0]} labelKey={labelKey} />
        )}
      </>
    );
  }
);

const SingleValue = ({ value, labelKey }: SelectSingleValueProps) => {
  const valueLabel = !isEmpty(value) ? value[labelKey] : "";
  const context = useSelectContext();

  const {
    components: { SelectSingleValueElement: customComponent },
    getSelectStateSetters,
    getSelectAsyncStateSetters,
  } = context;

  if (!isEmpty(value)) {
    if (isFunction(customComponent)) {
      return customComponent({
        getSelectStateSetters,
        getSelectAsyncStateSetters,
        value: value || {},
        labelKey,
      });
    }
    return <>{valueLabel}</>;
  }
};

const MultiValue = ({ value, labelKey }: SelectValueProps) => {
  if (isEmpty(value)) {
    return;
  }
  return (
    <>
      {map(value, (val) => (
        <SelectMultiValueElement
          valueList={value}
          key={val.id}
          value={val}
          labelKey={labelKey}
        />
      ))}
    </>
  );
};

export default SelectValue;
