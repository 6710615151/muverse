let allStudents = [];
let editingId   = null;

async function loadStudents(query = "") {
  const tbody = document.getElementById("students-tbody");
  setLoading(tbody, true);
  try {
    allStudents = query ? await Students.search(query) : await Students.getAll();
    renderTable(allStudents);
  } catch (e) {
    toast(e.message, "error");
  }
}

function renderTable(students) {
  const tbody = document.getElementById("students-tbody");
  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-icon">🎓</div><p>ไม่พบข้อมูลนักศึกษา</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = students.map(s => `
    <tr>
      <td class="mono">${s.student_id}</td>
      <td>${s.name}</td>
      <td><span class="badge badge-blue">${s.major}</span></td>
      <td>ปี ${s.year}</td>
      <td class="mono" style="font-size:11px;color:var(--text-muted)">${new Date(s.created_at).toLocaleDateString("th-TH")}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="openEdit('${s.student_id}')">แก้ไข</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.student_id}')">ลบ</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function loadStats() {
  try {
    const { summary, byMajor } = await Students.stats();
    document.getElementById("stat-total").textContent   = summary.total_students;
    document.getElementById("stat-majors").textContent  = summary.total_majors;
    document.getElementById("stat-avgyear").textContent = summary.avg_year ?? "—";
  } catch (e) { /* silent */ }
}

function openCreate() {
  editingId = null;
  document.getElementById("modal-title").textContent = "เพิ่มนักศึกษา";
  document.getElementById("student-form").reset();
  document.getElementById("field-student-id").disabled = false;
  openModal("student-modal");
}

async function openEdit(id) {
  editingId = id;
  try {
    const s = await Students.getOne(id);
    document.getElementById("modal-title").textContent = "แก้ไขข้อมูลนักศึกษา";
    document.getElementById("field-student-id").value  = s.student_id;
    document.getElementById("field-student-id").disabled = true;
    document.getElementById("field-name").value  = s.name;
    document.getElementById("field-major").value = s.major;
    document.getElementById("field-year").value  = s.year;
    openModal("student-modal");
  } catch (e) { toast(e.message, "error"); }
}

async function saveStudent() {
  const student_id = document.getElementById("field-student-id").value.trim();
  const name       = document.getElementById("field-name").value.trim();
  const major      = document.getElementById("field-major").value.trim();
  const year       = parseInt(document.getElementById("field-year").value);
  if (!student_id || !name || !major || !year) return toast("กรุณากรอกข้อมูลให้ครบ", "error");
  try {
    if (editingId) {
      await Students.update(editingId, { name, major, year });
      toast("อัปเดตข้อมูลเรียบร้อย");
    } else {
      await Students.create({ student_id, name, major, year });
      toast("เพิ่มนักศึกษาเรียบร้อย");
    }
    closeModal("student-modal");
    loadStudents();
    loadStats();
  } catch (e) { toast(e.message, "error"); }
}

async function deleteStudent(id) {
  if (!confirm(`ยืนยันลบนักศึกษา ${id}?`)) return;
  try {
    await Students.delete(id);
    toast("ลบนักศึกษาเรียบร้อย");
    loadStudents();
    loadStats();
  } catch (e) { toast(e.message, "error"); }
}

// Search debounce
let searchTimer;
document.getElementById("search-input")?.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadStudents(e.target.value), 350);
});

document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
  loadStats();
});
