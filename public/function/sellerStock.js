import { Stock, Category } from "./api.js";

// ─── State ────────────────────────────────────────────────────────────────────
let _sellerId  = null;
let _allStocks = [];
let _categories = [];
let _search    = '';
let _catFilter = '';
let _sort      = '';
let _editingId  = null;
let _deletingId = null;

// ─── Public API ───────────────────────────────────────────────────────────────
export const SellerStock = {

  async init() {
    _sellerId  = window._sellerId ?? 1;
    _search    = '';
    _catFilter = '';
    _sort      = '';
    _editingId  = null;
    _deletingId = null;

    try {
      const [stocks, cats] = await Promise.all([
        Stock.getBySeller(_sellerId),
        Category.getAll(),
      ]);
      _allStocks  = stocks ?? [];
      _categories = cats   ?? [];
    } catch (err) {
      console.error('[SellerStock.init]', err);
      _allStocks  = [];
      _categories = [];
    }

    _renderStats();
    _renderList();
    _fillCategoryOptions();
    _bindEvents();
  },

  openCreate() {
    _editingId = null;
    setText('modal-title', 'เพิ่มสินค้าใหม่');
    setText('modal-save-btn', 'เพิ่มสินค้า');
    _clearForm();
    _openModal('stock-modal');
  },

  openEdit(id) {
    const stock = _allStocks.find(s => s.stock_id === id);
    if (!stock) return;
    _editingId = id;
    setText('modal-title', 'แก้ไขสินค้า');
    setText('modal-save-btn', 'บันทึกการเปลี่ยนแปลง');
    _fillForm(stock);
    _openModal('stock-modal');
  },

  confirmDelete(id) {
    const stock = _allStocks.find(s => s.stock_id === id);
    _deletingId = id;
    setText('delete-modal-name', `"${stock?.item_name ?? ''}" จะถูกลบออกจากระบบถาวร`);
    _openModal('delete-modal');
  },
};

// expose ให้ onclick ใน HTML เรียกได้
window.SellerStock = SellerStock;

// ─── Render ───────────────────────────────────────────────────────────────────

function _renderStats() {
  const total = _allStocks.length;
  const avail = _allStocks.filter(s =>
    s.stock_quantity > 0 && s.stock_status !== 'out_of_stock'
  ).length;
  setText('stat-total',     total);
  setText('stat-available', avail);
  setText('stat-out',       total - avail);
}

function _filtered() {
  let items = [..._allStocks];

  if (_catFilter) {
    items = items.filter(s => String(s.category_id) === _catFilter);
  }
  if (_search) {
    const q = _search.toLowerCase();
    items = items.filter(s => s.item_name?.toLowerCase().includes(q));
  }
  if (_sort === 'name')       items.sort((a, b) => a.item_name.localeCompare(b.item_name));
  if (_sort === 'price-asc')  items.sort((a, b) => a.price - b.price);
  if (_sort === 'price-desc') items.sort((a, b) => b.price - a.price);
  if (_sort === 'qty-asc')    items.sort((a, b) => a.stock_quantity - b.stock_quantity);

  return items;
}

function _renderList() {
  const list  = document.getElementById('stock-list');
  const count = document.getElementById('stock-count');
  if (!list) return;

  const items = _filtered();
  if (count) count.textContent = items.length;

  if (!items.length) {
    list.innerHTML = `
      <div style="padding:80px;text-align:center;color:var(--clr-text-muted)">
        <p style="font-size:2rem;margin-bottom:12px">📦</p>
        <p>ไม่พบสินค้า — กดปุ่ม <strong style="color:var(--clr-gold)">+ เพิ่มสินค้าใหม่</strong> เพื่อเริ่มต้น</p>
      </div>`;
    return;
  }

  list.innerHTML = items.map(_stockRowHTML).join('');
}

const IMG_NUMS = ['1', '2'];

function _stockRowHTML(stock) {
  const isOut  = stock.stock_quantity <= 0 || stock.stock_status === 'out_of_stock';
  const price  = Number(stock.price).toLocaleString('th-TH');
  const catName = _categories.find(c => c.category_id === stock.category_id)?.name ?? '—';
  const desc   = stock.description
    ? stock.description.slice(0, 60) + (stock.description.length > 60 ? '...' : '')
    : '';
  const num = IMG_NUMS[stock.stock_id % IMG_NUMS.length];

  return `
    <div class="booking-item" data-stock-id="${stock.stock_id}">
      <div class="order-item__img order-item__img--${num}"
        style="width:56px;height:56px;flex-shrink:0;border-radius:var(--radius-sm)"></div>

      <div class="booking-item__info" style="flex:1;min-width:0">
        <p class="booking-item__name">${stock.item_name}</p>
        <p class="booking-item__meta">${catName}${desc ? ' · ' + desc : ''}</p>
      </div>

      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin:0 16px;flex-shrink:0">
        <span style="font-family:var(--font-display);font-size:1.25rem;color:var(--clr-gold-light)">
          ฿${price}
        </span>
        <span class="status-badge ${isOut ? 'status-badge--pending' : 'status-badge--confirmed'}">
          ${isOut ? 'หมด' : `${stock.stock_quantity} ชิ้น`}
        </span>
      </div>

      <div class="booking-item__actions" style="flex-shrink:0">
        <button class="btn btn--outline btn--sm"
          onclick="SellerStock.openEdit(${stock.stock_id})">✏ แก้ไข</button>
        <button class="btn btn--ghost btn--sm"
          onclick="SellerStock.confirmDelete(${stock.stock_id})"
          style="color:#fc8181;border-color:rgba(252,129,129,0.25)">🗑 ลบ</button>
      </div>
    </div>`;
}

// ─── Events ───────────────────────────────────────────────────────────────────

function _bindEvents() {
  document.getElementById('add-stock-btn')
    ?.addEventListener('click', () => SellerStock.openCreate());

  document.getElementById('stock-search')
    ?.addEventListener('input', e => { _search = e.target.value; _renderList(); });

  document.getElementById('stock-cat-filter')
    ?.addEventListener('change', e => { _catFilter = e.target.value; _renderList(); });

  document.getElementById('stock-sort')
    ?.addEventListener('change', e => { _sort = e.target.value; _renderList(); });

  document.getElementById('stock-form')
    ?.addEventListener('submit', async e => { e.preventDefault(); await _saveStock(); });

  document.getElementById('modal-cancel-btn')
    ?.addEventListener('click', () => _closeModal('stock-modal'));

  document.getElementById('delete-cancel-btn')
    ?.addEventListener('click', () => _closeModal('delete-modal'));

  document.getElementById('delete-confirm-btn')
    ?.addEventListener('click', async () => { await _deleteStock(); });

  // ปิด modal เมื่อคลิก backdrop
  ['stock-modal', 'delete-modal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => {
      if (e.target.id === id) _closeModal(id);
    });
  });
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

async function _saveStock() {
  const saveBtn = document.getElementById('modal-save-btn');
  const isEdit  = !!_editingId;
  saveBtn.disabled    = true;
  saveBtn.textContent = 'กำลังบันทึก...';

  const body = {
    seller_id:      _sellerId,
    item_name:      document.getElementById('f-item-name').value.trim(),
    category_id:    Number(document.getElementById('f-category').value),
    item_type:      document.getElementById('f-item-type').value.trim(),
    price:          Number(document.getElementById('f-price').value),
    stock_quantity: Number(document.getElementById('f-quantity').value),
    description:    document.getElementById('f-description').value.trim(),
    stock_status:   document.getElementById('f-status').value,
  };

  try {
    if (isEdit) {
      await Stock.update(_editingId, body);
    } else {
      await Stock.create(body);
    }

    _closeModal('stock-modal');

    const stocks = await Stock.getBySeller(_sellerId);
    _allStocks = stocks ?? [];
    _renderStats();
    _renderList();
    _showToast(isEdit ? '✓ แก้ไขสินค้าสำเร็จ' : '✓ เพิ่มสินค้าใหม่สำเร็จ');
  } catch (err) {
    console.error('[saveStock]', err);
    _showToast('เกิดข้อผิดพลาด กรุณาลองใหม่');
  } finally {
    saveBtn.disabled    = false;
    saveBtn.textContent = isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสินค้า';
  }
}

async function _deleteStock() {
  if (!_deletingId) return;
  const btn = document.getElementById('delete-confirm-btn');
  btn.disabled    = true;
  btn.textContent = 'กำลังลบ...';

  try {
    await Stock.delete(_deletingId);
    _allStocks = _allStocks.filter(s => s.stock_id !== _deletingId);
    _closeModal('delete-modal');
    _renderStats();
    _renderList();
    _showToast('ลบสินค้าสำเร็จ');
  } catch (err) {
    console.error('[deleteStock]', err);
    _showToast('เกิดข้อผิดพลาด กรุณาลองใหม่');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'ลบสินค้า';
    _deletingId = null;
  }
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function _fillCategoryOptions() {
  const selForm   = document.getElementById('f-category');
  const selFilter = document.getElementById('stock-cat-filter');

  const opts = _categories
    .map(c => `<option value="${c.category_id}">${c.name}</option>`)
    .join('');

  if (selForm)   selForm.innerHTML   = `<option value="">เลือกหมวดหมู่</option>${opts}`;
  if (selFilter) selFilter.innerHTML = `<option value="">ทุกหมวดหมู่</option>${opts}`;
}

function _fillForm(stock) {
  setVal('f-item-name',   stock.item_name      ?? '');
  setVal('f-category',    stock.category_id    ?? '');
  setVal('f-item-type',   stock.item_type      ?? '');
  setVal('f-price',       stock.price          ?? '');
  setVal('f-quantity',    stock.stock_quantity ?? '');
  setVal('f-description', stock.description    ?? '');
  setVal('f-status',      stock.stock_status   ?? 'available');
}

function _clearForm() {
  ['f-item-name', 'f-item-type', 'f-price', 'f-quantity', 'f-description'].forEach(id => setVal(id, ''));
  setVal('f-category', '');
  setVal('f-status',   'available');
}

// ─── Modal helpers ────────────────────────────────────────────────────────────

function _openModal(id)  { document.getElementById(id)?.classList.add('active'); }
function _closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

// ─── Utils ────────────────────────────────────────────────────────────────────

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
function _showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
