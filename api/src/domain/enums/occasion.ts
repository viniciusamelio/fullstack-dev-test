export const OCCASIONS = [
  "birthday",
  "christmas",
  "easter",
  "valentines",
  "anniversary",
  "wedding",
  "graduation",
  "thank_you",
  "get_well",
  "congratulations",
  "new_baby",
  "retirement",
] as const;

export type Occasion = (typeof OCCASIONS)[number];

export function isOccasion(value: string): value is Occasion {
  return (OCCASIONS as readonly string[]).includes(value);
}
