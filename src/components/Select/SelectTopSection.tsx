import { isFunction } from "lodash";
import { ReactNode, memo } from "react";
import { flushSync } from "react-dom";
import { useSelectContext } from "src/stores/providers/SelectProvider";
import { calculateSpaceAndDisplayOptionList } from "src/utils/select";
import { SelectFetchFunc } from "./types";

type SelectTopSectionProps = {
  children: ReactNode;
  isOpen: boolean;
  onDropdownExpand: () => void;
  isLazyInitFetchComplete?: boolean;
  fetchFunction?: SelectFetchFunc;
  onDropdownCollapse?: () => void;
  isLoading?: boolean;
};

const SelectTopContainer = memo(
  ({
    children,
    isLoading,
    isOpen,
    fetchFunction,
    onDropdownExpand,
    isLazyInitFetchComplete,
    onDropdownCollapse,
  }: SelectTopSectionProps) => {
    const context = useSelectContext();
    const { getSelectStateSetters } = context;

    const handleClick = () => {
      if (isLoading) return;
      const { toggleDropdown } = getSelectStateSetters();
      const isFetchingData =
        isFunction(fetchFunction) && !isLazyInitFetchComplete;
      const updatedIsOpen = !isOpen;
      !isFetchingData && updatedIsOpen
        ? flushSync(() => toggleDropdown())
        : toggleDropdown();
      if (updatedIsOpen) {
        return onDropdownExpand();
      }
      isFunction(onDropdownCollapse) && onDropdownCollapse();
    };

    return (
      <div className="select__top__container" onClick={handleClick}>
        {children}
      </div>
    );
  }
);

export default SelectTopContainer;
