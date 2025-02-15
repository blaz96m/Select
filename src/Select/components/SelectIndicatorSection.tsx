import { ReactNode } from "react";

type IndicatorSectionProps = {
  children: ReactNode;
  spinner: JSX.Element;
  isLoading?: boolean;
};

const SelectIndicatorSection = ({
  children,
  isLoading,
  spinner,
}: IndicatorSectionProps) => {
  return (
    <div className="select__top__indicator-section">
      {children}
      <div className="select__loader">{isLoading && spinner}</div>
    </div>
  );
};

export default SelectIndicatorSection;
