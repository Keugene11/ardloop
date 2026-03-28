import type { PostCategory } from "@/types";

export const categories: { value: PostCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "tutoring", label: "Tutoring" },
  { value: "babysitting", label: "Babysitting" },
  { value: "for-sale", label: "For Sale" },
  { value: "events", label: "Events" },
  { value: "recommendations", label: "Recommendations" },
  { value: "lost-found", label: "Lost & Found" },
  { value: "jobs", label: "Jobs" },
];

export function getCategoryLabel(value: PostCategory): string {
  return categories.find((c) => c.value === value)?.label || value;
}
