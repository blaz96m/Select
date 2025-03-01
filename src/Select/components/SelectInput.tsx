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
import {
  generateComponentInnerProps,
  resolveClassNames,
} from "src/Select/utils";
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
      hasInput,
      isLoading,
    } = props;

    const innerRef = useRef<HTMLInputElement>(null);

    const selectContext = useSelectContext();
    console.log(selectContext);
    const {
      components: { SelectInputElement: customComponent },
      classNames: {
        selectInputContainer: customContainerClass,
        selectInputValue: customClass,
      },
    } = selectContext;

    const className = resolveClassNames("select__input", customClass);
    const containerClassName = resolveClassNames(
      "select__input__wrapper",
      customContainerClass
    );

    useImperativeHandle(ref, () => innerRef.current!, []);

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
        ref: innerRef,
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
          className={className}
          onChange={(e) => {
            e.stopPropagation();
            handleInputChange(e);
          }}
          value={inputValue}
          disabled={isLoading}
          onKeyDown={handleKeyPress}
          ref={innerRef}
        />
      </div>
    );
  })
);

export default SelectInput;
