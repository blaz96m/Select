import { SelectClearIndicatorProps } from "src/Select/types/selectComponentTypes";
import { isFunction } from "lodash-es";
import clsx from "clsx";
import { useSelectContext } from "src/Select/context";
import { SelectClearIndicatorIcon } from "src/Select/components";

const SelectClearIndicator = ({
  handleClearIndicatorClick,
  isLoading,
  customComponentRenderer,
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
    const props = { className, isLoading, handleClearIndicatorClick };
    return customComponentRenderer(props, customComponent);
  }
  return (
    <div
      data-testid="select-clear-indicator"
      onClick={handleClearIndicatorClick}
      className={className}
    >
      <SelectClearIndicatorIcon height={20} />
    </div>
  );
};

export default SelectClearIndicator;
