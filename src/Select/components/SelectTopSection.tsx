import { ReactNode, forwardRef, memo } from "react";
import { DropdownClickHandler } from "src/Select/types/selectGeneralTypes";
import { useSelectContext } from "src/Select/context";
import { resolveClassNames } from "src/Select/utils/helpers";
import clsx from "clsx";

type SelectTopSectionProps = {
  children: ReactNode;
  onClick: DropdownClickHandler;
  isDisabled: boolean;
};

const SelectTopContainer = forwardRef<HTMLDivElement, SelectTopSectionProps>(
  ({ children, onClick, isDisabled }, ref) => {
    const selectContext = useSelectContext();

    const {
      classNames: {
        selectTopContainer: customClassName,
        selectDisabled: customDisabledClassName,
      },
    } = selectContext;

    const elementClassName = resolveClassNames(
      "select__top__container",
      customClassName
    );

    const disabledClassName = resolveClassNames(
      "select__disabled",
      customDisabledClassName
    );

    const className = clsx({
      [elementClassName]: true,
      [disabledClassName]: isDisabled,
    });

    return (
      <div
        data-testid="select-top"
        ref={ref}
        className={className}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
);

export default SelectTopContainer;
