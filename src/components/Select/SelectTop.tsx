import { ReactNode, JSX } from "react";
import clsx from "clsx";

export const TopContainer = ({ children }: { children: ReactNode }) => {
  return <div className="select__top__container">{children}</div>;
};

type ValueSectionProps = {
  children: ReactNode;
  isMultiValue: boolean;
};

export const ValueSection = ({ children, isMultiValue }: ValueSectionProps) => {
  return (
    <div
      className={clsx({
        "select__top__value-section": true,
        "is-multi": isMultiValue,
      })}
    >
      {children}
    </div>
  );
};

type IndicatorSectionProps = {
  children: ReactNode;
  isLoading: boolean;
  spinner: JSX.Element;
};

export const IndicatorSection = ({
  children,
  isLoading,
  spinner,
}: IndicatorSectionProps) => {
  return (
    <div className="select__top__indicator-section">
      {children}
      {isLoading && spinner}
    </div>
  );
};
