import { Stock, Category } from "./api.js";

let _all = [];
let _search = '';
let _catFilter = '';
let _sort = '';
let _editId = null;
let _deleteId = null;
let _selectedFile = null;

const getSellerId = () => localStorage.getItem('id');

// ── Render ─────────────────────────────────────────────────────────────────

function stockRowHTML(stock) {
  const isOut = stock.stock_quantity <= 0 || stock.stock_status === 'out_of_stock';
  const price = Number(stock.price).toLocaleString('th-TH');
  const statusClass = isOut ? 'status-badge--pending' : 'status-badge--confirmed';

  return `
    <div class="service-card" data-stock-id="${stock.stock_id}"
      style="display:flex;align-items:center;gap:16px;padding:16px 20px">
      <div style="width:72px;height:72px;flex-shrink:0;border-radius:8px;overflow:hidden;
        background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)">
        ${stock.url
          ? `<img src="${stock.url}" alt="${stock.item_name}"
              style="width:100%;height:100%;object-fit:cover"
              onerror="this.style.display='none'">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;
              justify-content:center;font-size:1.6rem;opacity:0.3">📦</div>`}
      </div>
      <div style="flex:1;min-width:0">
        <p style="font-size:0.75rem;opacity:0.5;margin-bottom:2px">${stock.category_name ?? ''}</p>
        <h3 style="font-size:1rem;font-weight:600;margin-bottom:4px;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${stock.item_name}</h3>
        <p style="font-size:0.82rem;opacity:0.55;white-space:nowrap;overflow:hidden;
          text-overflow:ellipsis">${stock.description ?? ''}</p>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <p style="font-size:1.1rem;font-weight:700;margin-bottom:4px">฿${price}</p>
        <p style="font-size:0.78rem;opacity:0.55;margin-bottom:6px">จำนวน: ${stock.stock_quantity}</p>
        <span class="status-badge ${statusClass}">${isOut ? 'หมด' : 'พร้อมขาย'}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;margin-left:8px">
        <button class="btn btn--outline btn--sm" data-edit-id="${stock.stock_id}">แก้ไข</button>
        <button class="btn btn--sm"
          style="background:rgba(229,62,62,0.15);color:#e53e3e;border:1px solid rgba(229,62,62,0.3)"
          data-delete-id="${stock.stock_id}"
          data-delete-name="${stock.item_name}">ลบ</button>
      </div>
    </div>`;
}

function getFiltered() {
  let items = [..._all];
  if (_catFilter) items = items.filter(s => String(s.category_id) === _catFilter);
  if (_search) {
    const q = _search.toLowerCase();
    items = items.filter(s => s.item_name?.toLowerCase().includes(q));
  }
  if (_sort === 'name') items.sort((a, b) => a.item_name.localeCompare(b.item_name));
  if (_sort === 'price-asc') items.sort((a, b) => a.price - b.price);
  if (_sort === 'price-desc') items.sort((a, b) => b.price - a.price);
  if (_sort === 'qty-asc') items.sort((a, b) => a.stock_quantity - b.stock_quantity);
  return items;
}

function render() {
  const list = document.getElementById('stock-list');
  if (!list) return;
  const items = getFiltered();

  const countEl = document.getElementById('stock-count');
  const totalEl = document.getElementById('stat-total');
  const availEl = document.getElementById('stat-available');
  const outEl   = document.getElementById('stat-out');
  if (countEl) countEl.textContent = items.length;
  if (totalEl) totalEl.textContent = _all.length;
  if (availEl) availEl.textContent = _all.filter(s => s.stock_quantity > 0 && s.stock_status !== 'out_of_stock').length;
  if (outEl)   outEl.textContent   = _all.filter(s => s.stock_quantity <= 0 || s.stock_status === 'out_of_stock').length;

  if (!items.length) {
    list.innerHTML = `<div style="padding:80px;text-align:center;color:var(--clr-text-muted)">
      <p style="font-size:2rem;margin-bottom:12px">📦</p>
      <p>ยังไม่มีสินค้า กดเพิ่มสินค้าใหม่ได้เลย</p>
    </div>`;
    return;
  }

  list.innerHTML = items.map(stockRowHTML).join('');

  list.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.editId));
  });
  list.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.deleteId, btn.dataset.deleteName));
  });
}

// ── Modal ──────────────────────────────────────────────────────────────────

function resetImagePreview() {
  const preview = document.getElementById('img-preview');
  const resultEl = document.getElementById('upload-result');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (resultEl) resultEl.textContent = '';
  _selectedFile = null;
}

function openModal() {
  _editId = null;
  document.getElementById('stock-form')?.reset();
  resetImagePreview();
  document.getElementById('modal-title').textContent = 'เพิ่มสินค้าใหม่';
  document.getElementById('modal-save-btn').textContent = 'เพิ่มสินค้า';
  document.getElementById('stock-modal').style.display = 'flex';
}

function openEditModal(stockId) {
  const stock = _all.find(s => String(s.stock_id) === String(stockId));
  if (!stock) return;

  _editId = stockId;
  resetImagePreview();

  document.getElementById('modal-title').textContent = 'แก้ไขสินค้า';
  document.getElementById('modal-save-btn').textContent = 'บันทึกการเปลี่ยนแปลง';
  document.getElementById('f-item-name').value   = stock.item_name ?? '';
  document.getElementById('f-category').value    = stock.category_id ?? '';
  document.getElementById('f-item-type').value   = stock.item_type ?? '';
  document.getElementById('f-price').value       = stock.price ?? '';
  document.getElementById('f-quantity').value    = stock.stock_quantity ?? '';
  document.getElementById('f-description').value = stock.description ?? '';
  document.getElementById('f-status').value      = stock.stock_status ?? 'available';

  if (stock.url) {
    const preview = document.getElementById('img-preview');
    const resultEl = document.getElementById('upload-result');
    if (preview) { preview.src = stock.url; preview.style.display = 'block'; }
    if (resultEl) resultEl.textContent = 'มีรูปภาพอยู่แล้ว (เลือกไฟล์ใหม่เพื่อเปลี่ยน)';
  }

  document.getElementById('stock-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('stock-modal').style.display = 'none';
  _editId = null;
  _selectedFile = null;
}

function openDeleteModal(stockId, name) {
  _deleteId = stockId;
  const nameEl = document.getElementById('delete-modal-name');
  if (nameEl) nameEl.textContent = `"${name}" จะถูกลบออกจากระบบถาวร`;
  document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
  _deleteId = null;
}

// ── Upload ─────────────────────────────────────────────────────────────────

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

// ── Submit ─────────────────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();
  const saveBtn   = document.getElementById('modal-save-btn');
  const resultEl  = document.getElementById('upload-result');
  const origLabel = saveBtn.textContent;

  saveBtn.disabled = true;
  saveBtn.textContent = 'กำลังบันทึก...';

  try {
    let url = _editId ? (_all.find(s => s.stock_id === _editId)?.url ?? '') : '';

    if (_selectedFile) {
      if (resultEl) resultEl.textContent = 'กำลังอัพโหลดรูป...';
      url = await uploadImage(_selectedFile);
      if (resultEl) resultEl.textContent = 'อัพโหลดสำเร็จ ✅';
    }

    const body = {
      seller_id:      getSellerId(),
      category_id:    document.getElementById('f-category').value,
      item_name:      document.getElementById('f-item-name').value.trim(),
      description:    document.getElementById('f-description').value.trim(),
      price:          document.getElementById('f-price').value,
      stock_quantity: document.getElementById('f-quantity').value,
      item_type:      document.getElementById('f-item-type').value.trim() || 'physical',
      stock_status:   document.getElementById('f-status').value,
      url,
    };

    if (_editId) {
      await Stock.update(_editId, body);
    } else {
      await Stock.create(body);
    }

    _all = (await Stock.getBySeller(getSellerId())) ?? [];
    closeModal();
    render();

  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = origLabel;
  }
}

async function handleDelete() {
  if (!_deleteId) return;
  const btn = document.getElementById('delete-confirm-btn');
  btn.disabled = true;
  try {
    await Stock.delete(_deleteId);
    _all = _all.filter(s => String(s.stock_id) !== String(_deleteId));
    closeDeleteModal();
    render();
  } catch (err) {
    alert('ลบไม่สำเร็จ: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

// ── Init ───────────────────────────────────────────────────────────────────

export const SellerStock = {
  async init() {
    _search = '';
    _catFilter = '';
    _sort = '';
    _editId = null;
    _deleteId = null;
    _selectedFile = null;

    const sellerId = getSellerId();
    const list = document.getElementById('stock-list');

    try {
      const [stocks, cats] = await Promise.all([
        Stock.getBySeller(sellerId),
        Category.getAll(),
      ]);

      _all = stocks ?? [];

      const options = (cats ?? []).map(c =>
        `<option value="${c.category_id}">${c.name}</option>`
      ).join('');
      const catSelect = document.getElementById('f-category');
      const catFilter = document.getElementById('stock-cat-filter');
      if (catSelect) catSelect.innerHTML += options;
      if (catFilter) catFilter.innerHTML += options;

      render();

    } catch (err) {
      console.error('[SellerStock]', err);
      if (list) list.innerHTML = `<div style="padding:80px;text-align:center">โหลดข้อมูลไม่สำเร็จ</div>`;
    }

    document.getElementById('add-stock-btn')?.addEventListener('click', openModal);
    document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);
    document.getElementById('stock-form')?.addEventListener('submit', handleSubmit);
    document.getElementById('delete-cancel-btn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('delete-confirm-btn')?.addEventListener('click', handleDelete);

    document.getElementById('stock-modal')?.addEventListener('click', e => {
      if (e.target.id === 'stock-modal') closeModal();
    });

    // Image pick → preview (logic จาก testUpload.html)
    document.getElementById('f-image')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      _selectedFile = file;
      const preview = document.getElementById('img-preview');
      const reader = new FileReader();
      reader.onload = ev => {
        if (preview) { preview.src = ev.target.result; preview.style.display = 'block'; }
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('stock-search')?.addEventListener('input', e => {
      _search = e.target.value;
      render();
    });
    document.getElementById('stock-cat-filter')?.addEventListener('change', e => {
      _catFilter = e.target.value;
      render();
    });
    document.getElementById('stock-sort')?.addEventListener('change', e => {
      _sort = e.target.value;
      render();
    });
  },
};
