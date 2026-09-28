import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];

  addCourse: (course: Course) => void;
  removeCourse: (courseCode: string) => void;
  removeInstructor: (courseCode: string, instructor: string) => void;
  enrollStudents: (courseCode: string, studentIds: string[]) => void;
  unenrollStudent: (courseCode: string, studentId: string) => void;
};
export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter(
            (course) => course.courseCode !== courseCode,
          ),
          students: state.students.map((std) => ({
            ...std,
            enrolledCourses: std.enrolledCourses.filter(
              (code) => code !== courseCode,
            ),
          })),
        })),

      removeInstructor: (courseCode, instructor) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.courseCode === courseCode
              ? {
                  ...course,
                  instructors: (course.instructors ?? []).filter(
                    (i) => i !== instructor,
                  ),
                }
              : course,
          ),
        })),

      enrollStudents: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((std) =>
            studentIds.includes(std.studentId) &&
            !std.enrolledCourses.includes(courseCode)
              ? {
                  ...std,
                  enrolledCourses: [...std.enrolledCourses, courseCode],
                }
              : std,
          ),
        })),

      unenrollStudent: (courseCode, studentId) =>
        set((state) => ({
          students: state.students.map((std) =>
            std.studentId === studentId
              ? {
                  ...std,
                  enrolledCourses: std.enrolledCourses.filter(
                    (code) => code !== courseCode,
                  ),
                }
              : std,
          ),
        })),
    }),

    {
      name: "lab16-2569-680610659",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
