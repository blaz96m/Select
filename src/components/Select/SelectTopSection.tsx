import { isFunction } from "lodash";
import { ReactNode, memo } from "react";
import { flushSync } from "react-dom";
import { useSelectContext } from "src/stores/providers/SelectProvider";
import { calculateSpaceAndDisplayOptionList } from "src/utils/select";
import { DropdownClickHandler, SelectFetchFunc } from "./types";

type SelectTopSectionProps = {
  children: ReactNode;
  onClick: DropdownClickHandler;
};

const SelectTopContainer = memo(
  ({ children, onClick }: SelectTopSectionProps) => {
    return (
      <div className="select__top__container" onClick={onClick}>
        {children}
      </div>
    );
  }
);

export default SelectTopContainer;
