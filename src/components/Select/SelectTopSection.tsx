import { ReactNode, memo } from "react";
import { flushSync } from "react-dom";
import { useSelectContext } from "src/stores/providers/SelectProvider";
import { calculateSpaceAndDisplayOptionList } from "src/utils/select";

type SelectTopSectionProps = {
  children: ReactNode;
  focusInput: () => void;
  isOpen: boolean;
  focusFirstOption: () => void;
  selectOptionListRef: React.RefObject<HTMLDivElement>;
  isLoading?: boolean;
};

const SelectTopContainer = memo(
  ({
    children,
    focusInput,
    isLoading,
    isOpen,
    selectOptionListRef,
    focusFirstOption,
  }: SelectTopSectionProps) => {
    const context = useSelectContext();
    const { getSelectStateSetters } = context;
    const handleClick = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      focusInputOnClose = true
    ) => {
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

    return (
      <div className="select__top__container" onClick={handleClick}>
        {children}
      </div>
    );
  }
);

export default SelectTopContainer;
