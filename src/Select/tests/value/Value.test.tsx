import { fireEvent, render, waitFor } from "@testing-library/react";
import SelectTestApp from "src/tests/SelectTestApp";
import { describe, expect, it } from "vitest";
import {
  MULTI_VALUE_CLEAR_TESTID,
  MULTI_VALUE_TESTID,
  SELECT_CLEAR_INDICATOR_TESTID,
  SELECT_INPUT_TESTID,
  SELECT_OPTION_TESTID,
  SELECT_TOP_TESTID,
  SINGLE_VALUE_TESTID,
  defaultSelectProps,
} from "../utils/testingUtils";
import { head } from "lodash-es";

describe("Select Value", () => {
  it("Select value shows up when clicking an option", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp {...defaultSelectProps} isMultiValue={false} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    const firstOptionLabel = firstOption?.textContent;
    fireEvent.click(firstOption!);
    const selectValueElement = getByTestId(SINGLE_VALUE_TESTID);
    expect(selectValueElement).toBeVisible();
    expect(selectValueElement).toHaveTextContent(firstOptionLabel!);
  });
  it("Select multi values show up when clicking multiple options", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp {...defaultSelectProps} isMultiValue={true} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    const firstOptionText = firstOption?.textContent;
    const secondOption = selectOptionElements[1];
    const secondOptionText = secondOption.textContent;
    fireEvent.click(firstOption!);
    fireEvent.click(secondOption!);
    const selectValues = getAllByTestId(MULTI_VALUE_TESTID);
    const firstValue = selectValues[0];
    const secondValue = selectValues[1];
    expect(firstValue).toBeVisible();
    expect(firstValue).toHaveTextContent(firstOptionText!);
    expect(secondValue).toBeVisible();
    expect(secondValue).toHaveTextContent(secondOptionText!);
  });
  it("Select single value gets cleared when input value appears", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp {...defaultSelectProps} isMultiValue={false} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    fireEvent.click(firstOption!);
    const selectValue = getByTestId(SINGLE_VALUE_TESTID);
    expect(selectValue).toBeVisible();
    fireEvent.change(selectInputElement, { target: { value: "1" } });
    expect(selectValue).not.toBeVisible();
  });
  it("Select single value does not get cleared when input value appears if the clearValueOnInputChange prop is false", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp
        {...defaultSelectProps}
        isMultiValue={false}
        clearValueOnInputChange={false}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    fireEvent.click(firstOption!);
    const selectValue = getByTestId(SINGLE_VALUE_TESTID);
    expect(selectValue).toBeVisible();
    fireEvent.change(selectInputElement, { target: { value: "1" } });
    expect(selectValue).toBeVisible();
  });
  it("Select multi value does not get cleared when input value appears", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp {...defaultSelectProps} isMultiValue={true} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId(
      SELECT_INPUT_TESTID
    ) as HTMLInputElement;
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    fireEvent.click(firstOption!);
    const selectValue = getByTestId(MULTI_VALUE_TESTID);
    expect(selectValue).toBeVisible();
    fireEvent.change(selectInputElement, { target: { value: "1" } });
    expect(selectValue).toBeVisible();
  });
  it("Select Multi Value gets removed when its clear button is clicked", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp {...defaultSelectProps} isMultiValue={true} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    fireEvent.click(firstOption!);
    const selectValue = getByTestId(MULTI_VALUE_TESTID);
    expect(selectValue).toBeVisible();
    const selectValueClearButton = getByTestId(MULTI_VALUE_CLEAR_TESTID);
    fireEvent.click(selectValueClearButton!);
    expect(selectValue).not.toBeVisible();
  });
  it("Select single value gets cleared if an already focused option is clicked: when removeSelectedOptionsFromList is set to false and closeDropdownOnSelect is false", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp
        {...defaultSelectProps}
        isMultiValue={false}
        removeSelectedOptionsFromList={false}
        closeDropdownOnSelect={false}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    fireEvent.click(firstOption!);
    const selectValue = getByTestId(SINGLE_VALUE_TESTID);
    expect(firstOption).toBeVisible();
    expect(selectValue).toBeVisible();
    fireEvent.click(firstOption!);
    expect(selectValue).not.toBeVisible();
  });
  it("Select multi value gets cleared if an already focused option is clicked: when removeSelectedOptionsFromList is set to false", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp
        {...defaultSelectProps}
        isMultiValue={true}
        removeSelectedOptionsFromList={false}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    fireEvent.click(firstOption!);
    const selectValue = getByTestId(MULTI_VALUE_TESTID);
    expect(firstOption).toBeVisible();
    expect(selectValue).toBeVisible();
    fireEvent.click(firstOption!);
    expect(selectValue).not.toBeVisible();
  });

  it("Single Value gets removed when the clear indicator is clicked", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp {...defaultSelectProps} isMultiValue={false} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectClearIndicator = getByTestId(SELECT_CLEAR_INDICATOR_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    fireEvent.click(firstOption!);
    const selectValue = getByTestId(SINGLE_VALUE_TESTID);
    expect(selectValue).toBeVisible();
    fireEvent.click(selectClearIndicator);
    expect(selectValue).not.toBeVisible();
  });

  it("Multi Values get removed when the clear indicator is clicked", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp {...defaultSelectProps} isMultiValue={true} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectClearIndicator = getByTestId(SELECT_CLEAR_INDICATOR_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    const secondOption = selectOptionElements[1];
    fireEvent.click(firstOption!);
    fireEvent.click(secondOption);
    const selectValues = getAllByTestId(MULTI_VALUE_TESTID);
    const firstValue = selectValues[0];
    const secondValue = selectValues[1];
    expect(firstValue).toBeVisible();
    expect(secondValue).toBeVisible();
    fireEvent.click(selectClearIndicator);
    expect(firstValue).not.toBeVisible();
    expect(secondValue).not.toBeVisible();
  });
});
