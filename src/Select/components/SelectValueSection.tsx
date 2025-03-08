import clsx from "clsx";
import { ReactNode, memo } from "react";

type ValueSectionProps = {
  children: ReactNode;
  isMultiValue: boolean;
};

const SelectValueSection = memo(
  ({ children, isMultiValue }: ValueSectionProps) => {
    return (
      <div
        className={clsx({
          "select__top__value-section": true,
          "is-multi": isMultiValue,
        })}
      >
        <ul className="select__value__list">{children}</ul>
      </div>
    );
  }
);

export default SelectValueSection;
