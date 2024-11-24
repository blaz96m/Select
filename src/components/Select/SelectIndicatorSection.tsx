import { ReactNode } from "react";

type IndicatorSectionProps = {
  children: ReactNode;
  isLoading: boolean;
  spinner: JSX.Element;
};

const SelectIndicatorSection = ({
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

export default SelectIndicatorSection;
