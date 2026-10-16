import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "@/components/layout/Header/Header";
import { APP_NAME } from "@/utils/constants/brand";

const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe("Header layout component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the canonical product brand name from APP_NAME", () => {
    render(<Header />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(APP_NAME);
    expect(heading).toHaveTextContent("Kolo");
    expect(heading).toHaveClass("text-xl", "font-bold", "text-gray-900");
  });

  it("triggers router.back when clicking the back button", () => {
    render(<Header />);
    const backBtn = screen.getByRole("button", { name: "Go back" });
    fireEvent.click(backBtn);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("renders wallet link pointing to /payments", () => {
    render(<Header />);
    const walletLink = screen.getByRole("link", { name: "Wallet" });
    expect(walletLink).toHaveAttribute("href", "/payments");
  });
});
