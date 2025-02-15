import { map, isEmpty, isFunction, head } from "lodash";
import { ValueClearClickHandler } from "src/Select/types/selectGeneralTypes";
import {
  SelectSingleValueProps,
  SelectValueProps,
} from "src/Select/types/selectComponentTypes";
import SelectMultiValueElement from "./SelectMultiValueElement";
import { memo } from "react";
import { useSelectContext } from "src/Select/components/SelectProvider";

type SelectValueContainerPropTypes = SelectValueProps & {
  isMultiValue: boolean;
  placeholder: string;
  inputValue: string;
  onClear: ValueClearClickHandler;
};

const SelectValue = memo(
  ({
    labelKey,
    isMultiValue,
    placeholder,
    inputValue,
    onClear,
    value,
  }: SelectValueContainerPropTypes) => {
    const showPlaceholder = isEmpty(value) && isEmpty(inputValue);
    return (
      <>
        {showPlaceholder && (
          <span className="select__placeholder">{placeholder}</span>
        )}
        {isMultiValue ? (
          <MultiValue value={value} labelKey={labelKey} onClear={onClear} />
        ) : (
          <SingleValue value={head(value)!} labelKey={labelKey} />
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
  } = context;

  if (!isEmpty(value)) {
    if (isFunction(customComponent)) {
      return customComponent({
        value: value || {},
        labelKey,
      });
    }
    return <>{valueLabel}</>;
  }
};

const MultiValue = ({ value, labelKey, onClear }: SelectValueProps) => {
  if (isEmpty(value)) {
    return;
  }
  return (
    <>
      {map(value, (val) => (
        <SelectMultiValueElement
          handleValueClear={onClear}
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
