// Query keys for consistent cache management
export const queryKeys = {
  // Programs
  programs: ["programs"] as const,
  program: (id: string) => ["programs", id] as const,
  programSubjects: (id: string) => ["programs", id, "subjects"] as const,
  programStudents: (id: string) => ["programs", id, "students"] as const,

  // Students
  students: ["students"] as const,
  student: (id: string) => ["students", id] as const,

  // Subjects
  subjects: ["subjects"] as const,
  subject: (id: string) => ["subjects", id] as const,

  // Teachers
  teachers: ["teachers"] as const,
  teacher: (id: string) => ["teachers", id] as const,

  // Enrollments
  enrollments: ["enrollments"] as const,
  enrollment: (id: string) => ["enrollments", id] as const,

  // Dashboard
  dashboard: {
    stats: ["dashboard", "stats"] as const,
    recentStudents: ["dashboard", "recent-students"] as const,
    recentSubjects: ["dashboard", "recent-subjects"] as const,
  },
} as const;
