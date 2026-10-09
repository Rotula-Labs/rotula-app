import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildInviteUrl,
  buildWhatsAppShareUrl,
  generateInviteCode,
} from "@/utils/invite";

describe("generateInviteCode", () => {
  it("produces a URL-safe code of the requested length", () => {
    const code = generateInviteCode(12);
    expect(code).toMatch(/^[A-Za-z0-9]+$/);
    expect(code).toHaveLength(12);
  });

  it("defaults to a 9-character code", () => {
    expect(generateInviteCode()).toHaveLength(9);
  });

  it("produces different codes across calls", () => {
    expect(generateInviteCode()).not.toBe(generateInviteCode());
  });
});

describe("buildInviteUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses an explicit origin when provided", () => {
    expect(buildInviteUrl("abc123", "https://example.com")).toBe(
      "https://example.com/invite/abc123",
    );
  });

  it("defaults to the current window origin on the client", () => {
    expect(buildInviteUrl("clientcode")).toBe(
      `${window.location.origin}/invite/clientcode`,
    );
  });

  it("falls back to rotula.app when window is unavailable", () => {
    vi.stubGlobal("window", undefined);
    expect(buildInviteUrl("servercode")).toBe(
      "https://rotula.app/invite/servercode",
    );
  });
});

describe("buildWhatsAppShareUrl", () => {
  it("encodes the message text and url into the wa.me deep link", () => {
    expect(
      buildWhatsAppShareUrl(
        "https://rotula.app/invite/abc123",
        "Join my group",
      ),
    ).toBe(
      "https://wa.me/?text=Join%20my%20group%20https%3A%2F%2Frotula.app%2Finvite%2Fabc123",
    );
  });

  it("shares the bare url when no text is provided", () => {
    expect(buildWhatsAppShareUrl("https://rotula.app/invite/abc123")).toBe(
      `https://wa.me/?text=${encodeURIComponent(
        "https://rotula.app/invite/abc123",
      )}`,
    );
  });
});
