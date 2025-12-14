import { SCHOOLS, SchoolId } from "./schools";

export const schoolColors: Record<SchoolId, string> = Object.fromEntries(
  Object.entries(SCHOOLS).map(([id, config]) => [id, config.colors.bg])
) as Record<SchoolId, string>;
