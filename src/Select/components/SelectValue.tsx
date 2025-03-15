import { map, isEmpty, head } from "lodash-es";
import { ValueClearClickHandler } from "src/Select/types/selectGeneralTypes";
import {
  SelectSingleValueProps,
  SelectValueProps,
} from "src/Select/types/selectComponentTypes";
import SelectMultiValueElement from "./SelectMultiValueElement";
import { memo } from "react";

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
    customComponentRenderer,
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
          <MultiValue
            value={value}
            labelKey={labelKey}
            onClear={onClear}
            customComponentRenderer={customComponentRenderer}
          />
        ) : (
          <SingleValue value={head(value)!} labelKey={labelKey} />
        )}
      </>
    );
  }
);

const SingleValue = ({ value, labelKey }: SelectSingleValueProps) => {
  const valueLabel = !isEmpty(value) ? value[labelKey] : "";

  if (!isEmpty(value)) {
    return <div data-testid="select-single-value">{valueLabel}</div>;
  }
};

const MultiValue = ({
  value,
  labelKey,
  onClear,
  customComponentRenderer,
}: SelectValueProps) => {
  if (isEmpty(value)) {
    return;
  }
  return (
    <>
      {map(value, (val) => (
        <SelectMultiValueElement
          customComponentRenderer={customComponentRenderer}
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
