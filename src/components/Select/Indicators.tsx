import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { SelectApi, SelectStateSetters } from "src/hooks/select/useSelect";

type DropdownIndicatorProps = {
  isOpen: boolean;
  getSelectStateSetters: () => SelectStateSetters;
  focusFirstOption: () => void;
  focusInput: () => void;
};

export const DropdownIndicator = ({
  isOpen,
  getSelectStateSetters,
  focusFirstOption,
  focusInput,
}: DropdownIndicatorProps) => {
  const handleClick = () => {
    const selectStateSetters = getSelectStateSetters();
    const updatedIsOpen = !isOpen;
    if (updatedIsOpen) {
      focusFirstOption();
      focusInput();
    }
    selectStateSetters.toggleDropdown();
  };
  return (
    <div onClick={handleClick} className="select__indicator">
      <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
    </div>
  );
};

export const ClearIndicator = () => {};
