// using week 12 tutorial methods
// component test: verifies FormField renders and handles input correctly

import FormField from "@/components/ui/form-field";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("FormField", () => {
  it("renders the label and placeholder and fires onChangeText", () => {
    const onChangeTextMock = jest.fn();

    const { getByText, getByLabelText, getByPlaceholderText } = render(
      <FormField
        label="Company"
        value=""
        placeholder="Enter company"
        onChangeText={onChangeTextMock}
      />
    );

    expect(getByText("Company")).toBeTruthy();
    expect(getByLabelText("Company")).toBeTruthy();
    expect(getByPlaceholderText("Enter company")).toBeTruthy();

    fireEvent.changeText(getByLabelText("Company"), "Google");
    expect(onChangeTextMock).toHaveBeenCalledWith("Google");
  });
});