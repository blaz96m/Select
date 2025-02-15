import { useState, memo, useCallback } from "react";
import {
  SelectOptionT,
  SelectOptionInnerProps,
  SelectMultiValueInnerProps,
  SelectSingleValueProps,
  SelectDropdownIndicatorInnerProps,
  SelectInputInnerProps,
  SelectClearIndicatorInnerProps,
  SelectCategoryCustomComponentProps,
  BasicComponentInnerProps,
  SelectOptionList,
} from "./components/Select/types/selectTypes";
import "src/style.scss";
import { SelectOptionProps } from "./components/Select/SelectOption";
import { filter, isEmpty, toLower } from "lodash";
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

function App() {
  let currCategoryCount = 1;
  const options = Array.from({ length: 100 }, (val, index) => {
    if ((index + 1) % 5 === 0) {
      currCategoryCount += 1;
    }
    return {
      id: `${index}`,
      name: `Select Value - ${index + 1}`,
      category: `Category-${currCategoryCount}`,
    };
  });
  const [value, setValue] = useState<SelectOptionList>([]);
  const [currLabel, setCurrLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");

  const [isOpen, setIsOpen] = useState(false);

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
        const optionForReal = optionLel.replace(" ", "").replace("-", "");
        return toLower(optionForReal).includes(inputValue);
      });
    },
    []
  );

  const getMovieList = useCallback(async ({ page = 1, searchQuery = "a" }) => {
    try {
      setIsLoading(true);
      const reselt = await axiosClient.get(
        `/search/movie?query=${searchQuery || "a"}&page=${page}`
      );
      const data = reselt.data;
      const totalRecords = data["total_results"];
      setIsLoading(false);
      return { data: data.results as SelectOptionList, totalRecords };
    } catch (err) {
      err;
    }
  }, []);
  let categoryCount = 1;
  const items = Array.from({ length: 100 }, (_, i) => {
    let category = `Category-${categoryCount}`;
    if (i % 3 === 0) {
      categoryCount++;
    }
    return {
      id: i,
      name: `Option-${i}`,
      details: `A movie about ${i}`,
      category,
      test: { 1: [1, 2, 3], 2: [2, 3, 4] },
      xy: {
        a: { a: "a", b: "b", c: "c" },
        b: { a: "a", b: "b", c: "c" },
        c: { a: "a", b: "b", c: "c" },
      },
      languages: ["en", "fr", "de", "sp"],
    };
  });

  items;

  const SelectCheckBox = (
    componentProps: SelectOptionProps,
    innerProps: SelectOptionInnerProps
  ) => {
    const { isSelected, labelKey, option } = componentProps;
    const { onClick, ...otherProps } = innerProps!;
    const className = otherProps.className;
    return (
      <div {...otherProps} className={`${className} select__check`}>
        <input type="checkbox" checked={isSelected} onClick={onClick} />
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

  const CustomInputComponent = (
    componentProps: SelectInputProps,
    innerProps: SelectInputInnerProps
  ) => {
    const {} = componentProps;
    const { ref, onChange } = innerProps;
    return <input {...innerProps} />;
  };

  const isDisabled = useCallback((option: SelectOptionT) => {}, [value]);

  const preventer = (newStr: string) => {
    return newStr.includes("2");
  };

  return (
    <>
      <button onClick={() => setCount((count) => count + 1)}>Next</button>
      <button onClick={() => setCount((count) => count - 1)}>Prev</button>
      {message && <div>Selected Item: {message}</div>}
      <div>Count: {count}</div>
      <div>Selected Value: {currLabel}</div>
      <Select
        fetchFunction={getMovieList}
        isMultiValue={false}
        preventInputUpdate={preventer}
        value={value}
        labelKey="title"
        clearInputOnSelect={false}
        categoryKey="original_language"
        isCategorized={true}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onChange={setValue}
        closeDropdownOnSelect={false}
        removeSelectedOptionsFromList={false}
        onOptionSelect={onOptionClick}
        fetchOnScroll={true}
        isLoading={isLoading}
        lazyInit={true}
        inputFilterFunction={customFilter}
        /*
        customComponents={{
          SelectOptionElement: SelectCheckBox,
          //SelectMultiValueElement: CustomMultiVal,
          //SelectSingleValueElement: CustomSingleVal,
          //SelectDropdownIndicatorElement: CustomDropdownIndicator,
          //SelectClearIndicatorElement: ClearIndikator,
          /*SelectInputElement: {
            customComponent: CustomInputComponent,
            renderContainer: true,
          },
        }}*/
      />
    </>
  );
}

export default App;
