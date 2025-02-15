import { map, isEmpty, isFunction, head } from "lodash";
import {
  SelectOptionList,
  SelectOptionT,
  SelectSingleValueProps,
  HandleValueClear,
  ValueClearClickHandler,
} from "./types/selectTypes";
import SelectMultiValueElement from "./SelectMultiValueElement";
import { memo } from "react";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectValueProps = {
  labelKey: keyof SelectOptionT;
  value: SelectOptionList;
  onClear: ValueClearClickHandler;
};

type SelectValueContainerPropTypes = SelectValueProps & {
  isMultiValue: boolean;
  placeHolder: string;
  inputValue: string;
  onClear: HandleValueClear;
};

const SelectValue = memo(
  ({
    labelKey,
    isMultiValue,
    placeHolder,
    inputValue,
    onClear,
    value,
  }: SelectValueContainerPropTypes) => {
    const showPlaceholder = isEmpty(value) && isEmpty(inputValue);
    return (
      <>
        {showPlaceholder && (
          <span className="select__placeholder">{placeHolder}</span>
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
