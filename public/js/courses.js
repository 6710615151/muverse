let editingId = null;

async function loadCourses() {
  const tbody = document.getElementById("courses-tbody");
  setLoading(tbody, true);
  try {
    const courses = await Courses.getAll();
    renderTable(courses);
  } catch (e) { toast(e.message, "error"); }
}

function renderTable(courses) {
  const tbody = document.getElementById("courses-tbody");
  if (!courses.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-icon">📚</div><p>ไม่พบรายวิชา</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = courses.map(c => `
    <tr>
      <td class="mono">${c.course_id}</td>
      <td>${c.course_name}</td>
      <td><span class="badge badge-green">${c.credits} หน่วยกิต</span></td>
      <td>${c.instructor}</td>
      <td><span class="badge badge-blue">${c.department}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="openEdit('${c.course_id}')">แก้ไข</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCourse('${c.course_id}')">ลบ</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function loadStats() {
  try {
    const s = await Courses.stats();
    document.getElementById("stat-total").textContent   = s.total_courses;
    document.getElementById("stat-credits").textContent = s.total_credits;
    document.getElementById("stat-depts").textContent   = s.total_departments;
  } catch (e) { /* silent */ }
}

function openCreate() {
  editingId = null;
  document.getElementById("modal-title").textContent = "เพิ่มรายวิชา";
  document.getElementById("course-form").reset();
  document.getElementById("field-course-id").disabled = false;
  openModal("course-modal");
}

async function openEdit(id) {
  editingId = id;
  try {
    const c = await Courses.getOne(id);
    document.getElementById("modal-title").textContent = "แก้ไขรายวิชา";
    document.getElementById("field-course-id").value   = c.course_id;
    document.getElementById("field-course-id").disabled = true;
    document.getElementById("field-course-name").value = c.course_name;
    document.getElementById("field-credits").value     = c.credits;
    document.getElementById("field-instructor").value  = c.instructor;
    document.getElementById("field-department").value  = c.department;
    openModal("course-modal");
  } catch (e) { toast(e.message, "error"); }
}

async function saveCourse() {
  const course_id   = document.getElementById("field-course-id").value.trim();
  const course_name = document.getElementById("field-course-name").value.trim();
  const credits     = parseInt(document.getElementById("field-credits").value);
  const instructor  = document.getElementById("field-instructor").value.trim();
  const department  = document.getElementById("field-department").value.trim();
  if (!course_id || !course_name || !credits || !instructor || !department) {
    return toast("กรุณากรอกข้อมูลให้ครบ", "error");
  }
  try {
    if (editingId) {
      await Courses.update(editingId, { course_name, credits, instructor, department });
      toast("อัปเดตรายวิชาเรียบร้อย");
    } else {
      await Courses.create({ course_id, course_name, credits, instructor, department });
      toast("เพิ่มรายวิชาเรียบร้อย");
    }
    closeModal("course-modal");
    loadCourses();
    loadStats();
  } catch (e) { toast(e.message, "error"); }
}

async function deleteCourse(id) {
  if (!confirm(`ยืนยันลบรายวิชา ${id}?`)) return;
  try {
    await Courses.delete(id);
    toast("ลบรายวิชาเรียบร้อย");
    loadCourses();
    loadStats();
  } catch (e) { toast(e.message, "error"); }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCourses();
  loadStats();
});
