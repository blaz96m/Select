import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

type DropdownIndicatorProps = {
  isOpen: boolean;
  toggleDropdown: any;
};

export const DropdownIndicator = ({
  isOpen,
  toggleDropdown,
}: DropdownIndicatorProps) => {
  return (
    <div onClick={toggleDropdown} className="select__indicator">
      <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
    </div>
  );
};

export const ClearIndicator = () => {};
