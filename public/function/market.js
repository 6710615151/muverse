import { Stock, Category, seller as SellerAPI, Wallet } from "./api.js";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const IMG_NUMS = ['1', '2', '3', '4', '5', '6'];

function imgNum(id) {
  return IMG_NUMS[(Number(id) || 0) % IMG_NUMS.length];
}

function productCardHTML(stock) {
  const num = imgNum(stock.stock_id);
  const isOut = stock.stock_quantity <= 0 || stock.stock_status === 'out_of_stock';
  const price = Number(stock.price).toLocaleString('th-TH', { minimumFractionDigits: 0 });
  const shopName = stock.shop_name ?? ` #${stock.seller_id}`;
  const rating = stock.rating ? `⭐${stock.rating}` : '';
  const isNew = stock.stock_status === 'new';

  return `
    <div class="product-card" data-stock-id="${stock.stock_id}" style="display: flex;
  flex-direction: column;
  height: 400px;">
      <div class="product-card__img">
        ${stock.url
      ? `<img src="${stock.url}" alt="${stock.item_name}" loading="lazy" style="border-radius: 7px;" onerror="this.style.display='none'">`
      : `<div class="product-card__img-placeholder product-card__img--${num}"></div>`}
        ${isOut ? `<span class="product-card__tag">Out</span>` : ''}
        ${isNew ? `<span class="product-card__tag product-card__tag--new">New</span>` : ''}

      </div>
      <div class="product-card__body">
        
        <h3 class="product-card__name" style="font-size: 1.1rem; font-weight: 400;margin-bottom: 3px;">${stock.item_name}</h3>
        <p class="product-card__brand" style="font-size:0.8rem;">
          <a href="#" class="shop-link"
            data-seller-id="${stock.seller_id}"
            data-seller-name="${shopName}" style="color: #ffffff94; text-decoration: none;">
            ${shopName}
          </a>
        </p>
        <!-- <p class="product-card__stars">${rating}</p> -->
        <div class="product-card__price-row" style="margin-top:4px;margin-bottom: 4px;">
          <span class="product-card__price" style="font-size: 1.2rem; font-weight: 600;">฿${price}</span>
        </div>
        <div class="service-card__footer" style="display: flex; justify-content: space-between; align-items: flex-end;">
          <span class="status-badge ${isOut ? 'status-badge--pending' : 'status-badge--confirmed'}" style="font-size: 0.85rem; font-color: #ffffffa4;margin-right: 100px;">
            ${isOut ? 'sold out' : `have ${stock.stock_quantity} piece${stock.stock_quantity > 1 ? 's' : ''}`}
          </span>
          ${!isOut
      ? `<button class="btn btn--primary btn--sm" data-order-stock="${stock.stock_id}">Buy</button>`
      : ''}
        </div>
      </div>
    </div>`;
}

function renderEmpty(msg = 'No products found') {
  return `<div style="grid-column:1/-1;padding:80px;text-align:center;color:var(--clr-text-muted)">
    <div style="padding:10px"><span style="font-size: 2rem;color:#ffffff;margin-right: 2px;font-size:0.82rem;font-weight:500;letter-spacing:0.05em;
      text-transform:uppercase;margin-bottom:10px" class="fi fi-ts-search"></span></div>
    <p>${msg}</p>
  </div>`;
}

function renderError() {
  return `<div style="grid-column:1/-1;padding:80px;text-align:center;color:var(--clr-text-muted)">
    <p style="font-size:1.8rem;margin-bottom:10px">⚠️</p>
    <p>Failed to load data. Please try again.</p>
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

// ─── Product detail popup ─────────────────────────────────────────────────────

let _detailStock = null;

function openDetailPopup(stock) {
  _detailStock = stock;
  const isOut = stock.stock_quantity <= 0 || stock.stock_status === 'out_of_stock';
  const num = imgNum(stock.stock_id);
  const price = Number(stock.price).toLocaleString('th-TH', { minimumFractionDigits: 0 });
  const shopName = stock.shop_name ?? `Shop #${stock.seller_id}`;

  const imgEl = document.getElementById('detail-popup-img');
  if (imgEl) {
    imgEl.innerHTML = stock.url
      ? `<img src="${stock.url}" alt="${stock.item_name}" onerror="this.style.display='none'">`
      : `<div class="product-card__img-placeholder product-card__img--${num}" style="width:100%;height:100%"></div>`;
  }

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('detail-popup-brand', shopName);
  set('detail-popup-title', stock.item_name);
  set('detail-popup-stars', stock.rating ? `⭐ ${stock.rating}` : '');
  set('detail-popup-price', `฿${price}`);

  const badge = document.getElementById('detail-popup-badge');
  if (badge) {
    badge.textContent = isOut ? 'Out of stock' : `${stock.stock_quantity} in stock`;
    badge.className = `detail-popup__badge status-badge ${isOut ? 'status-badge--pending' : 'status-badge--confirmed'}`;
  }

  const orderBtn = document.getElementById('detail-popup-order-btn');
  if (orderBtn) orderBtn.disabled = isOut;

  document.getElementById('detail-overlay')?.classList.add('open');
  document.getElementById('detail-popup')?.classList.add('open');
}

function closeDetailPopup() {
  _detailStock = null;
  document.getElementById('detail-overlay')?.classList.remove('open');
  document.getElementById('detail-popup')?.classList.remove('open');
}

// ─── Order confirmation popup ─────────────────────────────────────────────────

let _pendingOrderStock = null;

function openOrderPopup(stock) {
  _pendingOrderStock = stock;
  const itemEl = document.getElementById('order-popup-item');
  const priceEl = document.getElementById('order-popup-price');
  if (itemEl) itemEl.textContent = stock.item_name;
  if (priceEl) priceEl.textContent = `฿${Number(stock.price).toLocaleString('th-TH')}`;
  document.getElementById('order-overlay')?.classList.add('open');
  document.getElementById('order-popup')?.classList.add('open');
}

function closeOrderPopup() {
  _pendingOrderStock = null;
  document.getElementById('order-overlay')?.classList.remove('open');
  document.getElementById('order-popup')?.classList.remove('open');
}

async function handleConfirmOrder(stock) {
  // Place order
  try {
    // Buyer's user ID
    const currentUserId = window.WalletFlow?.userId || localStorage.getItem('user_id');
    if (!currentUserId) {
        return alert("Please log in before placing an order");
    }

    // Verify seller user ID exists
    if (!stock.seller_user_id) {
        return alert("Error: Seller information not found");
    }

    // Call API
    console.log("Processing payment...", { customer: currentUserId, seller: stock.seller_user_id, price: stock.price });
    
    await Wallet.transfer({
        customer_id: currentUserId,         // buyer UUID
        amount: Number(stock.price),        // item price
        seller_id: stock.seller_user_id,    // seller UUID
        payment_method: "WALLET"
    });

    // 4. (Optional) Create order record in ORDERS table
    /* await Order.create({
        customer_id: currentUserId,
        seller_id: stock.seller_id,
        total_price: stock.price,
        order_status: "PAID"
    });
    */

    alert(`🎉 Order "${stock.item_name}" placed successfully!`);

    // 5. Close popup and update UI (reduce quantity, refresh balance)
    closeOrderPopup();
    if (window.WalletFlow && window.WalletFlow.loadBalance) window.WalletFlow.loadBalance();
    
    // Decrease product quantity by 1 locally
    stock.stock_quantity -= 1;
    await Stock.updateQuantity(stock.stock_id, 1);
    mktRender();

  } catch (err) {
    console.error("Order failed:", err);
    alert(`❌ Order failed: ${err.message || "Insufficient balance or system error"}`);
  }
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
      const [stocks, cats, sellers] = await Promise.all([Stock.getAll(), Category.getAll(), SellerAPI.getAllSeller()]);
      const sellerMap = Object.fromEntries((sellers ?? []).map(s => [String(s.seller_id), s.shop_name]));
      const sellerUserIdMap = Object.fromEntries((sellers ?? []).map(s => [String(s.seller_id), s.user_id]));
      _mktAll = (stocks ?? []).map(s => ({
        ...s,
        shop_name: sellerMap[String(s.seller_id)] ?? s.shop_name,
        seller_user_id: s.seller_user_id || sellerUserIdMap[String(s.seller_id)]
      }));

      if (tabs && cats?.length) {
        const extra = cats
          .map(c => `<button class="filter-tab" data-cat-id="${c.category_id}">${c.name}</button>`)
          .join('');
        tabs.innerHTML = `<button class="filter-tab active" data-cat-id="all">✦ All</button>${extra}`;

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

    // Detail popup bindings
    document.getElementById('detail-overlay')?.addEventListener('click', closeDetailPopup);
    document.getElementById('detail-close-btn')?.addEventListener('click', closeDetailPopup);
    document.getElementById('detail-popup-order-btn')?.addEventListener('click', () => {
      if (_detailStock) openOrderPopup(_detailStock);
    });

    // Order popup bindings
    document.getElementById('order-overlay')?.addEventListener('click', closeOrderPopup);
    document.getElementById('order-popup-cancel')?.addEventListener('click', closeOrderPopup);
    document.getElementById('order-popup-confirm')?.addEventListener('click', async () => {
      if (_pendingOrderStock) await handleConfirmOrder(_pendingOrderStock);
      closeOrderPopup();
    });

    // Grid click: order button → order popup | card click → detail popup
    document.getElementById('mkt-grid')?.addEventListener('click', e => {
      if (e.target.closest('.shop-link') || e.target.closest('.product-card__wish')) return;
      if (e.target.closest('[data-order-stock]')) {
        const stockId = e.target.closest('[data-order-stock]').dataset.orderStock;
        const stock = _mktAll.find(s => String(s.stock_id) === String(stockId));
        if (stock) openOrderPopup(stock);
        return;
      }
      const card = e.target.closest('[data-stock-id]');
      if (!card) return;
      const stock = _mktAll.find(s => String(s.stock_id) === String(card.dataset.stockId));
      if (stock) openDetailPopup(stock);
    });

    const filterSidebar = document.getElementById('filter-sidebar');
    const filterBackdrop = document.getElementById('filter-backdrop');

    function openFilter() {
      filterSidebar?.classList.add('open');
      filterBackdrop?.classList.add('open');
    }
    function closeFilter() {
      filterSidebar?.classList.remove('open');
      filterBackdrop?.classList.remove('open');
    }

    document.getElementById('filter-toggle-btn')?.addEventListener('click', () => {
      filterSidebar?.classList.contains('open') ? closeFilter() : openFilter();
    });
    document.getElementById('filter-close-btn')?.addEventListener('click', closeFilter);
    filterBackdrop?.addEventListener('click', closeFilter);
  }
};

// ─── Shop page ────────────────────────────────────────────────────────────────

let _shopAll = [];
let _shopSearch = '';
let _shopSort = '';
let _shopMaxPrice = 10000;
let _shopShowAvail = true;
let _shopShowOut = false;
let _shopDetailStock = null;
let _shopPendingOrderStock = null;

function shopFilter() {
  let items = [..._shopAll];

  if (_shopSearch) {
    const q = _shopSearch.toLowerCase();
    items = items.filter(s => s.item_name?.toLowerCase().includes(q));
  }

  items = items.filter(s => Number(s.price) <= _shopMaxPrice);

  items = items.filter(s => {
    const avail = s.stock_quantity > 0 && s.stock_status !== 'out_of_stock';
    if (_shopShowAvail && avail) return true;
    if (_shopShowOut && !avail) return true;
    return false;
  });

  if (_shopSort === 'price-asc') items.sort((a, b) => a.price - b.price);
  if (_shopSort === 'price-desc') items.sort((a, b) => b.price - a.price);
  if (_shopSort === 'name') items.sort((a, b) => a.item_name.localeCompare(b.item_name));

  return items;
}

function shopRender() {
  const grid = document.getElementById('shop-grid');
  const count = document.getElementById('shop-count');
  if (!grid) return;
  const items = shopFilter();
  if (count) count.textContent = items.length;
  grid.innerHTML = items.length ? items.map(productCardHTML).join('') : renderEmpty('No products in this shop');
}

function openShopDetailPopup(stock) {
  _shopDetailStock = stock;
  const isOut = stock.stock_quantity <= 0 || stock.stock_status === 'out_of_stock';
  const num = imgNum(stock.stock_id);
  const price = Number(stock.price).toLocaleString('th-TH', { minimumFractionDigits: 0 });

  const imgEl = document.getElementById('shop-detail-popup-img');
  if (imgEl) {
    imgEl.innerHTML = stock.url
      ? `<img src="${stock.url}" alt="${stock.item_name}" onerror="this.style.display='none'">`
      : `<div class="product-card__img-placeholder product-card__img--${num}" style="width:100%;height:100%"></div>`;
  }

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('shop-detail-popup-brand', stock.shop_name ?? '');
  set('shop-detail-popup-title', stock.item_name);
  set('shop-detail-popup-stars', stock.rating ? `⭐ ${stock.rating}` : '');
  set('shop-detail-popup-price', `฿${price}`);

  const badge = document.getElementById('shop-detail-popup-badge');
  if (badge) {
    badge.textContent = isOut ? 'Out of stock' : `${stock.stock_quantity} in stock`;
    badge.className = `detail-popup__badge status-badge ${isOut ? 'status-badge--pending' : 'status-badge--confirmed'}`;
  }

  const orderBtn = document.getElementById('shop-detail-popup-order-btn');
  if (orderBtn) orderBtn.disabled = isOut;

  document.getElementById('shop-detail-overlay')?.classList.add('open');
  document.getElementById('shop-detail-popup')?.classList.add('open');
}

function closeShopDetailPopup() {
  _shopDetailStock = null;
  document.getElementById('shop-detail-overlay')?.classList.remove('open');
  document.getElementById('shop-detail-popup')?.classList.remove('open');
}

function openShopOrderPopup(stock) {
  _shopPendingOrderStock = stock;
  const itemEl = document.getElementById('shop-order-popup-item');
  const priceEl = document.getElementById('shop-order-popup-price');
  if (itemEl) itemEl.textContent = stock.item_name;
  if (priceEl) priceEl.textContent = `฿${Number(stock.price).toLocaleString('th-TH')}`;
  document.getElementById('shop-order-overlay')?.classList.add('open');
  document.getElementById('shop-order-popup')?.classList.add('open');
}

function closeShopOrderPopup() {
  _shopPendingOrderStock = null;
  document.getElementById('shop-order-overlay')?.classList.remove('open');
  document.getElementById('shop-order-popup')?.classList.remove('open');
}

export const Shop = {
  async init() {
    _shopSearch = '';
    _shopSort = '';
    _shopMaxPrice = 10000;
    _shopShowAvail = true;
    _shopShowOut = false;

    const grid = document.getElementById('shop-grid');

    document.getElementById('shop-back-btn')?.addEventListener('click', () => window.Router?.navigate('market'));

    const sellerId = window._shopSellerId;
    if (!sellerId) {
      if (grid) grid.innerHTML = renderError();
      return;
    }

    try {
      const stocks = await Stock.getBySeller(sellerId);
      _shopAll = stocks ?? [];

      const shopName = _shopAll[0]?.shop_name && !_shopAll[0].shop_name.startsWith('http')
        ? _shopAll[0].shop_name
        : (window._shopSellerName && !window._shopSellerName.startsWith('http')
          ? window._shopSellerName
          : 'Shop');

      const nameEl = document.getElementById('shop-name');
      if (nameEl) nameEl.textContent = shopName;

      shopRender();
    } catch (err) {
      console.error('[Shop]', err);
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

    const priceRange = document.getElementById('shop-price-range');
    const priceDisplay = document.getElementById('shop-price-display');
    priceRange?.addEventListener('input', e => {
      _shopMaxPrice = Number(e.target.value);
      if (priceDisplay) priceDisplay.textContent = `฿${_shopMaxPrice.toLocaleString()}`;
      shopRender();
    });

    document.getElementById('shop-filter-available')?.addEventListener('change', e => {
      _shopShowAvail = e.target.checked;
      shopRender();
    });

    document.getElementById('shop-filter-outofstock')?.addEventListener('change', e => {
      _shopShowOut = e.target.checked;
      shopRender();
    });

    // Detail popup bindings
    document.getElementById('shop-detail-overlay')?.addEventListener('click', closeShopDetailPopup);
    document.getElementById('shop-detail-close-btn')?.addEventListener('click', closeShopDetailPopup);
    document.getElementById('shop-detail-popup-order-btn')?.addEventListener('click', () => {
      if (_shopDetailStock) openShopOrderPopup(_shopDetailStock);
    });

    // Order popup bindings
    document.getElementById('shop-order-overlay')?.addEventListener('click', closeShopOrderPopup);
    document.getElementById('shop-order-popup-cancel')?.addEventListener('click', closeShopOrderPopup);
    document.getElementById('shop-order-popup-confirm')?.addEventListener('click', async () => {
      if (_shopPendingOrderStock) await handleConfirmOrder(_shopPendingOrderStock);
      closeShopOrderPopup();
    });

    // Grid click: order button → order popup | card click → detail popup
    document.getElementById('shop-grid')?.addEventListener('click', e => {
      if (e.target.closest('[data-order-stock]')) {
        const stockId = e.target.closest('[data-order-stock]').dataset.orderStock;
        const stock = _shopAll.find(s => String(s.stock_id) === String(stockId));
        if (stock) openShopOrderPopup(stock);
        return;
      }
      const card = e.target.closest('[data-stock-id]');
      if (!card) return;
      const stock = _shopAll.find(s => String(s.stock_id) === String(card.dataset.stockId));
      if (stock) openShopDetailPopup(stock);
    });

    const filterSidebar = document.getElementById('shop-filter-sidebar');
    const filterBackdrop = document.getElementById('shop-filter-backdrop');

    function openFilter() {
      filterSidebar?.classList.add('open');
      filterBackdrop?.classList.add('open');
    }
    function closeFilter() {
      filterSidebar?.classList.remove('open');
      filterBackdrop?.classList.remove('open');
    }

    document.getElementById('shop-filter-toggle-btn')?.addEventListener('click', () => {
      filterSidebar?.classList.contains('open') ? closeFilter() : openFilter();
    });
    document.getElementById('shop-filter-close-btn')?.addEventListener('click', closeFilter);
    filterBackdrop?.addEventListener('click', closeFilter);
  }
};
