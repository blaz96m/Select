import React from "react";
import {
  CustomSelectClearIndicatorRenderer,
  HandleClearIndicatorClick,
  SelectOptionList,
  SelectStateSetters,
} from "src/components/Select/types";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEmpty, isFunction } from "lodash";
import clsx from "clsx";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectClearIndicatorProps = {
  handleClearIndicatorClick: HandleClearIndicatorClick;
  isLoading: boolean | undefined;
};

const SelectClearIndicator = ({
  handleClearIndicatorClick,
  isLoading,
}: SelectClearIndicatorProps) => {
  const context = useSelectContext();
  const {
    components: { SelectClearIndicatorElement },
    getSelectStateSetters,
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
        getSelectStateSetters,
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
