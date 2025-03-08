import React from "react";

export type SelectContainerProps = {
  children: React.ReactNode;
};

const SelectContainer = ({ children }: SelectContainerProps) => {
  return <div className="select__container">{children}</div>;
};

export default SelectContainer;
