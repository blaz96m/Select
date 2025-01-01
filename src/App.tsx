import { useState, memo } from "react";
import Select from "./components/Select/Select";
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
import { isEmpty } from "lodash";
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
import { SelectCategoryProps } from "./components/SelectCategory";

import axiosClient from "./api/axios/axiosClient";

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
  const [value, setValue] = useState<SelectOptionT[]>([]);
  const [currLabel, setCurrLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getMovieList = async ({ page = 1, searchQuery = "a" }) => {
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
      console.log(err);
    }
  };

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
    const superDelete = () => {
    };
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

  return (
    <>
      <div>Selected Value: {currLabel}</div>
      <Select
        fetchFunc={getMovieList}
        isMultiValue={true}
        value={value}
        labelKey="title"
        categoryKey="category"
        isCategorized={false}
        onChange={setValue}
        closeDropdownOnOptionSelect={false}
        removeSelectedOptionsFromList={false}
        fetchOnScroll={true}
        
        isLoading={isLoading}

        lazyInit={true}
        customComponents={
          {
            //SelectOptionElement: SelectCheckBox,
            //SelectMultiValueElement: CustomMultiVal,
            //SelectSingleValueElement: CustomSingleVal,
            //SelectDropdownIndicatorElement: CustomDropdownIndicator,
            //SelectClearIndicatorElement: ClearIndikator,
            /*SelectInputElement: {
            customComponent: CustomInputComponent,
            renderContainer: true,
          },*/
          }
        }
      />
    </>
  );
}

export default App;
