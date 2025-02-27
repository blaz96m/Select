import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { isFunction } from "lodash";
import clsx from "clsx";
import { useSelectContext } from "src/Select/components/SelectProvider";
import { SelectDropdownIndicatorProps } from "src/Select/types/selectComponentTypes";

export const SelectDropdownIndicator = ({
  isOpen,
  isLoading,
}: SelectDropdownIndicatorProps) => {
  const context = useSelectContext();
  const {
    components: { SelectDropdownIndicatorElement: customComponent },
  } = context;

  const className = clsx({
    select__indicator: true,
    disabled: isLoading,
  });

  if (isFunction(customComponent)) {
    return customComponent(
      {
        isOpen,
      },
      { className }
    );
  }
  return (
    <div className={className}>
      <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
    </div>
  );
};

export default SelectDropdownIndicator;
