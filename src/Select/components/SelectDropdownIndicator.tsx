import { isFunction } from "lodash-es";
import clsx from "clsx";
import { useSelectContext } from "src/Select/context";
import { SelectDropdownIndicatorProps } from "src/Select/types/selectComponentTypes";
import { resolveClassNames } from "src/Select/utils";
import { SelectDropdownIndicatorIcon } from "src/Select/components";

export const SelectDropdownIndicator = ({
  isOpen,
  isLoading,
  customComponentRenderer,
}: SelectDropdownIndicatorProps) => {
  const context = useSelectContext();
  const {
    components: { SelectDropdownIndicatorElement: customComponent },
    classNames: {
      selectDropdownIndicatorDisabled: customDisabledClass,
      selectDropdownIndicator: customClass,
    },
  } = context;

  const indicatorClassName = resolveClassNames(
    "select__indicator",
    customClass
  );
  const disabledClassName = resolveClassNames("disabled", customDisabledClass);

  const className = clsx({
    [indicatorClassName]: true,
    [disabledClassName]: isLoading,
  });

  if (isFunction(customComponent)) {
    const props = { isOpen, isLoading, className };
    return customComponentRenderer(props, customComponent);
  }
  return (
    <div className={className}>
      <SelectDropdownIndicatorIcon isOpen={isOpen} />
    </div>
  );
};

export default SelectDropdownIndicator;
