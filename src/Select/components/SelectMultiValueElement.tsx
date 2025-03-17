import { SelectMultiValueProps } from "src/Select/types/selectComponentTypes";
import { isFunction } from "lodash-es";
import { useSelectContext } from "src/Select/context/SelectProvider";
import { resolveClassNames } from "../utils";
import { MouseEvent } from "react";
import { SelectClearIndicatorIcon } from "src/Select/components";

const SelectMultiValueElement = (props: SelectMultiValueProps) => {
  const { customComponentRenderer, ...otherProps } = props;

  const { value, labelKey, handleValueClear } = otherProps;

  const context = useSelectContext();
  const {
    components: { SelectMultiValueElement: customComponent },
    classNames: {
      selectMultiValue: customMultiValueClass,
      selectMultiValueIcon: customMultiValueIconClass,
      selectMultiValueIconContainer: customMultiValueIconContainerClass,
    },
  } = context;

  const className = resolveClassNames(
    "select__value--multi",
    customMultiValueClass
  );
  const iconContainerClassName = resolveClassNames(
    "select__value--icon__container",
    customMultiValueIconContainerClass
  );
  const iconClassName = resolveClassNames(
    "select__value--icon",
    customMultiValueIconClass
  );
  const valueLabel = value[labelKey];

  if (isFunction(customComponent)) {
    const props = {
      ...otherProps,
      className,
      iconContainerClassName,
      iconClassName,
    };
    return customComponentRenderer(props, customComponent);
  }
  return (
    <div data-testid="select-multi-value" className={className}>
      <div className="select-multi-value__label">
        <span>{valueLabel}</span>
      </div>
      <div
        className={iconContainerClassName}
        data-testid="select-multi-value-clear"
        onClick={(e: MouseEvent<HTMLDivElement>) => handleValueClear(e, value)}
      >
        <SelectClearIndicatorIcon height={15} />
      </div>
    </div>
  );
};

export default SelectMultiValueElement;
