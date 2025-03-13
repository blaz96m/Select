import { memo } from "react";
import { SelectProps } from "src/Select/types/selectComponentTypes";
import { every } from "lodash";
import { getObjectKeys } from "src/utils/data-types/objects/helpers";
import { SelectProvider } from "../context";
import { SelectComponent } from "src/Select/components";

const arePropsEqual = (oldProps: SelectProps, newProps: SelectProps) => {
  return every(getObjectKeys(oldProps), (propName: keyof SelectProps) => {
    if (
      propName === "customComponents" ||
      propName === "classNames" ||
      propName === "refs"
    )
      return true;
    else {
      const oldProp = oldProps[propName as keyof typeof oldProps];
      const newProp = newProps[propName as keyof typeof newProps];
      return Object.is(oldProp, newProp);
    }
  });
};

const Select = memo((props: SelectProps) => {
  const { customComponents, classNames, refs, ...otherProps } = props;

  return (
    <SelectProvider
      customComponents={customComponents}
      classNames={classNames}
      refs={refs}
    >
      <SelectComponent {...otherProps} />
    </SelectProvider>
  );
}, arePropsEqual);

export default Select;
