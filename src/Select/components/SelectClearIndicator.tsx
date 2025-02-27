import React from "react";

import { SelectClearIndicatorProps } from "src/Select/types/selectComponentTypes";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEmpty, isFunction } from "lodash";
import clsx from "clsx";
import { useSelectContext } from "src/Select/components/SelectProvider";

const SelectClearIndicator = ({
  handleClearIndicatorClick,
  isLoading,
}: SelectClearIndicatorProps) => {
  const context = useSelectContext();
  const {
    components: { SelectClearIndicatorElement },
  } = context;

  const customComponent = SelectClearIndicatorElement;

  const className = clsx({
    select__indicator: true,
    "select__indicator--clear": true,
    disabled: isLoading,
  });

  if (isFunction(customComponent)) {
    return customComponent(
      {
        isLoading,
        handleClearIndicatorClick,
      },
      { onClick: handleClearIndicatorClick }
    );
  }
  return (
    <div onClick={handleClearIndicatorClick} className={className}>
      <FontAwesomeIcon icon={faClose} />
    </div>
  );
};

export default SelectClearIndicator;
