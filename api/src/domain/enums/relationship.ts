export const RELATIONSHIPS = [
  "mother",
  "father",
  "sibling",
  "husband",
  "wife",
  "friend",
  "colleague",
  "grandparent",
  "child",
  "partner",
] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

export function isRelationship(value: string): value is Relationship {
  return (RELATIONSHIPS as readonly string[]).includes(value);
}
