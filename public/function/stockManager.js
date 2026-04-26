import { Stock, Category, seller as SellerAPI } from "./api.js";

let _all = [];
let _search = '';
let _catFilter = '';
let _sort = '';
let _editId = null;
let _deleteId = null;
let _selectedFile = null;
let _sellerId = null;

const getSellerId = () => _sellerId;

// ── Render ─────────────────────────────────────────────────────────────────

function stockRowHTML(stock) {
  const isOut = stock.stock_quantity <= 0 || stock.stock_status === 'out_of_stock';
  const price = Number(stock.price).toLocaleString('th-TH');

  return `
    <div data-stock-id="${stock.stock_id}" style="
      display:flex;align-items:center;gap:16px;padding:14px 18px;margin-bottom:10px;
      border-radius:14px;background:#fff;border:1px solid #ede8dc;
      box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:box-shadow 0.2s;
    " onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'"
       onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'">

      <div style="width:64px;height:64px;flex-shrink:0;border-radius:10px;overflow:hidden;background:#f5f0e8;">
        ${stock.url
          ? `<img src="${stock.url}" alt="${stock.item_name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;"><span class="fi fi-ts-box-open"></span></div>`}
      </div>

      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
          <span style="font-size:0.7rem;background:#f0e8d8;color:#92671a;padding:2px 8px;border-radius:20px;font-weight:600;">${stock.category_name ?? 'ไม่มีหมวดหมู่'}</span>
          <span style="font-size:0.7rem;padding:2px 8px;border-radius:20px;font-weight:600;
            background:${isOut ? '#fde8e8' : '#e8fdf0'};color:${isOut ? '#c53030' : '#276749'};">
            ${isOut ? 'หมดสต็อก' : 'มีสินค้า'}
          </span>
        </div>
        <h3 style="font-size:0.95rem;font-weight:700;color:#1a1a1a;margin:4px 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${stock.item_name}</h3>
        <p style="font-size:0.78rem;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${stock.description ?? '-'}</p>
      </div>

      <div style="text-align:right;flex-shrink:0;min-width:90px;">
        <p style="font-size:1.15rem;font-weight:800;color:#7c3aed;">฿${price}</p>
        <p style="font-size:0.78rem;color:#999;margin-top:2px;">คงเหลือ ${stock.stock_quantity} ชิ้น</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;margin-left:8px;">
        <button data-edit-id="${stock.stock_id}" style="
          padding:6px 16px;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;
          background:#7c3aed;color:#fff;border:none;">แก้ไข</button>
        <button data-delete-id="${stock.stock_id}" data-delete-name="${stock.item_name}" style="
          padding:6px 16px;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;
          background:#fff;color:#e53e3e;border:1.5px solid #e53e3e;">ลบ</button>
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
      <p style="font-size:2rem;margin-bottom:12px"><span class="fi fi-ts-box-open"></span></p>
      <p>No products found. Click "Add New Product" to start.</p>
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
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('modal-save-btn').textContent = 'Add Product';
  document.getElementById('stock-modal').style.display = 'flex';
}

function openEditModal(stockId) {
  const stock = _all.find(s => String(s.stock_id) === String(stockId));
  if (!stock) return;

  _editId = stockId;
  resetImagePreview();

  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('modal-save-btn').textContent = 'Save Changes';
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
    if (resultEl) resultEl.textContent = 'Current image exists (upload new to replace)';
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
  if (nameEl) nameEl.textContent = `"${name}" will be permanently removed from the system.`;
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
  saveBtn.textContent = 'Saving...';

  try {
    let url = _editId ? (_all.find(s => s.stock_id === _editId)?.url ?? '') : '';

    if (_selectedFile) {
      if (resultEl) resultEl.textContent = 'Uploading image...';
      url = await uploadImage(_selectedFile);
      if (resultEl) resultEl.textContent = 'Upload successful';
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
    alert('An error occurred: ' + err.message);
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
    alert('Delete failed: ' + err.message);
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

    const userId = localStorage.getItem('user_id');
    const list = document.getElementById('stock-list');

    try {
      const sellerData = await SellerAPI.getByUserId(userId);
      const sellerShop = await SellerAPI.getByIdSeller(sellerData.seller_id);

      const shopNameEl = document.getElementById('shop-name');
      if (shopNameEl) {
        // ใช้ sellerData.shop_name หรือชื่อ field ที่เก็บชื่อร้านใน Database ของคุณ
        shopNameEl.textContent = sellerShop.shop_name || 'My Shop'; 
      }
      _sellerId = sellerData.seller_id;

      const [stocks, cats] = await Promise.all([
        Stock.getBySeller(_sellerId),
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
      if (list) list.innerHTML = `<div style="padding:80px;text-align:center">Failed to load data</div>`;
    }

    document.getElementById('add-stock-btn')?.addEventListener('click', openModal);
    document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);
    document.getElementById('stock-form')?.addEventListener('submit', handleSubmit);
    document.getElementById('delete-cancel-btn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('delete-confirm-btn')?.addEventListener('click', handleDelete);

    document.getElementById('stock-modal')?.addEventListener('click', e => {
      if (e.target.id === 'stock-modal') closeModal();
    });

    // Image pick → preview
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