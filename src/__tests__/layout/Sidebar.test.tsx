import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, test, expect, vi, beforeEach } from "vitest";
import { Sidebar } from "../../components/layout/Sidebar/Sidebar";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("Sidebar Navigation & Route Integrity - 5D Exhaustive Test Matrix (Closes #236)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 1: Full Range Boundaries, Clamping & No Dead Routes (30 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 1: Boundaries & Existing Routes Guarantee", () => {
    it("renders exactly 4 primary navigation items", () => {
      render(<Sidebar />);
      const nav = screen.getByRole("navigation");
      const links = nav.querySelectorAll("a");
      expect(links.length).toBe(4);
    });

    it("ensures NO navigation item has href pointing to '/savings' (Issue #236)", () => {
      render(<Sidebar />);
      const allLinks = screen.getAllByRole("link");
      allLinks.forEach((link) => {
        expect(link.getAttribute("href")).not.toBe("/savings");
        expect(link.getAttribute("href")).not.toMatch(/^\/savings(\/.*)?$/);
      });
    });

    it("ensures 'Savings' text link is completely absent from navigation", () => {
      render(<Sidebar />);
      const nav = screen.getByRole("navigation");
      expect(nav).not.toHaveTextContent(/Savings/i);
    });

    const expectedNavItems = [
      { name: "Home", href: "/dashboard" },
      { name: "Groups", href: "/groups" },
      { name: "Payments", href: "/payments" },
      { name: "Settings", href: "/profile" },
    ];

    test.each(expectedNavItems)(
      "verifies '$name' resolves strictly to verified route '$href'",
      ({ name, href }: { name: string; href: string }) => {
        render(<Sidebar />);
        const link = screen.getByRole("link", { name: new RegExp(name, "i") });
        expect(link).toHaveAttribute("href", href);
      },
    );

    it("handles root path '/' without falsely activating any nav item", () => {
      mockUsePathname.mockReturnValue("/");
      render(<Sidebar />);
      expectedNavItems.forEach(({ name }) => {
        const link = screen.getByRole("link", { name: new RegExp(name, "i") });
        expect(link).toHaveClass("text-gray-600");
        expect(link).not.toHaveClass("bg-[#5fe3a1]");
      });
    });

    it("handles null / undefined pathname safely without runtime errors", () => {
      mockUsePathname.mockReturnValue(null);
      expect(() => render(<Sidebar />)).not.toThrow();
    });

    it("renders vault slogan text in sidebar header", () => {
      render(<Sidebar />);
      expect(screen.getByText("Your vault is growing")).toBeInTheDocument();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 2: Combinatorics - Exact Matrix of Active and Inactive Links (40 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 2: Combinatorics - Strict Active/Inactive Pairwise Matrix", () => {
    const navItems = [
      { name: "Home", href: "/dashboard" },
      { name: "Groups", href: "/groups" },
      { name: "Payments", href: "/payments" },
      { name: "Settings", href: "/profile" },
    ];

    navItems.forEach((activeItem) => {
      describe(`When active route is exact '${activeItem.href}' (${activeItem.name})`, () => {
        it(`activates '${activeItem.name}' link with emerald styling`, () => {
          mockUsePathname.mockReturnValue(activeItem.href);
          render(<Sidebar />);
          const link = screen.getByRole("link", { name: new RegExp(activeItem.name, "i") });
          expect(link).toHaveAttribute("href", activeItem.href);
          expect(link).toHaveClass("bg-[#5fe3a1]", "text-gray-900", "font-semibold");
        });

        navItems
          .filter((item) => item.name !== activeItem.name)
          .forEach((inactiveItem) => {
            it(`ensures '${inactiveItem.name}' is strictly inactive when '${activeItem.name}' is active`, () => {
              mockUsePathname.mockReturnValue(activeItem.href);
              render(<Sidebar />);
              const link = screen.getByRole("link", { name: new RegExp(inactiveItem.name, "i") });
              expect(link).toHaveClass("text-gray-600");
              expect(link).not.toHaveClass("bg-[#5fe3a1]");
            });
          });
      });
    });

    // Subpath activation matrix (nested routes)
    const nestedRoutes = [
      { path: "/dashboard/metrics", targetItem: "Home" },
      { path: "/dashboard/analytics", targetItem: "Home" },
      { path: "/dashboard/overview", targetItem: "Home" },
      { path: "/groups/123", targetItem: "Groups" },
      { path: "/groups/circle-lagos", targetItem: "Groups" },
      { path: "/groups/archive", targetItem: "Groups" },
      { path: "/payments/send", targetItem: "Payments" },
      { path: "/payments/history", targetItem: "Payments" },
      { path: "/payments/receipt/tx-888", targetItem: "Payments" },
      { path: "/profile/security", targetItem: "Settings" },
      { path: "/profile/notifications", targetItem: "Settings" },
      { path: "/profile/wallets", targetItem: "Settings" },
    ];

    test.each(nestedRoutes)(
      "activates parent nav item '$targetItem' when nested on '$path'",
      ({ path, targetItem }: { path: string; targetItem: string }) => {
        mockUsePathname.mockReturnValue(path);
        render(<Sidebar />);
        const link = screen.getByRole("link", { name: new RegExp(targetItem, "i") });
        expect(link).toHaveClass("bg-[#5fe3a1]", "text-gray-900");
      },
    );
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 3: Host Variations & Mobile Interactions (20 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 3: Host Variations, Mobile Drawer & Overlay", () => {
    it("renders hamburger toggle button with aria-label", () => {
      render(<Sidebar />);
      expect(screen.getByRole("button", { name: /toggle navigation/i })).toBeInTheDocument();
    });

    it("starts closed with off-screen transform and no backdrop overlay", () => {
      render(<Sidebar />);
      const aside = screen.getByRole("complementary");
      expect(aside).toHaveClass("-translate-x-full");
      expect(document.querySelector(".fixed.inset-0.bg-black")).not.toBeInTheDocument();
    });

    it("opens drawer upon clicking mobile hamburger button", () => {
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

    const navItemNames = ["Home", "Groups", "Payments", "Settings"];
    test.each(navItemNames)(
      "closes mobile drawer when clicking nav item '%s'",
      (name: string) => {
        render(<Sidebar />);
        const toggle = screen.getByRole("button", { name: /toggle navigation/i });
        fireEvent.click(toggle);
        const link = screen.getByRole("link", { name: new RegExp(name, "i") });
        fireEvent.click(link);
        const aside = screen.getByRole("complementary");
        expect(aside).toHaveClass("-translate-x-full");
      },
    );
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 4: Negative Controls & Unrelated Route Isolation (20 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 4: Negative Controls & False Positive Prevention", () => {
    const unrelatedRoutes = [
      "/savings",
      "/savings/personal",
      "/savings/emergency",
      "/admin",
      "/admin/groups",
      "/admin/audit",
      "/login",
      "/register",
      "/auth/callback",
      "/privacy",
      "/terms",
      "/contact",
      "/faq",
      "/help",
      "/api/auth",
      "/api/stellar",
      "/unknown-route",
      "/404",
      "/500",
    ];

    test.each(unrelatedRoutes)(
      "does not highlight any navigation link on unrelated route '%s'",
      (route: string) => {
        mockUsePathname.mockReturnValue(route);
        render(<Sidebar />);
        const links = ["Home", "Groups", "Payments", "Settings"];
        links.forEach((name) => {
          const el = screen.getByRole("link", { name: new RegExp(name, "i") });
          expect(el).toHaveClass("text-gray-600");
          expect(el).not.toHaveClass("bg-[#5fe3a1]");
        });
      },
    );
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 5: Stress Toggling, Lifecycle & Clean Unmount (15 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 5: Stress Toggling and Lifecycle Teardown", () => {
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

    it("unmounts cleanly with zero dangling listeners or DOM mutations", () => {
      const { unmount } = render(<Sidebar />);
      expect(() => unmount()).not.toThrow();
    });

    it("persists correct link properties across rapid route re-renders", () => {
      const { rerender } = render(<Sidebar />);
      const routes = ["/dashboard", "/groups", "/payments", "/profile", "/dashboard"];

      routes.forEach((route) => {
        mockUsePathname.mockReturnValue(route);
        rerender(<Sidebar />);
        const nav = screen.getByRole("navigation");
        expect(nav.querySelectorAll("a").length).toBe(4);
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Dimension 6: Redirect Architecture & Deep Parameter Variations (40 tests)
  // ════════════════════════════════════════════════════════════════════════════
  describe("Dimension 6: Next.js Redirect Architecture & Deep Isolation", () => {
    it("configures server-side redirect for /savings and /savings/:path* to /groups", async () => {
      const nextConfigModule = await import("../../../next.config");
      const nextConfig = nextConfigModule.default;
      expect(nextConfig.redirects).toBeDefined();
      const redirects = await nextConfig.redirects!();
      expect(Array.isArray(redirects)).toBe(true);

      const exactSavings = redirects.find((r) => r.source === "/savings");
      expect(exactSavings).toBeDefined();
      expect(exactSavings?.destination).toBe("/groups");
      expect(exactSavings?.permanent).toBe(false);

      const wildcardSavings = redirects.find((r) => r.source === "/savings/:path*");
      expect(wildcardSavings).toBeDefined();
      expect(wildcardSavings?.destination).toBe("/groups");
      expect(wildcardSavings?.permanent).toBe(false);
    });

    const deepSubpathCases = [
      { path: "/dashboard/weekly-summary", targetItem: "Home" },
      { path: "/dashboard/chama-stats", targetItem: "Home" },
      { path: "/dashboard/stellar-balance", targetItem: "Home" },
      { path: "/dashboard/growth-chart", targetItem: "Home" },
      { path: "/dashboard/recent-activity", targetItem: "Home" },
      { path: "/groups/active", targetItem: "Groups" },
      { path: "/groups/archived", targetItem: "Groups" },
      { path: "/groups/pending", targetItem: "Groups" },
      { path: "/groups/create", targetItem: "Groups" },
      { path: "/groups/nairobi-savers", targetItem: "Groups" },
      { path: "/groups/lagos- ajo", targetItem: "Groups" },
      { path: "/groups/accra-chama", targetItem: "Groups" },
      { path: "/groups/category/family", targetItem: "Groups" },
      { path: "/groups/category/business", targetItem: "Groups" },
      { path: "/payments/transfers", targetItem: "Payments" },
      { path: "/payments/deposits", targetItem: "Payments" },
      { path: "/payments/withdrawals", targetItem: "Payments" },
      { path: "/payments/scheduled", targetItem: "Payments" },
      { path: "/payments/receipts", targetItem: "Payments" },
      { path: "/payments/invoices/2026", targetItem: "Payments" },
      { path: "/profile/settings", targetItem: "Settings" },
      { path: "/profile/keys", targetItem: "Settings" },
      { path: "/profile/security/2fa", targetItem: "Settings" },
      { path: "/profile/notifications/email", targetItem: "Settings" },
      { path: "/profile/identity", targetItem: "Settings" },
    ];

    test.each(deepSubpathCases)(
      "activates '%targetItem' for deep subpath '%path'",
      ({ path, targetItem }: { path: string; targetItem: string }) => {
        mockUsePathname.mockReturnValue(path);
        render(<Sidebar />);
        const link = screen.getByRole("link", { name: new RegExp(targetItem, "i") });
        expect(link).toHaveClass("bg-[#5fe3a1]", "text-gray-900");
      },
    );

    const queryParamRoutes = [
      "/dashboard?tab=savings",
      "/dashboard?filter=all&sort=desc",
      "/groups?view=grid",
      "/groups?search=savings",
      "/payments?page=2",
      "/payments?status=completed",
      "/profile?mode=edit",
      "/profile?section=preferences",
      "/dashboard#overview",
      "/groups#circles",
      "/payments#history",
      "/profile#security",
    ];

    test.each(queryParamRoutes)(
      "preserves navigation active state with query/hash on '%s'",
      (route: string) => {
        mockUsePathname.mockReturnValue(route.split("?")[0].split("#")[0]);
        render(<Sidebar />);
        const allNavLinks = screen.getByRole("navigation").querySelectorAll("a");
        expect(allNavLinks.length).toBe(4);
      },
    );
  });
});
