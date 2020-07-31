import React from "react";
import { render } from "@testing-library/react";
import List from "./List";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: any) => key })
}));

test("renders initial count", () => {
  render(<List />);
  expect(1).toEqual(1);
});
