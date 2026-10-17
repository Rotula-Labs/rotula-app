import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  SavingsCircles,
  resolveGroupIcon,
} from "@/components/dashboard/SavingsCircles";

describe("SavingsCircles", () => {
  it("renders loading state correctly", () => {
    const { container } = render(
      <SavingsCircles groups={[]} isLoading={true} />,
    );
    expect(container.querySelector(".animate-pulse")).toBeInDocument();
  });

  it("renders groups correctly", () => {
    const mockGroups = [
      {
        id: "1",
        name: "Home Fund",
        tag: "FAMILY HOME",
        saved: 8200,
        target: 10000,
        nextDate: "Oct 24",
        avatars: ["https://example.com/av1.jpg", "+3"],
      },
    ];

    render(<SavingsCircles groups={mockGroups} isLoading={false} />);

    expect(screen.getByText("My Savings Circles")).toBeInDocument();
    expect(screen.getByText("Home Fund")).toBeInDocument();
    expect(screen.getByText("FAMILY HOME")).toBeInDocument();
    expect(screen.getByText("$8,200 saved")).toBeInDocument();
    expect(screen.getByText("82%")).toBeInDocument();
    expect(screen.getByText("Next: Oct 24")).toBeInDocument();

    // Check for the new circle button
    expect(screen.getByText("New Circle")).toBeInDocument();
  });
});

describe("resolveGroupIcon", () => {
  it("maps known group kinds to their icons", () => {
    expect(resolveGroupIcon("FAMILY HOME")).toBe("home");
    expect(resolveGroupIcon("TRAVEL")).toBe("travel");
  });

  it("ignores case and surrounding whitespace", () => {
    expect(resolveGroupIcon("home")).toBe("home");
    expect(resolveGroupIcon("Home")).toBe("home");
    expect(resolveGroupIcon(" family home ")).toBe("home");
    expect(resolveGroupIcon("Travel")).toBe("travel");
    expect(resolveGroupIcon("  TRAVEL  ")).toBe("travel");
  });

  it("resolves unrecognised tags to the single default", () => {
    expect(resolveGroupIcon("SAVES")).toBe("home");
    expect(resolveGroupIcon("")).toBe("home");
    expect(resolveGroupIcon("   ")).toBe("home");
  });
});
