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
        <div className="select__values__container">{children}</div>
      </div>
    );
  }
);

export default SelectValueSection;
