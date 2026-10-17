export type GroupKind = "home" | "travel" | "default";

export const normaliseGroupTag = (tag: string): string => tag.trim().toLowerCase();

export const getGroupKind = (tag: string): GroupKind => {
  const normalised = normaliseGroupTag(tag);
  if (normalised.includes("home")) return "home";
  if (normalised.includes("travel")) return "travel";
  return "default";
};

export const validateGroup = () => true;
