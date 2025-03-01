import React, { memo } from "react";
import clsx from "clsx";

export type SelectContainerProps = {
  children: React.ReactNode;
};

const SelectContainer = ({ children }: SelectContainerProps) => {
  return <div className="select__container">{children}</div>;
};

export default SelectContainer;
