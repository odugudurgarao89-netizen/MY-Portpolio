import { act, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

test("renders portfolio content", () => {
  jest.useFakeTimers();

  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /open/i }));

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.getByRole("heading", { name: /my work/i })).toBeInTheDocument();

  jest.useRealTimers();
});
