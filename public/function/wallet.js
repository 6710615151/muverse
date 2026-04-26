import { Wallet, Stock, Order } from './api.js';


export const WalletFlow = {

    userId: localStorage.getItem('user_id'),
    selectedMethod: 'WALLET',


    init: async () => {
        console.log("Wallet Flow Starting...");

        Array.from(document.body.children)
            .find(el => el.id === 'walletModal')?.remove();

        const modal = document.getElementById('walletModal');
        if (modal) document.body.appendChild(modal);

        WalletFlow.loadPaymentMethods();
        document.getElementById('btn-add-payment').addEventListener('click', WalletFlow.addPaymentMethod);
        WalletFlow.setupEvents();

        await WalletFlow.loadBalance();
        await WalletFlow.loadHistory();
    },


    //แสดงยอดเงิน
    loadBalance: async () => {
        console.log("Loading balance...");
        const balanceData = await Wallet.getBalance(WalletFlow.userId);
        const balanceElement = document.getElementById('wallet-balance-amount');


        balanceElement.innerText = Number(balanceData.balance).toLocaleString('en-US', { minimumFractionDigits: 2 });
    },

    //ประวัติการทำรายการ
    loadHistory: async () => {
        const recordsData = await Wallet.getRecords(WalletFlow.userId);
        const listElement = document.getElementById('transaction-list');
        const emptyEl = document.getElementById('transaction-empty');


        listElement.querySelectorAll('.transaction-item').forEach(el => el.remove());

        if (recordsData.length === 0) {
            emptyEl.style.display = '';
            return;
        }
        emptyEl.style.display = 'none';

        recordsData.forEach(record => {
            const isIncome = record.payment_type === 'DEPOSIT' || record.payment_type === 'INCOME';
            const amountSign = isIncome ? '+' : '-';
            const amountClass = isIncome ? 'income' : 'expense';
            const itemHtml = `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <span class="transaction-type">${record.payment_type}</span>
                        <span class="transaction-date">${new Date(record.created_at).toLocaleString()}</span>
                    </div>
                    <span class="transaction-amount ${amountClass}">${amountSign}฿${Number(record.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
            `;
            listElement.insertAdjacentHTML('beforeend', itemHtml);
        });
    },

    //แสดงช่องทางการชำระเงินที่บันทึก (หลอก)
    loadPaymentMethods: () => {
        const stored = localStorage.getItem('muverse_payments');
        let methods = stored ? JSON.parse(stored) : null;

        if (!methods) {
            methods = [{ id: 'WALLET', name: 'MU-Verse Wallet' }];
            localStorage.setItem('muverse_payments', JSON.stringify(methods));
        }

        const list = document.getElementById('payment-method-list');

        list.style.cssText = "position:relative;";

        const selected = methods.find(m => m.id === WalletFlow.selectedMethod) || methods[0];
        let dropdownOpen = false;

        list.innerHTML = `
            <div id="pm-selector" style="position:relative;">
                <div id="pm-trigger" style="
                    display:flex;align-items:center;justify-content:space-between;
                    padding:10px 14px;border-radius:10px;cursor:pointer;
                    border:2px solid #c084fc;background:rgba(192,132,252,0.15);
                    color:#e2e8f0;font-size:0.9rem;font-weight:500;
                    user-select:none;
                ">
                    <span>${selected.name}</span>
                    <span id="pm-arrow" style="transition:transform 0.2s;font-size:0.75rem;color:#c084fc;">▼</span>
                </div>
                <div id="pm-dropdown" style="
                    display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;
                    background:#1e1b2e;border:1.5px solid rgba(192,132,252,0.4);
                    border-radius:10px;overflow:hidden;z-index:100;
                    max-height:160px;overflow-y:auto;
                ">
                    ${methods.map(m => `
                        <div class="pm-option" data-id="${m.id}" style="
                            display:flex;align-items:center;justify-content:space-between;
                            padding:10px 14px;cursor:pointer;
                            background:${m.id === WalletFlow.selectedMethod ? 'rgba(192,132,252,0.2)' : 'transparent'};
                            transition:background 0.15s;
                        ">
                            <span style="color:#e2e8f0;font-size:0.9rem;">${m.name}</span>
                            <div style="display:flex;align-items:center;gap:8px;">
                                ${m.id === WalletFlow.selectedMethod ? '<span style="color:#c084fc;font-weight:700;">✓</span>' : ''}
                                ${m.id !== 'WALLET' ? `<button class="btn-remove-payment" data-id="${m.id}" style="
                                    background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);
                                    color:#f87171;border-radius:6px;width:22px;height:22px;cursor:pointer;
                                    font-size:0.7rem;padding:0;line-height:1;
                                ">✕</button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const trigger  = list.querySelector('#pm-trigger');
        const dropdown = list.querySelector('#pm-dropdown');
        const arrow    = list.querySelector('#pm-arrow');

        trigger.addEventListener('click', () => {
            dropdownOpen = !dropdownOpen;
            dropdown.style.display = dropdownOpen ? 'block' : 'none';
            arrow.style.transform  = dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        });

        document.addEventListener('click', (e) => {
            if (!list.contains(e.target)) {
                dropdownOpen = false;
                dropdown.style.display = 'none';
                arrow.style.transform  = 'rotate(0deg)';
            }
        }, { once: true });

        list.querySelectorAll('.pm-option').forEach(el => {
            el.addEventListener('mouseenter', () => { if (el.dataset.id !== WalletFlow.selectedMethod) el.style.background = 'rgba(255,255,255,0.07)'; });
            el.addEventListener('mouseleave', () => { if (el.dataset.id !== WalletFlow.selectedMethod) el.style.background = 'transparent'; });
            el.addEventListener('click', () => {
                WalletFlow.selectedMethod = el.dataset.id;
                WalletFlow.loadPaymentMethods();
            });
        });

        list.querySelectorAll('.payment-method-item').forEach(el => {
            el.addEventListener('click', () => {
                WalletFlow.selectedMethod = el.dataset.id;
                WalletFlow.loadPaymentMethods();
            });
        });

        list.querySelectorAll('.btn-remove-payment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                WalletFlow.removePaymentMethod(btn.dataset.id);
            });
        });
    },

    showModal: (title, label, inputType = 'text', titleColor = null) => {
        return new Promise((resolve) => {
            const overlay = document.getElementById('walletModal');
            const titleEl = overlay.querySelector('#walletModalTitle');
            titleEl.textContent = title;
            if (titleColor) titleEl.style.color = titleColor;
            overlay.querySelector('#walletModalLabel').textContent = label;

            const input = overlay.querySelector('#walletModalInput');
            input.type = inputType;
            input.value = '';

            overlay.classList.add('active');
            input.focus();

            const btnConfirm = overlay.querySelector('#walletModalConfirm');
            const btnCancel  = overlay.querySelector('#walletModalCancel');

            const close = (value) => {
                overlay.classList.remove('active');
                btnConfirm.removeEventListener('click', onConfirm);
                btnCancel.removeEventListener('click', onCancel);
                overlay.removeEventListener('click', onOverlay);
                input.removeEventListener('keydown', onKey);
                resolve(value);
            };

            const onConfirm = () => close(input.value);
            const onCancel  = () => close(null);
            const onOverlay = (e) => { if (e.target === overlay) close(null); };
            const onKey     = (e) => {
                if (e.key === 'Enter') close(input.value);
                if (e.key === 'Escape') close(null);
            };

            btnConfirm.addEventListener('click', onConfirm);
            btnCancel.addEventListener('click', onCancel);
            overlay.addEventListener('click', onOverlay);
            input.addEventListener('keydown', onKey);
        });
    },

    deposit: async () => {
        const amountStr = await WalletFlow.showModal('Deposit', 'Amount (฿)', 'number', '#eeb55f');
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert("Wrong number, please try again.");
            return;
        }

        try {
            await Wallet.topup({
                user_id: WalletFlow.userId,
                amount,
                payment_method: WalletFlow.selectedMethod
            });
            alert("Deposit successful!");
            await WalletFlow.loadBalance();
            await WalletFlow.loadHistory();
        } catch (err) {
            alert("Deposit failed: " + err.message);
        }
    },

    withdraw: async () => {
        const amountStr = await WalletFlow.showModal('Withdraw', 'Amount (฿)', 'number', '#eeb55f');
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert("Wrong number, please try again.");
            return;
        }

        try {
            await Wallet.withdraw({
                user_id: WalletFlow.userId,
                amount,
                payment_method: WalletFlow.selectedMethod
            });
            alert("Withdraw successful!");
            await WalletFlow.loadBalance();
            await WalletFlow.loadHistory();
        } catch (err) {
            alert("Withdraw failed: " + err.message);
        }
    },

    addPaymentMethod: async () => {
        const provider = await WalletFlow.showModal('Add Payment Method', 'Provider name (e.g. KBank, TrueMoney)', 'text', '#eeb55f');
        if (!provider || !provider.trim()) return;

        const stored = localStorage.getItem('muverse_payments');
        const methods = stored ? JSON.parse(stored) : [{ id: 'WALLET', name: 'MU-Verse Wallet' }];

        const id = provider.trim().toUpperCase().replace(/\s+/g, '_');

        if (methods.find(m => m.id === id)) {
            alert("ช่องทางนี้มีอยู่แล้วครับ");
            return;
        }

        methods.push({ id, name: provider.trim() });
        localStorage.setItem('muverse_payments', JSON.stringify(methods));
        WalletFlow.loadPaymentMethods();
    },

    removePaymentMethod: (id) => {
        const stored = localStorage.getItem('muverse_payments');
        const methods = stored ? JSON.parse(stored) : [];

        const updated = methods.filter(m => m.id !== id);
        localStorage.setItem('muverse_payments', JSON.stringify(updated));

        if (WalletFlow.selectedMethod === id) {
            WalletFlow.selectedMethod = 'WALLET';
        }

        WalletFlow.loadPaymentMethods();
    },

    setupEvents: () => {
        document.getElementById('btn-deposit').addEventListener('click', WalletFlow.deposit);
        document.getElementById('btn-withdraw').addEventListener('click', WalletFlow.withdraw);
    }
}
