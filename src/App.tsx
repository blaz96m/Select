import {
  useState,
  memo,
  useCallback,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import {
  SelectOptionInnerProps,
  SelectMultiValueInnerProps,
  SelectSingleValueProps,
  SelectDropdownIndicatorInnerProps,
  SelectInputInnerProps,
  SelectClearIndicatorInnerProps,
} from "src/Select/types/selectComponentTypes";
import "src/style.scss";
import { SelectOptionProps } from "./components/Select/SelectOption";
import {
  debounce,
  filter,
  includes,
  isEmpty,
  reduce,
  some,
  split,
  toLower,
  trim,
} from "lodash";
import { SelectMultiValueProps } from "./components/Select/SelectMultiValueElement";
import { SelectValueProps } from "./components/Select/SelectValue";
import { SelectDropdownIndicatorProps } from "./components/Select/SelectDropdownIndicator";
import {
  faEarthAfrica,
  faEarthAmerica,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SelectInputProps } from "./components/Select/SelectInput";
import { SelectClearIndicatorProps } from "./components/Select/SelectClearIndicator";
import { SelectCategoryProps } from "./Select/components/SelectCategory";

import axiosClient from "./api/axios/axiosClient";
import { Select } from "./Select/components";
import {
  filterOptions,
  getSecondShieeet,
  getShieet,
  getShit,
  onInputUpdate,
  selectDropdownState,
  setInputValue,
  setIsOpen,
  setPage,
  setSelectOptions,
  setYearFilta,
  store,
} from "./Store";
import { useSelect } from "./Select/hooks";
import { Provider, useDispatch, useSelector } from "react-redux";
import { RootState } from "@reduxjs/toolkit/query";
import { CategorizedSelectOptions } from "./Select/types/selectGeneralTypes";
import {
  CustomSelectInputComponentProps,
  CustomSelectOptionComponentProps,
} from "./Select/types/selectComponentTypes";
import { M } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import { C } from "vitest/dist/chunks/reporters.QZ837uWx.js";

export const getMovieList = async (
  { page = 1, searchQuery = "a" },
  signal?: AbortSignal
) => {
  try {
    const reselt = await axiosClient.get(
      `/search/movie?query=${searchQuery || "a"}&page=${page}`
    );
    console.log(reselt);
    const data = reselt.data;
    const totalRecords = data["total_results"];
    return { data: data.results as SelectOptionList, totalRecords };
  } catch (err) {
    err;
  }
};

let categoryCount = 1;
const items = Array.from({ length: 1000 }, (_, i) => {
  let category = `Category-${categoryCount}`;
  if (i % 5 === 0) {
    categoryCount++;
  }
  return {
    id: i,
    name: `Option-${i}`,
    details: `The option ${i}`,
    category,
  };
});

function App() {
  const [value, setValue] = useState<SelectOptionList>([]);
  const [val2, setValue2] = useState<SelectOptionList>([]);
  const [currLabel, setCurrLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  const [lenft, setLenft] = useState("None");

  const [customIsOpen, setCustomIsOpen] = useState(false);

  //const [isOpen, setIsOpen] = useState(false);

  const onOptionClick = useCallback((option: any) => {
    setMessage(option.title);
  }, []);

  const customFilter = useCallback(
    (
      displayedOptions: SelectOptionList,
      inputValue: string
    ): SelectOptionList => {
      return filter(displayedOptions, (option) => {
        let optionLel = option["name"] as string;
        return toLower(optionLel).replace(/\s/g, "").includes(inputValue);
      });
    },
    []
  );

  const getMovieList = useCallback(
    async ({ page = 1, searchQuery = "a" }, signal?: AbortSignal) => {
      try {
        setIsLoading(true);
        const reselt = await axiosClient.get(
          `/search/movie?query=${searchQuery || "a"}&page=${page}`
        );
        setIsLoading(false);
        const data = reselt.data;
        const totalRecords = data["total_results"];
        return { data: data.results as SelectOptionList, totalRecords };
      } catch (err) {
        err;
      }
    },
    []
  );

  const SelectCheckBox = (
    componentProps: CustomSelectOptionComponentProps,
    innerProps: SelectOptionInnerProps
  ) => {
    const {
      isSelected,
      option,
      labelKey,
      clearInput,
      closeDropdown,
      focusInput,
      onOptionSelect,
      isDisabled,
      isMultiValue,
      clearInputOnSelect,
      getSelectOptionsMap,
      isFocused,
      optionIndex,
      resetFocus,
      setValue,
      value,
    } = componentProps;
    const { onClick, key, ...otherProps } = innerProps!;

    const customeOnKlek = () => {
      const valsLol = isMultiValue
        ? some(value, (val) => val.id === option.id)
          ? filter(value, (val) => val.id != option.id)
          : [...value, option]
        : [option];
      setValue(valsLol);
      clearInputOnSelect && clearInput();
      focusInput();
    };

    const className = otherProps.className;
    return (
      <div
        {...otherProps}
        onClick={customeOnKlek}
        className={`${className} select__check`}
        key={option.id}
      >
        <input type="checkbox" defaultChecked={isSelected} />
        <p>{option[labelKey]}</p>
      </div>
    );
  };

  const CustomMultiVal = (
    componentProps: SelectMultiValueProps,
    innerProps: SelectMultiValueInnerProps
  ) => {
    const { getSelectStateSetters, labelKey, value } = componentProps;
    const superDelete = () => {};
    const del = () => {
      const stateSetters = getSelectStateSetters();
      stateSetters.clearValue(value.id);
    };
    const { onClick } = innerProps;
    return (
      <div className="custom-multi-val">
        {`${value[labelKey]} (${value["category"]})`}
        <span onClick={del}>CLOSE</span>
      </div>
    );
  };

  const CustomDropdownIndicator = (
    componentProps: SelectDropdownIndicatorProps,
    innerProps: SelectDropdownIndicatorInnerProps
  ) => {
    const { focusFirstOption, focusInput, getSelectStateSetters, isOpen } =
      componentProps;
    const { onClick } = innerProps;

    return (
      <div {...innerProps} className="icon-cont">
        <FontAwesomeIcon icon={isOpen ? faEarthAmerica : faEarthAfrica} />
      </div>
    );
  };

  const CustomCategoryComponent = (
    componentProps: SelectCategoryCustomComponentProps,
    innerProps: BasicComponentInnerProps
  ) => {
    const { className } = innerProps;
    const { categoryName, categoryOptions } = componentProps;
    return <div {...innerProps}>{categoryName}</div>;
  };

  const CustomSingleVal = (componentProps: SelectSingleValueProps) => {
    const { getSelectStateSetters, labelKey, value } = componentProps;
    const cloze = () => {
      const selectStateSetters = getSelectStateSetters();
      selectStateSetters.clearValue(value.id);
    };
    return (
      <div className="select-cont">
        {`${value[labelKey]} (${value["category"]})`}
        <span onClick={cloze}>CLOSER</span>
      </div>
    );
  };

  const ClearIndikator = (
    componentProps: SelectClearIndicatorProps,
    innerProps: SelectClearIndicatorInnerProps
  ) => {
    const { getSelectStateSetters, value } = componentProps;
    const clearThisBitch = () => {
      const selectStateSetters = getSelectStateSetters();
      !isEmpty(value) && selectStateSetters.clearAllValues();
    };
    return <div onClick={clearThisBitch}>Clear THIS BITCH!!</div>;
  };

  const isDisabled = useCallback((option: SelectOptionT) => {}, [value]);

  const preventer = (newStr: string) => {
    return newStr.includes("2");
  };

  const isOpen = useSelector((state: any) => state.dropdown.isOpen);

  const inputValue = useSelector((state: any) => state.dropdown.inputValue);

  const updateInputValue = (value: string) => dispatch(setInputValue(value));

  const page = useSelector((state: any) => state.dropdown.page);

  const secondOptions = useSelector(
    (state: any) => state.dropdown.secondSelectOptions
  );
  const selectOptions = useSelector(
    (state: any) => state.dropdown.selectOptions
  );

  const onAfterScrollToBottom = useCallback(
    (options: CategorizedSelectOptions, page) => {
      setLenft((prev) => prev + 20);
    },
    []
  );
  const dispatch = useDispatch();

  const chenge = (isOpen: boolean) => {
    dispatch(setIsOpen(isOpen));
  };

  const setOptions = (optionList: SelectOptionList) => {
    dispatch(setSelectOptions(optionList));
  };

  const onDropdownClick = (isOpen: boolean) => {
    dispatch(setIsOpen(!isOpen));
  };

  const onFetchFunc = useCallback(async (req, signal) => {
    const res = await dispatch(getShit(req, signal));
    return res.payload;
  }, []);

  const secondOnFetch = async (req, signal) => {
    const res = await dispatch(getSecondShieeet(req, signal));
    return res.payload;
  };

  const customOptionFiltaBejbi = useCallback((option: SelectOptionT) => {
    return option.id % 2 !== 0;
  }, []);

  const inputValuePreventer = useCallback(
    (newInput: string, currInput: string) => {
      const currInputLetters = split(trim(currInput), "");
      const lastKey = trim(newInput).slice(-1);
      const res = includes(currInputLetters, lastKey);
      return includes(currInputLetters, lastKey);
    },
    []
  );

  const onInputChange = useCallback(
    (inputValue: string, value: SelectOptionList) => {
      dispatch(setInputValue(inputValue));
      dispatch(filterOptions(inputValue));
    },
    []
  );

  const CustomInputComponent = (
    inputProps: CustomSelectInputComponentProps,
    innerProps: SelectInputInnerProps
  ) => {
    const {
      focusNextOption,
      focusPreviousOption,
      handleValueSelectOnKeyPress,
      clearAllValues,
      handleInputChange,
      closeDropdown,
      debounceInputUpdate,
      displayedOptions,
      filterSearchedOptions,
      focusedOptionCategory,
      focusedOptionIndex,
      setInputValue,
      value: val,
      getOriginalOptions,
      handleOptionsFilter,
      inputValue,
      openDropdown,
      preventInputUpdate,
      selectOptionListRef,
      selectOptions,
      setSelectOptions,
      isLoading,
    } = inputProps;

    const cusOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.code) {
        case "ArrowUp":
          focusPreviousOption();
          break;
        case "ArrowDown":
          focusNextOption();
          break;
        case "Enter":
          handleValueSelectOnKeyPress();
      }
    };

    const cheng = (e: any) => {
      if (!preventInputUpdate(e, e.target.value)) {
        setInputValue(e.target.value);
        const options = getOriginalOptions();
        const trimmedSearchValue = trim(toLower(e.target.value));
        const filteredOptions = filter(options, (option) => {
          const trimmedOptionLabel = trim(toLower(option["name"]));
          return includes(trimmedOptionLabel, trimmedSearchValue);
        });
        setSelectOptions(filteredOptions);
      }
      /*
      setInputValue(e.target.value)
      handleOptionsFilter(e.target.value);
      */
    };

    const { className, containerClassName, onChange, onKeyDown, ref, value } =
      innerProps;
    return (
      <div className={containerClassName}>
        <input
          data-testid="select-input"
          className={className}
          onChange={(e) => {
            e.stopPropagation();
            cheng(e);
          }}
          value={value}
          disabled={isLoading}
          onKeyDown={cusOnKeyDown}
          ref={ref}
        />
      </div>
    );
  };

  const customInputRef = useRef<HTMLInputElement>(null);

  const customOptionListRef = useRef<HTMLDivElement>(null);

  const onValueClear = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      option: SelectOptionT
    ) => {
      e.stopPropagation();
      const updatedValue = filter(
        value,
        (val: SelectOptionT) => val.id !== option.id
      );
      setValue(updatedValue);
      customInputRef.current?.focus();
    },
    [value]
  );

  const onAfterValueClear = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    option: SelectOptionT
  ) => {
    setLenft(option.title);
  };

  const settPage = useCallback((page: number) => {
    dispatch(setPage(page));
  }, []);

  return (
    <>
      <div>ClearedValue: {lenft}</div>
      <Select
        fetchFunction={getMovieList}
        value={value}
        //defaultSelectOptions={items}
        onChange={setValue}
        useAsync={true}
        isMultiValue={true}
        hasInput={true}
        isLoading={isLoading}
        labelKey={"title"}
        categoryKey={"original_language"}
        isCategorized={true}
        recordsPerPage={20}
        fetchOnScroll={true}
        lazyInit={true}
      />
    </>
  );
}

export default App;
