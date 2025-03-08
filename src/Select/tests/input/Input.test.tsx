import {
  fireEvent,
  getAllByTestId,
  queryByAttribute,
  render,
} from "@testing-library/react";
import SelectTestApp from "src/tests/SelectTestApp";
import { describe, expect, it, vi, vitest } from "vitest";
import {
  SELECT_INPUT_TESTID,
  SELECT_OPTION_TESTID,
  SELECT_CLEAR_INDICATOR_TESTID,
  SELECT_TOP_TESTID,
  defaultSelectProps,
} from "../utils/testingUtils";

import { every, head, toLower } from "lodash";

describe("Select Input", () => {
  it("Select Input is not rendered if the hasInputProp is false", () => {
    const { container } = render(
      <SelectTestApp {...defaultSelectProps} hasInput={false} />
    );
    const selectInputElement = queryByAttribute(
      "data-testid",
      container,
      SELECT_INPUT_TESTID
    );
    expect(selectInputElement).toBeNull();
  });
  it("Select Input is Displayed By Typing After Openning The Dropdown", () => {
    const { getByTestId } = render(<SelectTestApp {...defaultSelectProps} />);
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    fireEvent.change(selectInputElement, { target: { value: "Test" } });
    expect(selectInputElement.value).toBe("Test");
  });
  it("Select Options Get Filtered Properly By The Input", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp {...defaultSelectProps} />
    );
    const filterValue = "option-2";
    vi.useFakeTimers();
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    const inputValue = selectInputElement.value;
    await vitest.advanceTimersByTimeAsync(1000);
    const selectOptionElement = getAllByTestId(container, SELECT_OPTION_TESTID);
    every(selectOptionElement, (element) => {
      const elementValue = element.textContent!;
      expect(toLower(elementValue)).toContain(inputValue);
    });
  });
  it("Categorized Select Options Get Filtered Properly By The Input", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp
        {...defaultSelectProps}
        isCategorized={true}
        categoryKey="category"
      />
    );
    const filterValue = "option-2";
    vi.useFakeTimers();
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    const inputValue = selectInputElement.value;
    await vitest.advanceTimersByTimeAsync(1000);
    const selectOptionElement = getAllByTestId(container, SELECT_OPTION_TESTID);
    every(selectOptionElement, (element: HTMLDivElement) => {
      const elementValue = element.textContent!;
      expect(toLower(elementValue)).toContain(inputValue);
    });
  });
  it("Input Filter Gets Removed Properly On Clear", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp {...defaultSelectProps} />
    );
    const filterValue = "option-15";
    vi.useFakeTimers();
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    const originalOptions = getAllByTestId(container, SELECT_OPTION_TESTID);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    await vitest.advanceTimersByTimeAsync(800);
    const filteredOptions = getAllByTestId(container, SELECT_OPTION_TESTID);
    expect(filteredOptions.length).toBeLessThan(originalOptions.length);
    fireEvent.change(selectInputElement, { target: { value: "" } });
    const nonFilteredOptions = getAllByTestId(container, SELECT_OPTION_TESTID);
    expect(nonFilteredOptions).toHaveLength(originalOptions.length);
  });

  it("Input Filter Gets Removed Properly On Clear With Categorized Options", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp
        {...defaultSelectProps}
        isCategorized={true}
        categoryKey="category"
      />
    );
    const filterValue = "option-15";
    vi.useFakeTimers();
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    const originalOptions = getAllByTestId(container, SELECT_OPTION_TESTID);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    await vitest.advanceTimersByTimeAsync(800);
    const filteredOptions = getAllByTestId(container, SELECT_OPTION_TESTID);
    expect(filteredOptions.length).toBeLessThan(originalOptions.length);
    fireEvent.change(selectInputElement, { target: { value: "" } });
    const nonFilteredOptions = getAllByTestId(container, SELECT_OPTION_TESTID);
    expect(nonFilteredOptions).toHaveLength(originalOptions.length);
  });

  it("Input value gets cleared on option click if the clearInputOnSelect prop is true", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp {...defaultSelectProps} clearInputOnSelect={true} />
    );
    const filterValue = "option-15";
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    expect(selectInputElement).toHaveValue(filterValue);
    const options = getAllByTestId(container, SELECT_OPTION_TESTID);
    const firstOption = head(options);
    fireEvent.click(firstOption!);
    expect(selectInputElement).toHaveValue("");
  });

  it("Input value does not get cleared on option click if the clearInputOnSelect prop is false", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp {...defaultSelectProps} clearInputOnSelect={false} />
    );
    const filterValue = "option-15";
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    expect(selectInputElement).toHaveValue(filterValue);
    const options = getAllByTestId(container, SELECT_OPTION_TESTID);
    const firstOption = head(options);
    fireEvent.click(firstOption!);
    expect(selectInputElement).toHaveValue(filterValue);
  });

  it("Input value does get cleared on option click if the select holds a single value", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp {...defaultSelectProps} isMultiValue={false} />
    );
    const filterValue = "option-1";
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    expect(selectInputElement).toHaveValue(filterValue);
    const options = getAllByTestId(container, SELECT_OPTION_TESTID);
    const firstOption = head(options);
    fireEvent.click(firstOption!);
    expect(selectInputElement).toHaveValue("");
  });

  it("Input value does not get cleared on option click if the select holds multiple values", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp {...defaultSelectProps} isMultiValue={true} />
    );
    const filterValue = "option-1";
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    expect(selectInputElement).toHaveValue(filterValue);
    const options = getAllByTestId(container, SELECT_OPTION_TESTID);
    const firstOption = head(options);
    fireEvent.click(firstOption!);
    expect(selectInputElement).toHaveValue(filterValue);
  });

  it("Input value gets cleared on indicator click if the clearInputOnSelect prop is true", async () => {
    const { getByTestId } = render(
      <SelectTestApp {...defaultSelectProps} clearInputOnIdicatorClick={true} />
    );
    const filterValue = "option-15";
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    const selectClearIndicatorElement = getByTestId(
      SELECT_CLEAR_INDICATOR_TESTID
    );
    fireEvent.click(selectTopContainer);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    expect(selectInputElement).toHaveValue(filterValue);
    fireEvent.click(selectClearIndicatorElement);
    expect(selectInputElement).toHaveValue("");
  });

  it("Input value does not get cleared on indicator click if the clearInputOnSelect prop is false", async () => {
    const { getByTestId } = render(
      <SelectTestApp
        {...defaultSelectProps}
        clearInputOnIdicatorClick={false}
      />
    );
    const filterValue = "option-15";
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    const selectClearIndicatorElement = getByTestId(
      SELECT_CLEAR_INDICATOR_TESTID
    );
    fireEvent.click(selectTopContainer);
    fireEvent.change(selectInputElement, { target: { value: filterValue } });
    expect(selectInputElement).toHaveValue(filterValue);
    fireEvent.click(selectClearIndicatorElement);
    expect(selectInputElement).toHaveValue(filterValue);
  });
});
