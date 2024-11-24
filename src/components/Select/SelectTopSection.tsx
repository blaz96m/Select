import { ReactNode, memo } from "react";

const SelectTopContainer = memo(
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

export default SelectTopContainer;
