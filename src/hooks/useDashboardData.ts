import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { queryKeys } from "@/lib/queryKeys";
import type { Student } from "@/lib/types/student";
import type { Subject } from "@/lib/types/subject";
import type { Program } from "@/lib/types/program";
import type { User } from "@/lib/types/user";

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalPrograms: number;
  totalSubjects: number;
}

export interface RecentStudent {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface RecentSubject {
  id: string;
  name: string;
  programName: string;
  createdAt: Date;
}

// Standalone function to fetch dashboard data
async function fetchDashboardData(): Promise<{
  stats: DashboardStats;
  recentStudents: RecentStudent[];
  recentSubjects: RecentSubject[];
}> {
  // Fetch all collections in parallel
  const [
    studentsSnapshot,
    teachersSnapshot,
    programsSnapshot,
    subjectsSnapshot,
  ] = await Promise.all([
    getDocs(collection(db, "students")),
    getDocs(query(collection(db, "users"), orderBy("created_at", "desc"))),
    getDocs(collection(db, "programs")),
    getDocs(collection(db, "subjects")),
  ]);

  // Calculate stats
  const teachers = teachersSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as User)
    .filter((user) => user.role === "teacher");

  const stats: DashboardStats = {
    totalStudents: studentsSnapshot.size,
    totalTeachers: teachers.length,
    totalPrograms: programsSnapshot.size,
    totalSubjects: subjectsSnapshot.size,
  };

  // Get recent students (last 5)
  const studentsQuery = query(
    collection(db, "students"),
    orderBy("created_at", "desc"),
    limit(5)
  );
  const recentStudentsSnapshot = await getDocs(studentsQuery);
  const recentStudents = recentStudentsSnapshot.docs.map((doc) => {
    const data = doc.data() as Student;
    return {
      id: doc.id,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email || "No email",
      createdAt: data.created_at?.toDate() || new Date(),
    };
  });

  // Get recent subjects (last 5) with program names
  const subjectsQuery = query(
    collection(db, "subjects"),
    orderBy("created_at", "desc"),
    limit(5)
  );
  const recentSubjectsSnapshot = await getDocs(subjectsQuery);

  // Create a map of program IDs to names
  const programsMap = new Map<string, string>();
  programsSnapshot.docs.forEach((doc) => {
    const program = doc.data() as Program;
    programsMap.set(doc.id, program.name);
  });

  const recentSubjects = recentSubjectsSnapshot.docs.map((doc) => {
    const data = doc.data() as Subject;
    return {
      id: doc.id,
      name: data.descriptive_title,
      programName: programsMap.get(data.program_id) || "Unknown Program",
      createdAt: data.created_at?.toDate() || new Date(),
    };
  });

  return {
    stats,
    recentStudents,
    recentSubjects,
  };
}

export function useDashboardData() {
  // Query for fetching dashboard data
  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: fetchDashboardData,
  });

  // Destructure data with fallback
  const { stats, recentStudents, recentSubjects } = data || {
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalPrograms: 0,
      totalSubjects: 0,
    },
    recentStudents: [],
    recentSubjects: [],
  };

  // Format error message
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load dashboard data"
    : null;

  return {
    stats,
    recentStudents,
    recentSubjects,
    isLoading,
    error,
  };
}
