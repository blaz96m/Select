import { memo } from "react";
import { isEmpty, isFunction, map } from "lodash";

import { SelectCategoryProps } from "src/Select/types/selectComponentTypes";
import { useSelectContext } from "src/Select/context";
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
    "select__category__header",
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
      <div className={categoryHeaderClassName}>
        <p className="select__category__label">{categoryName}</p>
      </div>
      <ul data-testid="select-category-list" className={categoryListClassName}>
        {map(categoryOptions, (option, index) => {
          return renderOption(option, index, focusedOptionIdx, selectedOptions);
        })}
      </ul>
    </div>
  );
});

export default SelectCategory;
