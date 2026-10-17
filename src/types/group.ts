export interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  /** Currency label used for display, e.g. "NGN". */
  currency?: string;
  /** Recurring contribution amount per member. */
  contributionAmount?: number;
  /**
   * Display label for the group, e.g. "FAMILY HOME" or "TRAVEL".
   * Not a discriminator; use `kind` for icon/behaviour selection.
   */
  tag?: string;
  /**
   * Structured discriminator used to pick the circle icon.
   * Unknown or missing values resolve to the default icon.
   */
  kind?: GroupKind;
}

export type GroupKind = "home" | "travel";

/** Default group kind used when `kind` is missing or unrecognised. */
export const DEFAULT_GROUP_KIND: GroupKind = "home";

/**
 * Normalise a raw group kind string (case-insensitive, trimmed) to a
 * known `GroupKind`, falling back to `DEFAULT_GROUP_KIND`.
 */
export function normaliseGroupKind(raw: string | undefined | null): GroupKind {
  const value = raw?.trim().toLowerCase();
  if (value === "home" || value === "travel") {
    return value;
  }
  return DEFAULT_GROUP_KIND;
}
