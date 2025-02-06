import { map, isEmpty, isFunction } from "lodash";
import {
  SelectOptionList,
  SelectOptionT,
  SelectSingleValueProps,
  HandleValueClear,
} from "./types/selectTypes";
import SelectMultiValueElement from "./SelectMultiValueElement";
import { memo } from "react";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectValueProps = {
  labelKey: keyof SelectOptionT;
  value: SelectOptionList;
  handleValueClear: HandleValueClear;
};

type SelectValueContainerPropTypes = SelectValueProps & {
  isMultiValue: boolean;
  placeHolder: string;
  inputValue: string;
  handleValueClear: HandleValueClear;
};

const SelectValue = memo(
  ({
    labelKey,
    isMultiValue,
    placeHolder,
    inputValue,
    handleValueClear,
    value,
  }: SelectValueContainerPropTypes) => {
    const showPlaceholder = isEmpty(value) && isEmpty(inputValue);
    return (
      <>
        {showPlaceholder && (
          <span className="select__placeholder">{placeHolder}</span>
        )}
        {isMultiValue ? (
          <MultiValue
            value={value}
            labelKey={labelKey}
            handleValueClear={handleValueClear}
          />
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
  } = context;

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
  handleValueClear,
}: SelectValueProps) => {
  if (isEmpty(value)) {
    return;
  }
  return (
    <>
      {map(value, (val) => (
        <SelectMultiValueElement
          handleValueClear={handleValueClear}
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
