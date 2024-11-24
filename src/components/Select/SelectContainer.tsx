import React, { memo } from "react";
import clsx from "clsx";

export type SelectContainerProps = {
  children: React.ReactNode;
  //dropdownContainerRef: React.RefObject<HTMLDivElement>
};
// DROPDOWN TOP REF - DROPDOWN TOP CONTAINER

const SelectContainer = memo(({ children }: SelectContainerProps) => {
  return (
    <div className="select__container">
      {/* Container Ref Here */}
      {children}
    </div>
  );
});

export default SelectContainer;
