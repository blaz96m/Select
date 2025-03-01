import React from "react";
import { SelectMultiValueProps } from "src/Select/types/selectComponentTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { isFunction } from "lodash";
import { useSelectContext } from "src/Select/components/SelectProvider";
import { resolveClassNames } from "../utils";

const SelectMultiValueElement = (props: SelectMultiValueProps) => {
  const { customComponentRenderer, ...otherProps } = props;

  const { value, labelKey, handleValueClear } = otherProps;

  const context = useSelectContext();
  const {
    components: { SelectMultiValueElement: customComponent },
    classNames: {
      selectMultiValue: customMultiValueClass,
      selectMultiValueIcon: customMultiValueIconClass,
      selectMultiValueIconContainer: customMultiValueIconContainerClass,
    },
  } = context;

  const className = resolveClassNames(
    "select__value--multi",
    customMultiValueClass
  );
  const iconContainerClassName = resolveClassNames(
    "select__value--icon__container",
    customMultiValueIconContainerClass
  );
  const iconClassName = resolveClassNames(
    "select__value--icon",
    customMultiValueIconContainerClass
  );
  const valueLabel = value[labelKey];

  if (isFunction(customComponent)) {
    const props = {
      ...otherProps,
      className,
      iconContainerClassName,
      iconClassName,
    };
    return customComponentRenderer(props, customComponent);
  }
  return (
    <div className={className}>
      <span>{valueLabel}</span>
      <div
        className={iconContainerClassName}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          handleValueClear(e, value)
        }
      >
        <FontAwesomeIcon className={iconClassName} icon={faTimes} />
      </div>
    </div>
  );
};

export default SelectMultiValueElement;
