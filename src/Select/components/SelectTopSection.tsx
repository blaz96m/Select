import { ReactNode, memo } from "react";
import { DropdownClickHandler } from "src/Select/types/selectGeneralTypes";
import { useSelectContext } from ".";
import { resolveClassNames } from "src/Select/utils/helpers";

type SelectTopSectionProps = {
  children: ReactNode;
  onClick: DropdownClickHandler;
};

const SelectTopContainer = memo(
  ({ children, onClick }: SelectTopSectionProps) => {
    const selectContext = useSelectContext();

    const {
      classNames: { selectTopContainer: customClassName },
    } = selectContext;

    const className = resolveClassNames(
      "select__top__container",
      customClassName
    );

    return (
      <div data-testid="select-top" className={className} onClick={onClick}>
        {children}
      </div>
    );
  }
);

export default SelectTopContainer;
