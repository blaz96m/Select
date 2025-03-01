import React, { memo } from "react";
import { isElement, isEmpty, isFunction, isNumber, map, some } from "lodash";

import { SelectCategoryProps } from "src/Select/types/selectComponentTypes";
import { useSelectContext } from "src/Select/components/SelectProvider";
import { resolveClassNames } from "../utils";

const SelectCategory = memo((props: SelectCategoryProps) => {
  const context = useSelectContext();

  const { customComponentRenderer, ...otherProps } = props;

  const {
    categoryOptions,
    categoryName,
    selectedOptions,
    renderOption,
    focusedOptionIdx,
  } = otherProps;

  const {
    components: { SelectCategoryElement: customComponent },
    classNames: {
      selectCategoryHeader: customCategoryHeaderClass,
      selectCategoryList: customCategoryListClass,
    },
  } = context;

  const categoryHeaderClassName = resolveClassNames(
    "select__category__name",
    customCategoryHeaderClass
  );
  const categoryListClassName = resolveClassNames(
    "select__category__options-list",
    customCategoryListClass
  );

  if (isEmpty(categoryOptions)) return;

  if (isFunction(customComponent)) {
    const props = {
      ...otherProps,
      categoryHeaderClassName,
      categoryListClassName,
    };
    return customComponentRenderer(props, customComponent);
  }

  return (
    <div>
      <p className={categoryHeaderClassName}>{categoryName}</p>

      <ul className={categoryListClassName}>
        {map(categoryOptions, (option, index) => {
          return renderOption(option, index, focusedOptionIdx, selectedOptions);
        })}
      </ul>
    </div>
  );
});

export default SelectCategory;
