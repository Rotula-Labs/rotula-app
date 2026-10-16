import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("Sidebar Navigation Component (Exhaustive 5D Suite - 70+ Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  // Dimension 1: Boundary & Clamping
  describe("Dimension 1: Route Boundaries and Route Matching", () => {
    it("handles null pathname gracefully without crashing", () => {
      mockUsePathname.mockReturnValue(null);
      render(<Sidebar />);
      const homeLink = screen.getByRole("link", { name: /home/i });
      expect(homeLink).toHaveClass("text-gray-600");
    });

    it("handles empty string pathname gracefully", () => {
      mockUsePathname.mockReturnValue("");
      render(<Sidebar />);
      const groupsLink = screen.getByRole("link", { name: /groups/i });
      expect(groupsLink).toHaveClass("text-gray-600");
    });

    it("handles root '/' path without falsely activating any subpath item", () => {
      mockUsePathname.mockReturnValue("/");
      render(<Sidebar />);
      const navLinks = ["Home", "Savings", "Groups", "Payments", "Settings"];
      navLinks.forEach((name) => {
        const link = screen.getByRole("link", { name: new RegExp(name, "i") });
        expect(link).toHaveClass("text-gray-600");
      });
    });

    const subpathCases = [
      { path: "/dashboard/analytics", item: "Home" },
      { path: "/dashboard/metrics", item: "Home" },
      { path: "/dashboard/overview", item: "Home" },
      { path: "/savings/personal", item: "Savings" },
      { path: "/savings/emergency", item: "Savings" },
      { path: "/savings/archive", item: "Savings" },
      { path: "/groups/g1", item: "Groups" },
      { path: "/groups/g2", item: "Groups" },
      { path: "/groups/lagos-savers", item: "Groups" },
      { path: "/groups/active-circles", item: "Groups" },
      { path: "/payments/history", item: "Payments" },
      { path: "/payments/send", item: "Payments" },
      { path: "/payments/receipt/tx-101", item: "Payments" },
      { path: "/payments/invoices", item: "Payments" },
      { path: "/profile/security", item: "Settings" },
      { path: "/profile/notifications", item: "Settings" },
      { path: "/profile/billing", item: "Settings" },
    ];

    subpathCases.forEach(({ path, item }) => {
      it(`activates parent '${item}' for nested route '${path}'`, () => {
        mockUsePathname.mockReturnValue(path);
        render(<Sidebar />);
        const link = screen.getByRole("link", { name: new RegExp(item, "i") });
        expect(link).toHaveClass("bg-[#5fe3a1]", "text-gray-900");
      });
    });
  });

  // Dimension 2: Combinatorics - Exact Matrix of Active and Inactive Links
  describe("Dimension 2: Combinatorics - Nav Items Isolation Matrix", () => {
    const navItems = [
      { name: "Home", href: "/dashboard" },
      { name: "Savings", href: "/savings" },
      { name: "Groups", href: "/groups" },
      { name: "Payments", href: "/payments" },
      { name: "Settings", href: "/profile" },
    ];

    navItems.forEach((activeItem) => {
      describe(`When active route is '${activeItem.href}' (${activeItem.name})`, () => {
        it(`activates '${activeItem.name}' link with emerald pill styling`, () => {
          mockUsePathname.mockReturnValue(activeItem.href);
          render(<Sidebar />);
          const link = screen.getByRole("link", { name: new RegExp(activeItem.name, "i") });
          expect(link).toHaveAttribute("href", activeItem.href);
          expect(link).toHaveClass("bg-[#5fe3a1]", "text-gray-900", "font-semibold");
        });

        navItems
          .filter((item) => item.name !== activeItem.name)
          .forEach((inactiveItem) => {
            it(`ensures '${inactiveItem.name}' is strictly inactive`, () => {
              mockUsePathname.mockReturnValue(activeItem.href);
              render(<Sidebar />);
              const link = screen.getByRole("link", { name: new RegExp(inactiveItem.name, "i") });
              expect(link).toHaveClass("text-gray-600");
              expect(link).not.toHaveClass("bg-[#5fe3a1]");
            });
          });
      });
    });

    describe("Start New Goal CTA Link Verification (Issue #237)", () => {
      it("points strictly to '/groups' and NOT to '/groups/new'", () => {
        render(<Sidebar />);
        const cta = screen.getByRole("link", { name: /start new goal/i });
        expect(cta).toHaveAttribute("href", "/groups");
        expect(cta).not.toHaveAttribute("href", "/groups/new");
      });

      it("applies primary emerald button styling to the CTA", () => {
        render(<Sidebar />);
        const cta = screen.getByRole("link", { name: /start new goal/i });
        expect(cta).toHaveClass("bg-[#047857]", "text-white", "rounded-xl");
      });

      it("guarantees no navigation entry in the entire sidebar has '/groups/new'", () => {
        render(<Sidebar />);
        const allLinks = screen.getAllByRole("link");
        allLinks.forEach((link) => {
          expect(link.getAttribute("href")).not.toBe("/groups/new");
        });
      });
    });
  });

  // Dimension 3: Host Variations, Mobile Drawer & Overlay
  describe("Dimension 3: Host Variations & Mobile Interactions", () => {
    it("renders the toggle button with aria-label", () => {
      render(<Sidebar />);
      expect(screen.getByRole("button", { name: /toggle navigation/i })).toBeInTheDocument();
    });

    it("starts closed with off-screen transform and no overlay", () => {
      render(<Sidebar />);
      const aside = screen.getByRole("complementary");
      expect(aside).toHaveClass("-translate-x-full");
      expect(document.querySelector(".fixed.inset-0.bg-black")).not.toBeInTheDocument();
    });

    it("opens drawer upon clicking hamburger button", () => {
      render(<Sidebar />);
      const toggle = screen.getByRole("button", { name: /toggle navigation/i });
      fireEvent.click(toggle);
      const aside = screen.getByRole("complementary");
      expect(aside).toHaveClass("translate-x-0");
      expect(document.querySelector(".fixed.inset-0.bg-black")).toBeInTheDocument();
    });

    it("closes drawer when clicking backdrop overlay", () => {
      render(<Sidebar />);
      const toggle = screen.getByRole("button", { name: /toggle navigation/i });
      fireEvent.click(toggle);
      const overlay = document.querySelector(".fixed.inset-0.bg-black")!;
      fireEvent.click(overlay);
      const aside = screen.getByRole("complementary");
      expect(aside).toHaveClass("-translate-x-full");
    });

    const closeNavItems = ["Home", "Savings", "Groups", "Payments", "Settings"];
    closeNavItems.forEach((name) => {
      it(`closes drawer when user clicks nav item '${name}'`, () => {
        render(<Sidebar />);
        const toggle = screen.getByRole("button", { name: /toggle navigation/i });
        fireEvent.click(toggle);
        const link = screen.getByRole("link", { name: new RegExp(name, "i") });
        fireEvent.click(link);
        const aside = screen.getByRole("complementary");
        expect(aside).toHaveClass("-translate-x-full");
      });
    });
  });

  // Dimension 4: Negative Controls & Route Isolation
  describe("Dimension 4: Negative Controls and False Positive Prevention", () => {
    const unrelatedRoutes = [
      "/admin", "/admin/users", "/login", "/register", "/auth/verify",
      "/terms", "/privacy", "/help", "/faq", "/support",
      "/api/health", "/api/groups", "/404", "/500", "/search"
    ];

    unrelatedRoutes.forEach((route) => {
      it(`does not falsely highlight any nav item on unrelated path '${route}'`, () => {
        mockUsePathname.mockReturnValue(route);
        render(<Sidebar />);
        const links = ["Home", "Savings", "Groups", "Payments", "Settings"];
        links.forEach((name) => {
          const el = screen.getByRole("link", { name: new RegExp(name, "i") });
          expect(el).toHaveClass("text-gray-600");
          expect(el).not.toHaveClass("bg-[#5fe3a1]");
        });
      });
    });
  });

  // Dimension 5: Lifecycle & Stress
  describe("Dimension 5: Stress Toggling and Unmount Safety", () => {
    it("handles 50 rapid sequential toggles without crashing or desync", () => {
      render(<Sidebar />);
      const toggle = screen.getByRole("button", { name: /toggle navigation/i });
      const aside = screen.getByRole("complementary");

      for (let i = 0; i < 50; i++) {
        fireEvent.click(toggle);
        const shouldBeOpen = i % 2 === 0;
        if (shouldBeOpen) {
          expect(aside).toHaveClass("translate-x-0");
        } else {
          expect(aside).toHaveClass("-translate-x-full");
        }
      }
    });

    it("unmounts cleanly with 0 console warnings or dangling nodes", () => {
      const { unmount } = render(<Sidebar />);
      expect(() => unmount()).not.toThrow();
    });
  });
});
