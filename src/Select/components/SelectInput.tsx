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
import { generateComponentInnerProps } from "src/Select/utils";
import clsx from "clsx";

import { useSelectContext } from "src/Select/components/SelectProvider";

const SelectInput = memo(
  forwardRef<HTMLInputElement, SelectInputProps>((props, ref) => {
    const {
      inputValue,
      handleOptionsSearchTrigger,
      onInputChange,
      focusNextOption,
      focusPreviousOption,
      preventInputUpdate,
      hasInput,
      addOptionOnKeyPress,
      isLoading,
    } = props;

    const innerRef = useRef<HTMLInputElement>(null);

    const selectContext = useSelectContext();
    const {
      components: { SelectInputElement: customComponentProperties },
    } = selectContext;

    const className = clsx({
      select__input: true,
      hidden: !hasInput,
    });

    useImperativeHandle(ref, () => innerRef.current!, []);
    /*
    useImperativeHandle(
      ref,
      () => ({
        ...innerRef.current!,
        focusInput: () => {
          debugger;
          innerRef.current?.focus();
        },
      }),
      []
    );*/

    const [_, handleInputChange] = useInput(
      onInputChange,
      preventInputUpdate,
      handleOptionsSearchTrigger,
      inputValue
    );

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.code) {
        case "ArrowUp":
          focusPreviousOption();
          break;
        case "ArrowDown":
          focusNextOption();
          break;
        case "Enter":
          addOptionOnKeyPress();
          break;
      }
    };

    if (isFunction(customComponentProperties?.customComponent)) {
      const inputInnerProps = generateComponentInnerProps(
        SelectComponents.INPUT,
        {
          handleInputChange,
          className,
          inputValue,
          innerRef,
          handleKeyPress,
          isLoading,
        }
      );
      return customComponentProperties.renderContainer ? (
        <div className="select__input__wrapper">
          {customComponentProperties.customComponent(
            { ...props },
            inputInnerProps as SelectInputInnerProps
          )}
        </div>
      ) : (
        customComponentProperties.customComponent(
          { ...props },
          inputInnerProps as SelectInputInnerProps
        )
      );
    }

    return (
      <div className="select__input__wrapper">
        <input
          className={className}
          onChange={handleInputChange}
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
