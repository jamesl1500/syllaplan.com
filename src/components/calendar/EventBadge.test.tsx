import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventBadge } from "./EventBadge";

describe("EventBadge", () => {
  test("renders the label as visible text and a title attribute", () => {
    render(<EventBadge kind="exam" label="Midterm exam" />);
    const badge = screen.getByText("Midterm exam");
    expect(badge).toHaveAttribute("title", "Midterm exam");
  });

  test("applies the exam kind's color classes", () => {
    render(<EventBadge kind="exam" label="Final" />);
    expect(screen.getByText("Final")).toHaveClass("bg-red-100", "text-red-800");
  });

  test("uses the class color as inline styles for a session badge", () => {
    render(<EventBadge kind="session" label="Lecture" color="#336699" />);
    const badge = screen.getByText("Lecture");
    expect(badge).toHaveStyle({ color: "rgb(51, 102, 153)" });
  });

  test("falls back to no inline style when a session has no color", () => {
    render(<EventBadge kind="session" label="Lecture" />);
    const badge = screen.getByText("Lecture");
    expect(badge.getAttribute("style")).toBeFalsy();
  });
});
