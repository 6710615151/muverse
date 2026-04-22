import { Stock, Category } from "./api.js";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const IMG_NUMS = ['1', '2', '3', '4', '5', '6'];

function imgNum(id) {
  return IMG_NUMS[(Number(id) || 0) % IMG_NUMS.length];
}

function productCardHTML(stock) {
  const num = imgNum(stock.stock_id);
  const isOut = stock.stock_quantity <= 0 || stock.stock_status === 'out_of_stock';
  const price = Number(stock.price).toLocaleString('th-TH', { minimumFractionDigits: 0 });
  const shopName = stock.shop_name ?? `ร้าน #${stock.seller_id}`;
  const rating = stock.rating ? `⭐ ${stock.rating}` : '';
  const isNew = stock.stock_status === 'new';

  return `
    <div class="product-card" data-stock-id="${stock.stock_id}">
      <div class="product-card__img product-card__img--${num}">
        ${isOut  ? `<span class="product-card__tag">หมด</span>` : ''}
        ${isNew  ? `<span class="product-card__tag product-card__tag--new">ใหม่</span>` : ''}
        <button class="product-card__wish" title="ถูกใจ">♡</button>
      </div>
      <div class="product-card__body">
        <p class="product-card__brand">
          <a href="#" class="shop-link"
            data-seller-id="${stock.seller_id}"
            data-seller-name="${shopName}">${shopName}</a>
        </p>
        <h3 class="product-card__name">${stock.item_name}</h3>
        <p class="product-card__stars">${rating}</p>
        <div class="product-card__price-row">
          <span class="product-card__price">฿${price}</span>
        </div>
        <div class="service-card__footer">
          <span class="status-badge ${isOut ? 'status-badge--pending' : 'status-badge--confirmed'}">
            ${isOut ? 'หมดชั่วคราว' : `มี ${stock.stock_quantity} ชิ้น`}
          </span>
          ${!isOut
            ? `<button class="btn btn--primary btn--sm" data-order-stock="${stock.stock_id}">สั่งซื้อ</button>`
            : ''}
        </div>
      </div>
    </div>`;
}

function renderEmpty(msg = 'ไม่พบสินค้า') {
  return `<div style="grid-column:1/-1;padding:80px;text-align:center;color:var(--clr-text-muted)">
    <p style="font-size:1.8rem;margin-bottom:10px">🔍</p>
    <p>${msg}</p>
  </div>`;
}

function renderError() {
  return `<div style="grid-column:1/-1;padding:80px;text-align:center;color:var(--clr-text-muted)">
    <p style="font-size:1.8rem;margin-bottom:10px">⚠️</p>
    <p>โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p>
  </div>`;
}

function bindShopLinks(root) {
  root.querySelectorAll('.shop-link').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      window._shopSellerId = el.dataset.sellerId;
      window._shopSellerName = el.dataset.sellerName;
      window.Router?.navigate('shop');
    });
  });
}

// ─── Market page ──────────────────────────────────────────────────────────────

let _mktAll = [];
let _mktCatId = 'all';
let _mktSearch = '';
let _mktMaxPrice = 10000;
let _mktSort = '';
let _mktShowAvail = true;
let _mktShowOut = false;

function mktFilter() {
  let items = [..._mktAll];

  if (_mktCatId !== 'all') {
    items = items.filter(s => String(s.category_id) === _mktCatId);
  }

  if (_mktSearch) {
    const q = _mktSearch.toLowerCase();
    items = items.filter(s => s.item_name?.toLowerCase().includes(q));
  }

  items = items.filter(s => Number(s.price) <= _mktMaxPrice);

  items = items.filter(s => {
    const avail = s.stock_quantity > 0 && s.stock_status !== 'out_of_stock';
    if (_mktShowAvail && avail) return true;
    if (_mktShowOut && !avail) return true;
    return false;
  });

  if (_mktSort === 'price-asc') items.sort((a, b) => a.price - b.price);
  if (_mktSort === 'price-desc') items.sort((a, b) => b.price - a.price);
  if (_mktSort === 'name') items.sort((a, b) => a.item_name.localeCompare(b.item_name));

  return items;
}

function mktRender() {
  const grid = document.getElementById('mkt-grid');
  const count = document.getElementById('mkt-count');
  if (!grid) return;
  const items = mktFilter();
  if (count) count.textContent = items.length;
  grid.innerHTML = items.length ? items.map(productCardHTML).join('') : renderEmpty();
  bindShopLinks(grid);
}

export const Market = {
  async init() {
    _mktCatId = 'all';
    _mktSearch = '';
    _mktMaxPrice = 10000;
    _mktSort = '';
    _mktShowAvail = true;
    _mktShowOut = false;

    const grid = document.getElementById('mkt-grid');
    const tabs = document.getElementById('mkt-cat-tabs');

    try {
      const [stocks, cats] = await Promise.all([Stock.getAll(), Category.getAll()]);
      _mktAll = stocks ?? [];

      if (tabs && cats?.length) {
        const extra = cats
          .map(c => `<button class="filter-tab" data-cat-id="${c.category_id}">${c.name}</button>`)
          .join('');
        tabs.innerHTML = `<button class="filter-tab active" data-cat-id="all">✦ ทั้งหมด</button>${extra}`;

        tabs.querySelectorAll('.filter-tab').forEach(btn => {
          btn.addEventListener('click', () => {
            tabs.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _mktCatId = btn.dataset.catId;
            mktRender();
          });
        });
      }

      mktRender();
    } catch (err) {
      console.error('[Market]', err);
      if (grid) grid.innerHTML = renderError();
    }

    document.getElementById('mkt-search')?.addEventListener('input', e => {
      _mktSearch = e.target.value;
      mktRender();
    });

    document.getElementById('mkt-sort')?.addEventListener('change', e => {
      _mktSort = e.target.value;
      mktRender();
    });

    const priceRange = document.getElementById('mkt-price-range');
    const priceDisplay = document.getElementById('mkt-price-display');
    priceRange?.addEventListener('input', e => {
      _mktMaxPrice = Number(e.target.value);
      if (priceDisplay) priceDisplay.textContent = `฿${_mktMaxPrice.toLocaleString()}`;
      mktRender();
    });

    document.getElementById('mkt-filter-available')?.addEventListener('change', e => {
      _mktShowAvail = e.target.checked;
      mktRender();
    });

    document.getElementById('mkt-filter-outofstock')?.addEventListener('change', e => {
      _mktShowOut = e.target.checked;
      mktRender();
    });
  }
};

// ─── Shop page ────────────────────────────────────────────────────────────────

let _shopAll = [];
let _shopSearch = '';
let _shopSort = '';

function shopFilter() {
  let items = [..._shopAll];

  if (_shopSearch) {
    const q = _shopSearch.toLowerCase();
    items = items.filter(s => s.item_name?.toLowerCase().includes(q));
  }

  if (_shopSort === 'price-asc') items.sort((a, b) => a.price - b.price);
  if (_shopSort === 'price-desc') items.sort((a, b) => b.price - a.price);
  if (_shopSort === 'name') items.sort((a, b) => a.item_name.localeCompare(b.item_name));

  return items;
}

function shopRender() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  const items = shopFilter();
  grid.innerHTML = items.length
    ? items.map(productCardHTML).join('')
    : renderEmpty('ไม่มีสินค้าในร้านนี้');
}

export const Shop = {
  async init() {
    _shopSearch = '';
    _shopSort = '';

    const sellerId = window._shopSellerId;
    const sellerName = window._shopSellerName ?? `ร้าน #${sellerId}`;

    const nameEl = document.getElementById('shop-name');
    const avatarEl = document.getElementById('shop-avatar');
    const countEl = document.getElementById('shop-item-count');
    const backBtn = document.getElementById('shop-back-btn');

    if (nameEl) nameEl.textContent = sellerName;
    if (avatarEl) avatarEl.textContent = sellerName?.[0]?.toUpperCase() ?? '?';

    backBtn?.addEventListener('click', () => window.Router?.navigate('market'));

    if (!sellerId) {
      const grid = document.getElementById('shop-grid');
      if (grid) grid.innerHTML = renderError();
      return;
    }

    try {
      const stocks = await Stock.getBySeller(sellerId);
      _shopAll = stocks ?? [];

      if (countEl) countEl.textContent = `${_shopAll.length} รายการสินค้า`;

      const ratingEl = document.getElementById('shop-rating');
      if (ratingEl && _shopAll[0]?.rating) {
        ratingEl.textContent = `⭐ ${_shopAll[0].rating}`;
      }

      shopRender();
    } catch (err) {
      console.error('[Shop]', err);
      const grid = document.getElementById('shop-grid');
      if (grid) grid.innerHTML = renderError();
    }

    document.getElementById('shop-search')?.addEventListener('input', e => {
      _shopSearch = e.target.value;
      shopRender();
    });

    document.getElementById('shop-sort')?.addEventListener('change', e => {
      _shopSort = e.target.value;
      shopRender();
    });
  }
};
