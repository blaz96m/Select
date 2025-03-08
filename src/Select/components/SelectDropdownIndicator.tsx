import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { isFunction } from "lodash";
import clsx from "clsx";
import { useSelectContext } from "src/Select/components/SelectProvider";
import { SelectDropdownIndicatorProps } from "src/Select/types/selectComponentTypes";
import { resolveClassNames } from "src/Select/utils";

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
      <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
    </div>
  );
};

export default SelectDropdownIndicator;
