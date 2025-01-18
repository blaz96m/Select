import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { isFunction } from "lodash";
import clsx from "clsx";
import { useSelectContext } from "src/stores/providers/SelectProvider";
import { calculateSpaceAndDisplayOptionList } from "src/utils/select";
import { flushSync } from "react-dom";

export type SelectDropdownIndicatorProps = {
  isOpen: boolean;
  focusFirstOption: () => void;
  selectOptionListRef: React.RefObject<HTMLDivElement>;
  focusInput: () => void;
  isLoading?: boolean;
};

export const SelectDropdownIndicator = ({
  isOpen,
  focusFirstOption,
  focusInput,
  selectOptionListRef,
  isLoading,
}: SelectDropdownIndicatorProps) => {
  const context = useSelectContext();
  const {
    components: { SelectDropdownIndicatorElement: customComponent },
    getSelectStateSetters,
    getSelectAsyncStateSetters,
  } = context;

  const className = clsx({
    select__indicator: true,
    disabled: isLoading,
  });
  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    focusInputOnClose = true
  ) => {
    debugger;
    if (isLoading) return;
    const selectStateSetters = getSelectStateSetters();
    const updatedIsOpen = !isOpen;
    if (updatedIsOpen) {
      focusFirstOption();
      focusInputOnClose && focusInput();
    }
    flushSync(() => selectStateSetters.toggleDropdown());

    !isLoading &&
      calculateSpaceAndDisplayOptionList(selectOptionListRef, updatedIsOpen);
  };
  if (isFunction(customComponent)) {
    return customComponent(
      {
        isOpen,
        getSelectStateSetters,
        getSelectAsyncStateSetters,
        focusFirstOption,
        selectOptionListRef,
        focusInput,
      },
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
