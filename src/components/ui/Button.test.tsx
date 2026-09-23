import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  test("renders its children", () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  test("applies the primary variant by default", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-clay-500");
  });

  test("applies the requested variant", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });

  test("merges a custom className with the variant classes", () => {
    render(<Button className="w-full">Wide</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full");
    expect(button).toHaveClass("bg-clay-500");
  });

  test("forwards click handlers and disabled state", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
