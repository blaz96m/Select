import { isFunction } from "lodash";
import { ReactNode, memo } from "react";
import { DropdownClickHandler } from "src/Select/types/selectGeneralTypes";

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
