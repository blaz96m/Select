import React, { memo, forwardRef, useRef, useImperativeHandle } from "react";
import { isFunction } from "lodash";

import { SelectInputProps } from "src/Select/types/selectComponentTypes";
import { useInput } from "src/general/hooks";
import { resolveClassNames, resolveRefs } from "src/Select/utils";

import { useSelectContext } from "src/Select/components/SelectProvider";

const SelectInput = memo(
  forwardRef<HTMLInputElement, SelectInputProps>((props, ref) => {
    const {
      customComponentRenderer,
      onInputChange,
      handleKeyPress,
      ...otherProps
    } = props;

    const {
      inputValue,
      handleOptionsFilter,
      preventInputUpdate,
      debounceInputUpdate,
      isLoading,
    } = otherProps;

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
      debounceInputUpdate,
      handleOptionsFilter,
      inputValue
    );

    if (isFunction(customComponent)) {
      const props = {
        ...otherProps,
        inputValue,
        className,
        containerClassName,
        ref: resolvedRef,
        handleOptionsFilter,
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
          onChange={handleInputChange}
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
