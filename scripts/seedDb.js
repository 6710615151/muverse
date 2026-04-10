import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const STUDENTS = [
  { student_id: "6501001", name: "ภูมิพัฒน์ สุวรรณภูมิ",  major: "Computer Science",       year: 3 },
  { student_id: "6501002", name: "นภัสสร วงศ์ไพบูลย์",    major: "Computer Science",       year: 3 },
  { student_id: "6501003", name: "กิตติพงษ์ ชูศักดิ์",    major: "Information Technology", year: 2 },
  { student_id: "6501004", name: "ปิยธิดา แสงทอง",        major: "Data Science",           year: 4 },
  { student_id: "6501005", name: "วรากร ตั้งสิทธิ์",       major: "Computer Engineering",   year: 2 },
  { student_id: "6501006", name: "ชลธิชา มณีรัตน์",       major: "Data Science",           year: 3 },
  { student_id: "6501007", name: "อธิษฐ์ พรหมดวง",        major: "Information Technology", year: 1 },
  { student_id: "6501008", name: "พิมพ์ชนก อิสระวัฒน์",   major: "Computer Science",       year: 4 },
];

const COURSES = [
  { course_id: "CN230",  course_name: "Database Systems",          credits: 3, instructor: "อ.ดร.สมชาย รักษาดี",       department: "Computer Science" },
  { course_id: "CN231",  course_name: "Advanced SQL",              credits: 3, instructor: "อ.ดร.สมชาย รักษาดี",       department: "Computer Science" },
  { course_id: "CS101",  course_name: "Introduction to Programming", credits: 3, instructor: "อ.ณัฐพล วิชาการ",         department: "Computer Science" },
  { course_id: "CS201",  course_name: "Data Structures",           credits: 3, instructor: "อ.ดร.กานดา พัฒนาการ",     department: "Computer Science" },
  { course_id: "DS301",  course_name: "Machine Learning",          credits: 3, instructor: "รศ.ดร.วิภาวี ศรีสวัสดิ์", department: "Data Science"     },
  { course_id: "IT202",  course_name: "Network Fundamentals",      credits: 3, instructor: "อ.ประสิทธิ์ เทคโนโลยี",   department: "Information Technology" },
  { course_id: "MATH201", course_name: "Calculus II",              credits: 3, instructor: "รศ.คณิต สมการ",           department: "Mathematics"      },
];

const ENROLLMENTS = [
  { student_id: "6501001", course_id: "CN230",   semester: "2024-1", grade: "A"  },
  { student_id: "6501001", course_id: "CS201",   semester: "2024-1", grade: "B+" },
  { student_id: "6501001", course_id: "MATH201", semester: "2024-1", grade: "B"  },
  { student_id: "6501002", course_id: "CN230",   semester: "2024-1", grade: "A"  },
  { student_id: "6501002", course_id: "DS301",   semester: "2024-1", grade: "B+" },
  { student_id: "6501003", course_id: "CS101",   semester: "2024-1", grade: "B"  },
  { student_id: "6501003", course_id: "IT202",   semester: "2024-1", grade: "C+" },
  { student_id: "6501004", course_id: "CN230",   semester: "2024-1", grade: "B+" },
  { student_id: "6501004", course_id: "DS301",   semester: "2024-1", grade: "A"  },
  { student_id: "6501004", course_id: "CN231",   semester: "2024-1", grade: "B"  },
  { student_id: "6501005", course_id: "CS101",   semester: "2024-1", grade: "A"  },
  { student_id: "6501005", course_id: "MATH201", semester: "2024-1", grade: "B+" },
  { student_id: "6501006", course_id: "CN230",   semester: "2024-1", grade: "C+" },
  { student_id: "6501006", course_id: "DS301",   semester: "2024-1", grade: "B"  },
  { student_id: "6501007", course_id: "CS101",   semester: "2024-1", grade: null },
  { student_id: "6501008", course_id: "CN231",   semester: "2024-1", grade: "A"  },
  { student_id: "6501008", course_id: "CN230",   semester: "2023-2", grade: "B+" },
];

async function seedDb() {
  console.log("🌱 Seeding database...\n");

  // Students
  for (const s of STUDENTS) {
    await sql`
      INSERT INTO students (student_id, name, major, year)
      VALUES (${s.student_id}, ${s.name}, ${s.major}, ${s.year})
      ON CONFLICT (student_id) DO NOTHING
    `;
  }
  console.log(`✅ Inserted ${STUDENTS.length} students`);

  // Courses
  for (const c of COURSES) {
    await sql`
      INSERT INTO courses (course_id, course_name, credits, instructor, department)
      VALUES (${c.course_id}, ${c.course_name}, ${c.credits}, ${c.instructor}, ${c.department})
      ON CONFLICT (course_id) DO NOTHING
    `;
  }
  console.log(`✅ Inserted ${COURSES.length} courses`);

  // Enrollments
  for (const e of ENROLLMENTS) {
    await sql`
      INSERT INTO enrollments (student_id, course_id, semester, grade)
      VALUES (${e.student_id}, ${e.course_id}, ${e.semester}, ${e.grade})
      ON CONFLICT (student_id, course_id, semester) DO NOTHING
    `;
  }
  console.log(`✅ Inserted ${ENROLLMENTS.length} enrollments`);

  console.log("\n🎉 Seed complete!");
}

seedDb().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
