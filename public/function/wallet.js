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

        list.innerHTML = methods.map(m => {
            const isActive = m.id === WalletFlow.selectedMethod;
            return `
            <div class="payment-method-item ${isActive ? 'active' : ''}" data-id="${m.id}" style="
                display:flex; align-items:center; justify-content:space-between;
                padding:10px 14px; margin-bottom:8px; border-radius:10px; cursor:pointer;
                border:2px solid ${isActive ? '#c084fc' : 'rgba(255,255,255,0.1)'};
                background:${isActive ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.05)'};
                transition:all 0.2s;
            ">
                <span style="color:#e2e8f0;font-size:0.9rem;font-weight:500">${m.name}</span>
                <div style="display:flex;align-items:center;gap:8px">
                    ${isActive ? '<span style="color:#c084fc;font-size:1rem;font-weight:700">✓</span>' : ''}
                    ${m.id !== 'WALLET' ? `<button class="btn-remove-payment" data-id="${m.id}" title="ลบ" style="
                        background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);
                        color:#f87171;border-radius:6px;width:24px;height:24px;cursor:pointer;
                        font-size:0.75rem;display:flex;align-items:center;justify-content:center;
                        line-height:1;padding:0;
                    ">✕</button>` : ''}
                </div>
            </div>`;
        }).join('');

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
