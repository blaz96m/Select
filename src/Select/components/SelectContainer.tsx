import { ReactNode } from "react";

export type SelectContainerProps = {
  children: ReactNode;
};

const SelectContainer = ({ children }: SelectContainerProps) => {
  return <div className="select__container">{children}</div>;
};

export default SelectContainer;
