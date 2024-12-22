import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import {
  CustomSelectDropdownIndicatorRenderer,
  SelectStateSetters,
} from "src/components/Select/types";
import { isFunction } from "lodash";

export type SelectDropdownIndicatorProps = {
  isOpen: boolean;
  getSelectStateSetters: () => SelectStateSetters;
  focusFirstOption: () => void;
  focusInput: () => void;
};

export const SelectDropdownIndicator = ({
  isOpen,
  getSelectStateSetters,
  focusFirstOption,
  focusInput,
  customComponent,
}: SelectDropdownIndicatorProps & {
  customComponent?: CustomSelectDropdownIndicatorRenderer;
}) => {
  
  const className = "select__indicator";
  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    focusInputOnClose = true
  ) => {
    const selectStateSetters = getSelectStateSetters();
    const updatedIsOpen = !isOpen;
    if (updatedIsOpen) {
      focusFirstOption();
      focusInputOnClose && focusInput();
    }
    selectStateSetters.toggleDropdown();
  };
  if (isFunction(customComponent)) {
    return customComponent(
      { isOpen, getSelectStateSetters, focusFirstOption, focusInput },
      { onClick: handleClick, className }
    );
  }
  return (
    <div onClick={handleClick} className={className}>
      <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
    </div>
  );
};

export default SelectDropdownIndicator;
