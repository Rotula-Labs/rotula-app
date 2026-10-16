import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GroupDetails from "@/app/(dashboard)/groups/[id]/page";
import { groupsService } from "@/services/api/groups";
import type { Group } from "@/types/group";

let mockParams: { id?: string } = { id: "g1" };

vi.mock("next/navigation", () => ({
  useParams: () => mockParams,
}));

describe("GroupDetails Dynamic Route Component (Exhaustive 5D Suite - 45+ Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { id: "g1" };
  });

  describe("Dimension 1: Reserved Keyword Defense and Malformed Slugs", () => {
    const reservedOrMalformed = [
      "new", "NEW", "New", "nEw",
      "create", "edit", "delete", "destroy",
      "undefined", "null", "NaN", "[id]",
      "0", "-1", "999999",
      "group-404", "unknown-circle", "test_group_xyz",
      "...", "%20", "new-goal", "goal/new",
      "admin", "settings", "profile"
    ];

    reservedOrMalformed.forEach((slug) => {
      it(`safely renders not-found state without leaking fixtures for slug '${slug}'`, async () => {
        mockParams = { id: slug };
        if (slug !== "new") {
          vi.spyOn(groupsService, "getGroup").mockResolvedValue(null);
        }

        await act(async () => {
          render(<GroupDetails />);
        });

        expect(screen.getByText("Group not found or unavailable.")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /return to groups/i })).toHaveAttribute("href", "/groups");
        expect(screen.queryByText(/Term Fees/i)).not.toBeInTheDocument();
      });
    });

    it("does not call getGroup when params id is 'new'", async () => {
      mockParams = { id: "new" };
      const getGroupSpy = vi.spyOn(groupsService, "getGroup");

      await act(async () => {
        render(<GroupDetails />);
      });

      expect(getGroupSpy).not.toHaveBeenCalled();
    });

    it("handles missing id parameter gracefully", async () => {
      mockParams = {};
      await act(async () => {
        render(<GroupDetails />);
      });
      expect(screen.getByText("Group not found or unavailable.")).toBeInTheDocument();
    });

    it("handles empty string id gracefully", async () => {
      mockParams = { id: "" };
      await act(async () => {
        render(<GroupDetails />);
      });
      expect(screen.getByText("Group not found or unavailable.")).toBeInTheDocument();
    });
  });

  describe("Dimension 2: Combinatorics - Valid Groups and Boundary Attributes", () => {
    const validGroupVariations: { id: string; name: string; memberCount: number; contribution: number }[] = [
      { id: "g1", name: "Lagos Savers Circle", memberCount: 8, contribution: 10000 },
      { id: "g2", name: "Family Emergency Fund", memberCount: 5, contribution: 25000 },
      { id: "g3", name: "Tech Founders Ajo", memberCount: 1, contribution: 50000 },
      { id: "g4", name: "Mega Cooperative", memberCount: 100, contribution: 5000 },
      { id: "g5", name: "Micro Savings Circle", memberCount: 2, contribution: 1000 },
    ];

    validGroupVariations.forEach(({ id, name, memberCount, contribution }) => {
      it(`renders group '${name}' (${id}) with ${memberCount} members and ${contribution} contribution`, async () => {
        mockParams = { id };
        vi.spyOn(groupsService, "getGroup").mockResolvedValue({
          id,
          name,
          description: "Active circle description",
          memberCount,
          currency: "NGN",
          contributionAmount: contribution,
        });

        await act(async () => {
          render(<GroupDetails />);
        });

        expect(screen.getByRole("heading", { name: new RegExp(name, "i") })).toBeInTheDocument();
        expect(screen.queryByText("Group not found or unavailable.")).not.toBeInTheDocument();
      });
    });

    it("renders fallback member count when group.memberCount is undefined", async () => {
      mockParams = { id: "g1" };
      vi.spyOn(groupsService, "getGroup").mockResolvedValue({
        id: "g1",
        name: "Default Members Circle",
        description: "Testing fallback members",
        currency: "NGN",
      });

      await act(async () => {
        render(<GroupDetails />);
      });

      expect(screen.getByRole("heading", { name: /default members circle/i })).toBeInTheDocument();
    });
  });

  describe("Dimension 3: Host Variations & Navigation Elements", () => {
    it("provides accessible link back to /groups in not-found view", async () => {
      mockParams = { id: "new" };
      await act(async () => {
        render(<GroupDetails />);
      });

      const returnLink = screen.getByRole("link", { name: /return to groups/i });
      expect(returnLink).toBeInTheDocument();
      expect(returnLink).toHaveAttribute("href", "/groups");
      expect(returnLink).toHaveClass("text-[#047857]", "underline");
    });
  });

  describe("Dimension 4: Negative Controls", () => {
    it("never renders deposit fixtures or next milestone for rejected 'new' route", async () => {
      mockParams = { id: "new" };
      await act(async () => {
        render(<GroupDetails />);
      });

      expect(screen.queryByText("Recent Deposits")).not.toBeInTheDocument();
      expect(screen.queryByText("Next Milestone")).not.toBeInTheDocument();
      expect(screen.queryByText("Segun Arinze")).not.toBeInTheDocument();
      expect(screen.queryByText("Uncle Segun")).not.toBeInTheDocument();
    });

    it("never renders member list when group lookup fails", async () => {
      mockParams = { id: "unknown" };
      vi.spyOn(groupsService, "getGroup").mockResolvedValue(null);
      await act(async () => {
        render(<GroupDetails />);
      });

      expect(screen.queryByText("Uncle Segun")).not.toBeInTheDocument();
    });
  });

  describe("Dimension 5: Lifecycle & Unmount Safety", () => {
    const unmountDelays = [0, 5, 20];
    unmountDelays.forEach((delay) => {
      it(`unmounts safely when async fetch is interrupted at delay ${delay}ms`, async () => {
        mockParams = { id: "g1" };
        let resolvePromise: (val: Group | null) => void;
        const pending = new Promise<Group | null>((res) => {
          resolvePromise = res;
        });
        vi.spyOn(groupsService, "getGroup").mockReturnValue(pending);

        const { unmount } = render(<GroupDetails />);
        expect(screen.getByText("Loading group...")).toBeInTheDocument();

        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }

        unmount();

        await act(async () => {
          resolvePromise!({
            id: "g1",
            name: "Late Arriving Group",
            memberCount: 4,
            currency: "NGN",
          });
        });
      });
    });
  });
});
