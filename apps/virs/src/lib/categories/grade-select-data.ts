import { GRADES, gradeLabel } from "@repo/core";

/** The grades as Select options. */
export const GRADE_SELECT_DATA = GRADES.map((grade) => ({ value: grade, label: gradeLabel(grade) }));
