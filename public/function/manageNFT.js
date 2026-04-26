import { Stock, Category, seller } from "./api.js";

let _all = [];
let _wallpaperCatId = null;
let _search = '';
let _sort = '';
let _editId = null;
let _deleteId = null;
let _selectedFile = null;

// ── Render ─────────────────────────────────────────────────────────────────

function nftRowHTML(item) {
  const isOut = item.stock_quantity <= 0 || item.stock_status === 'out_of_stock';
  const price = Number(item.price).toLocaleString('th-TH');

  const imgEl = item.url
    ? `<img src="${item.url}" alt="${item.item_name}" class="nft-card__img" onerror="this.outerHTML='<div class=\\'nft-card__img-ph\\'>🖼️</div>'">`
    : `<div class="nft-card__img-ph">🖼️</div>`;

  return `
    <div data-nft-id="${item.stock_id}" class="nft-card">
      ${imgEl}
      <div class="nft-card__info">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
          <span style="font-size:0.7rem;background:#f0e8d8;color:#92671a;padding:2px 8px;border-radius:20px;font-weight:600;">${item.category_name ?? 'No Category'}</span>
          <span style="font-size:0.7rem;padding:2px 8px;border-radius:20px;font-weight:600;
            background:${isOut ? '#fde8e8' : '#e8fdf0'};color:${isOut ? '#c53030' : '#276749'};">
            ${isOut ? 'Out of Stock' : 'Available'}
          </span>
        </div>
        <div class="nft-card__name">${item.item_name}</div>
        <div class="nft-card__sub">${item.description ?? '-'}</div>
        <div class="nft-card__meta">Shop: ${item.shop_name ?? '—'} · Stock: ${item.stock_quantity}</div>
      </div>
      <div class="nft-card__right">
        <div class="nft-card__price">฿${price}</div>
        <button data-edit-id="${item.stock_id}" style="
          padding:6px 16px;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;
          background:#7c3aed;color:#fff;border:none;">Edit</button>
        <button data-delete-id="${item.stock_id}" data-delete-name="${item.item_name}" style="
          padding:6px 16px;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;
          background:#fff;color:#e53e3e;border:1.5px solid #e53e3e;">Delete</button>
      </div>
    </div>`;
}

function getFiltered() {
  let items = [..._all];
  if (_search) {
    const q = _search.toLowerCase();
    items = items.filter(s => s.item_name?.toLowerCase().includes(q) || s.shop_name?.toLowerCase().includes(q));
  }
  if (_sort === 'name') items.sort((a, b) => a.item_name.localeCompare(b.item_name));
  if (_sort === 'price-asc') items.sort((a, b) => a.price - b.price);
  if (_sort === 'price-desc') items.sort((a, b) => b.price - a.price);
  if (_sort === 'qty-asc') items.sort((a, b) => a.stock_quantity - b.stock_quantity);
  return items;
}

function render() {
  const list = document.getElementById('nft-list');
  if (!list) return;

  const items = getFiltered();

  const totalEl = document.getElementById('nft-stat-total');
  const availEl = document.getElementById('nft-stat-available');
  const outEl   = document.getElementById('nft-stat-out');
  if (totalEl) totalEl.textContent = _all.length;
  if (availEl) availEl.textContent = _all.filter(s => s.stock_quantity > 0 && s.stock_status !== 'out_of_stock').length;
  if (outEl)   outEl.textContent   = _all.filter(s => s.stock_quantity <= 0 || s.stock_status === 'out_of_stock').length;

  if (!items.length) {
    list.innerHTML = `<p class="nft-empty">🖼️<br>No found.</p>`;
    return;
  }

  list.innerHTML = items.map(nftRowHTML).join('');

  list.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.editId));
  });
  list.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.deleteId, btn.dataset.deleteName));
  });
}

// ── Modal ──────────────────────────────────────────────────────────────────

function resetImagePreview() {
  const preview = document.getElementById('nft-img-preview');
  const resultEl = document.getElementById('nft-upload-result');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (resultEl) resultEl.textContent = '';
  _selectedFile = null;
}

function openModal() {
  _editId = null;
  document.getElementById('nft-form')?.reset();
  resetImagePreview();
  document.getElementById('nft-modal-title').textContent = 'Add New';
  document.getElementById('nft-modal-save').textContent = 'Add ';
  document.getElementById('nft-modal').style.display = 'flex';
}

function openEditModal(stockId) {
  const item = _all.find(s => String(s.stock_id) === String(stockId));
  if (!item) return;

  _editId = stockId;
  resetImagePreview();

  document.getElementById('nft-modal-title').textContent = 'Edit';
  document.getElementById('nft-modal-save').textContent = 'Save Changes';
  document.getElementById('nf-item-name').value   = item.item_name ?? '';
  document.getElementById('nf-category').value    = item.category_id ?? '';
  document.getElementById('nf-price').value       = item.price ?? '';
  document.getElementById('nf-quantity').value    = item.stock_quantity ?? '';
  document.getElementById('nf-description').value = item.description ?? '';
  document.getElementById('nf-status').value      = item.stock_status ?? 'available';

  if (item.url) {
    const preview = document.getElementById('nft-img-preview');
    const resultEl = document.getElementById('nft-upload-result');
    if (preview) { preview.src = item.url; preview.style.display = 'block'; }
    if (resultEl) resultEl.textContent = 'Current image exists (upload new to replace)';
  }

  document.getElementById('nft-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('nft-modal').style.display = 'none';
  _editId = null;
  _selectedFile = null;
}

function openDeleteModal(stockId, name) {
  _deleteId = stockId;
  const nameEl = document.getElementById('nft-delete-modal-name');
  if (nameEl) nameEl.textContent = `"${name}" will be permanently removed from the system.`;
  document.getElementById('nft-delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
  document.getElementById('nft-delete-modal').style.display = 'none';
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
  const saveBtn  = document.getElementById('nft-modal-save');
  const resultEl = document.getElementById('nft-upload-result');
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
      seller_id: 'b0ff6afd-b87a-495b-9506-48f3a9c379e5',
      category_id:    _wallpaperCatId,
      item_name:      document.getElementById('nf-item-name').value.trim(),
      description:    document.getElementById('nf-description').value.trim(),
      price:          document.getElementById('nf-price').value,
      stock_quantity: document.getElementById('nf-quantity').value,
      item_type:      'nft',
      stock_status:   document.getElementById('nf-status').value,
      url,
    };

    if (_editId) {
      await Stock.update(_editId, body);
    } else {
      await Stock.create(body);
    }

    _all = _wallpaperCatId ? (await Stock.getByCategory(_wallpaperCatId)) ?? [] : [];
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
  const btn = document.getElementById('nft-delete-confirm');
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

export const ManageNFT = {
  async init() {
    _search = '';
    _sort = '';
    _editId = null;
    _deleteId = null;
    _selectedFile = null;
    _wallpaperCatId = null;

    const list = document.getElementById('nft-list');

    try {
      const cats = await Category.getAll();
      const wallpaperCat = (cats ?? []).find(c => c.name?.toLowerCase().includes('wallpaper'));

      if (wallpaperCat) {
        _wallpaperCatId = String(wallpaperCat.category_id);
        _all = (await Stock.getByCategory(_wallpaperCatId)) ?? [];
      } else {
        _all = [];
      }

      render();

    } catch (err) {
      console.error('[ManageNFT]', err);
      if (list) list.innerHTML = `<p class="nft-empty">Failed to load data</p>`;
    }

    document.getElementById('nft-add-btn')?.addEventListener('click', openModal);
    document.getElementById('nft-modal-cancel')?.addEventListener('click', closeModal);
    document.getElementById('nft-form')?.addEventListener('submit', handleSubmit);
    document.getElementById('nft-delete-cancel')?.addEventListener('click', closeDeleteModal);
    document.getElementById('nft-delete-confirm')?.addEventListener('click', handleDelete);

    document.getElementById('nft-modal')?.addEventListener('click', e => {
      if (e.target.id === 'nft-modal') closeModal();
    });
    document.getElementById('nft-delete-modal')?.addEventListener('click', e => {
      if (e.target.id === 'nft-delete-modal') closeDeleteModal();
    });

    document.getElementById('nf-image')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      _selectedFile = file;
      const preview = document.getElementById('nft-img-preview');
      const reader = new FileReader();
      reader.onload = ev => {
        if (preview) { preview.src = ev.target.result; preview.style.display = 'block'; }
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('nft-search')?.addEventListener('input', e => {
      _search = e.target.value;
      render();
    });
    document.getElementById('nft-sort')?.addEventListener('change', e => {
      _sort = e.target.value;
      render();
    });
  },
};
