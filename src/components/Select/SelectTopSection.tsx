import { isFunction } from "lodash";
import { ReactNode, memo } from "react";
import { flushSync } from "react-dom";
import { useSelectContext } from "src/stores/providers/SelectProvider";
import { calculateSpaceAndDisplayOptionList } from "src/utils/select";
import { SelectFetchFunc } from "./types";

type SelectTopSectionProps = {
  children: ReactNode;
  handleDropdownClick: () => void;
};

const SelectTopContainer = memo(
  ({ children, handleDropdownClick }: SelectTopSectionProps) => {
    return (
      <div className="select__top__container" onClick={handleDropdownClick}>
        {children}
      </div>
    );
  }
);

export default SelectTopContainer;
