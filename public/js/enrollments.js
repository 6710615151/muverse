async function loadEnrollments() {
  const tbody = document.getElementById("enroll-tbody");
  setLoading(tbody, true);
  try {
    const data = await Enrollments.getAll();
    renderTable(data);
  } catch (e) { toast(e.message, "error"); }
}

function renderTable(data) {
  const tbody = document.getElementById("enroll-tbody");
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><div class="empty-icon">📋</div><p>ไม่พบข้อมูลการลงทะเบียน</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(e => `
    <tr>
      <td class="mono">${e.student_id}</td>
      <td>${e.student_name}</td>
      <td class="mono">${e.course_id}</td>
      <td>${e.course_name}</td>
      <td><span class="badge badge-blue">${e.semester}</span></td>
      <td>${gradeBadge(e.grade)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="openGradeEdit(${e.id}, '${e.grade || ''}')">เกรด</button>
          <button class="btn btn-danger btn-sm" onclick="removeEnrollment(${e.id})">ลบ</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function loadStats() {
  try {
    const s = await Enrollments.stats();
    document.getElementById("stat-total").textContent   = s.total_enrollments;
    document.getElementById("stat-students").textContent = s.students_enrolled;
    document.getElementById("stat-courses").textContent = s.courses_active;
    document.getElementById("stat-graded").textContent  = s.graded_count;
  } catch (e) { /* silent */ }
}

// ─── Populate dropdowns ───────────────────────────────────────────────────────
async function populateDropdowns() {
  try {
    const [students, courses] = await Promise.all([Students.getAll(), Courses.getAll()]);
    const sel_s = document.getElementById("field-student-id");
    const sel_c = document.getElementById("field-course-id");
    sel_s.innerHTML = `<option value="">เลือกนักศึกษา</option>` +
      students.map(s => `<option value="${s.student_id}">${s.student_id} – ${s.name}</option>`).join("");
    sel_c.innerHTML = `<option value="">เลือกรายวิชา</option>` +
      courses.map(c => `<option value="${c.course_id}">${c.course_id} – ${c.course_name}</option>`).join("");
  } catch (e) { toast("โหลด dropdown ไม่สำเร็จ", "error"); }
}

function openEnroll() {
  document.getElementById("enroll-form").reset();
  populateDropdowns();
  openModal("enroll-modal");
}

async function saveEnrollment() {
  const student_id = document.getElementById("field-student-id").value;
  const course_id  = document.getElementById("field-course-id").value;
  const semester   = document.getElementById("field-semester").value.trim();
  const grade      = document.getElementById("field-grade").value || null;
  if (!student_id || !course_id || !semester) return toast("กรุณากรอกข้อมูลให้ครบ", "error");
  try {
    await Enrollments.enroll({ student_id, course_id, semester, grade });
    toast("ลงทะเบียนเรียบร้อย");
    closeModal("enroll-modal");
    loadEnrollments();
    loadStats();
  } catch (e) { toast(e.message, "error"); }
}

// ─── Grade edit ───────────────────────────────────────────────────────────────
let editingEnrollId = null;
function openGradeEdit(id, currentGrade) {
  editingEnrollId = id;
  document.getElementById("field-new-grade").value = currentGrade;
  openModal("grade-modal");
}

async function saveGrade() {
  const grade = document.getElementById("field-new-grade").value;
  if (!grade) return toast("กรุณาเลือกเกรด", "error");
  try {
    await Enrollments.updateGrade(editingEnrollId, grade);
    toast("บันทึกเกรดเรียบร้อย");
    closeModal("grade-modal");
    loadEnrollments();
  } catch (e) { toast(e.message, "error"); }
}

async function removeEnrollment(id) {
  if (!confirm("ยืนยันลบการลงทะเบียนนี้?")) return;
  try {
    await Enrollments.delete(id);
    toast("ลบการลงทะเบียนเรียบร้อย");
    loadEnrollments();
    loadStats();
  } catch (e) { toast(e.message, "error"); }
}

document.addEventListener("DOMContentLoaded", () => {
  loadEnrollments();
  loadStats();
});
