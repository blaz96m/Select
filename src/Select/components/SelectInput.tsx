import {
  useCallback,
  memo,
  KeyboardEvent,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { hasIn, isEmpty, isFunction, trim } from "lodash";

import {
  SelectComponents,
  SelectInputInnerProps,
  SelectInputProps,
} from "src/Select/types/selectComponentTypes";
import { useInput } from "src/general/hooks";
import { resolveClassNames, resolveRefs } from "src/Select/utils";
import clsx from "clsx";

import { useSelectContext } from "src/Select/components/SelectProvider";

const SelectInput = memo(
  forwardRef<HTMLInputElement, SelectInputProps>((props, ref) => {
    const {
      inputValue,
      handleOptionsSearchTrigger,
      onInputChange,
      handleKeyPress,
      preventInputUpdate,
      customComponentRenderer,
      isLoading,
    } = props;

    console.log();

    const selectContext = useSelectContext();
    const {
      components: { SelectInputElement: customComponent },
      classNames: {
        selectInputContainer: customContainerClass,
        selectInputValue: customClass,
      },
      refs: { inputRef: customInputRef },
    } = selectContext;

    const innerRef = useRef<HTMLInputElement>(null);

    const resolvedRef = resolveRefs(innerRef, customInputRef);

    const className = resolveClassNames("select__input", customClass);
    const containerClassName = resolveClassNames(
      "select__input__wrapper",
      customContainerClass
    );

    useImperativeHandle(ref, () => resolvedRef.current!, []);

    const [_, handleInputChange] = useInput(
      onInputChange,
      preventInputUpdate,
      handleOptionsSearchTrigger,
      inputValue
    );

    if (isFunction(customComponent)) {
      const props = {
        inputValue,
        className,
        containerClassName,
        ref: resolvedRef,
        handleOptionsSearchTrigger,
        onInputChange,
        handleKeyPress,
        preventInputUpdate,
      };
      return customComponentRenderer(props, customComponent);
    }

    return (
      <div className={containerClassName}>
        <input
          data-testid="select-input"
          className={className}
          onChange={(e) => {
            e.stopPropagation();
            handleInputChange(e);
          }}
          value={inputValue}
          disabled={isLoading}
          onKeyDown={handleKeyPress}
          ref={resolvedRef}
        />
      </div>
    );
  })
);

export default SelectInput;
