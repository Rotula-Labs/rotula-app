import { beforeEach, describe, expect, it } from "vitest";

import { groupsService } from "@/services/api/groups";

const INVITES_KEY = "kolo_invites";
const MEMBERSHIPS_KEY = "kolo_memberships";

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: createStorage(),
  });
});

describe("groupsService.listGroups / getGroup", () => {
  it("returns the seeded groups", () => {
    const groups = await groupsService.listGroups();
    expect(groups.map((group) => group.id)).toEqual(["g1", "g2"]);
  });

  it("resolves a group by id and returns null when missing", () => {
    await expect(groupsService.getGroup("g1")).resolves.toMatchObject({
      id: "g1",
      name: "Lagos Savers Circle",
    });
    await expect(groupsService.getGroup("nope")).resolves.toBeNull();
  });
});

describe("groupsService.createInvite / getInvite", () => {
  it("persists a new invite under kolo_invites and round-trips it", () => {
    const invite = await groupsService.createInvite("g1");

    const stored = JSON.parse(
      window.localStorage.getItem(INVITES_KEY) as string,
    ) as Record<string, string>;
    expect(stored[invite.code]).toBe("g1");

    await expect(groupsService.getInvite(invite.code)).resolves.toMatchObject({
      code: invite.code,
      group: { id: "g1" },
    });
  });

  it("stores invite codes in canonical lowercase", () => {
    const invite = await groupsService.createInvite("g1");
    expect(invite.code).toBe(invite.code.toLowerCase());
  });

  it("resolves a code entered with the wrong case", () => {
    const invite = await groupsService.createInvite("g2");
    const uppercased = invite.code.toUpperCase();

    await expect(groupsService.getInvite(uppercased)).resolves.toMatchObject({
      code: invite.code,
      group: { id: "g2" },
    });
  });

  it("rejects an invite for an unknown group", () => {
    await expect(groupsService.createInvite("missing")).rejects.toThrow(
      "Unknown group: missing",
    );
  });

  it("returns null for an unknown invite code", () => {
    await expect(groupsService.getInvite("does-not-exist")).resolves.toBeNull();
  });

  it("treats malformed JSON under kolo_invites as empty", () => {
    window.localStorage.setItem(INVITES_KEY, "{not valid json");
    await expect(groupsService.getInvite("anything")).resolves.toBeNull();
  });
});

describe("groupsService.joinGroup / hasJoined", () => {
  it("records membership under kolo_memberships", () => {
    await expect(groupsService.hasJoined("g1")).resolves.toBe(false);

    await groupsService.joinGroup("g1");

    await expect(groupsService.hasJoined("g1")).resolves.toBe(true);
    const stored = JSON.parse(
      window.localStorage.getItem(MEMBERSHIPS_KEY) as string,
    ) as Record<string, string>;
    expect(stored.g1).toBeTruthy();
  });

  it("treats malformed JSON under kolo_memberships as empty", () => {
    window.localStorage.setItem(MEMBERSHIPS_KEY, "not json either");
    await expect(groupsService.hasJoined("g1")).resolves.toBe(false);
  });
});
