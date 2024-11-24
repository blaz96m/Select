import { ReactNode, JSX, memo } from "react";
import clsx from "clsx";

export const TopContainer = memo(
  ({
    children,
    focusInput,
  }: {
    children: ReactNode;
    focusInput: () => void;
  }) => {
    return (
      <div className="select__top__container" onClick={focusInput}>
        {children}
      </div>
    );
  }
);

type ValueSectionProps = {
  children: ReactNode;
  isMultiValue: boolean;
};

export const ValueSection = memo(
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
