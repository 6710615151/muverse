import { Wallet } from './api.js';


export const WalletFlow = {

    userId: "05f21317-d934-44c4-96a3-56fe6796968f",
    selectedMethod: 'WALLET',


    init: async () => {
        console.log("Wallet Flow Starting...");

        const oldModal = document.body.querySelector('#walletModal');
        if (oldModal) oldModal.remove();

        const modal = document.getElementById('walletModal');
        if (modal) document.body.appendChild(modal);
        await WalletFlow.loadBalance();
        await WalletFlow.loadHistory();
        WalletFlow.loadPaymentMethods();
        document.getElementById('btn-add-payment').addEventListener('click', WalletFlow.addPaymentMethod);
        WalletFlow.setupEvents();
    },

    //ฟังก์ชันสร้างหน้าต่างป๊อปอัป พวกกดตกลงยกเลิก 
    showModal: (title, label, placeholder, inputType = 'text') => {
        return new Promise((resolve) => {
            const overlay = document.getElementById('walletModal');

            document.getElementById('walletModalTitle').textContent = title;
            document.getElementById('walletModalLabel').textContent = label;

            const input = document.getElementById('walletModalInput');
            input.type = inputType;
            input.placeholder = placeholder;
            input.value = '';

            overlay.classList.add('active');
            input.focus(); //พร้อมกอก 

            const close = (value) => {
                overlay.classList.remove('active');


                btnConfirm.removeEventListener('click', onConfirm);
                btnCancel.removeEventListener('click', onCancel);
                overlay.removeEventListener('click', onOverlay);
                input.removeEventListener('keydown', onKey);

                resolve(value);
            };

            const onConfirm = () => close(input.value);
            const onCancel = () => close(null);
            const onOverlay = (e) => { if (e.target === overlay) close(null); };
            const onKey = (e) => {
                if (e.key === 'Enter') close(input.value);
                if (e.key === 'Escape') close(null);
            };

            const btnConfirm = document.getElementById('walletModalConfirm');
            const btnCancel = document.getElementById('walletModalCancel');
            btnConfirm.addEventListener('click', onConfirm);
            btnCancel.addEventListener('click', onCancel);
            overlay.addEventListener('click', onOverlay);
            input.addEventListener('keydown', onKey);
        });
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

        list.innerHTML = methods.map(m => `
            <div class="payment-method-item ${m.id === WalletFlow.selectedMethod ? 'active' : ''}" data-id="${m.id}">
                <span class="payment-method-name">${m.name}</span>
                <div class="payment-method-actions">
                    ${m.id === WalletFlow.selectedMethod ? '<span class="payment-method-check">&#10003;</span>' : ''}
                    ${m.id !== 'WALLET' ? `<button class="btn-remove-payment" data-id="${m.id}" title="ลบ">&#10005;</button>` : ''}
                </div>
            </div>
        `).join('');

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

    //ฟังก์ชันสำหรับการเพิ่มธนาคาร/ช่องทางใหม่ (หลอก)
    addPaymentMethod: async () => {

        const provider = await WalletFlow.showModal('Add Payment Method', 'Provider name', 'e.g. KBank, TrueMoney');
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

    //ฟังก์ชันสำหรับการลบธนาคาร/ช่องทาง (หลอก)
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
    
    //fuction สำหรับฝากเงิน ถอน
    setupEvents: () => {

        //ฝากเงิน
        const btnDeposit = document.getElementById('btn-deposit');
        btnDeposit.addEventListener('click', async () => {
            const amountStr = await WalletFlow.showModal('Deposit', 'Amount (฿)', '0.00', 'number');
            if (!amountStr) return;

            const amount = parseFloat(amountStr);

            if (isNaN(amount) || amount <= 0) {
                alert("Wrong number, please try again.");
                return;
            }

            try {
                await Wallet.topup({
                    user_id: WalletFlow.userId,
                    amount: amount,
                    payment_method: WalletFlow.selectedMethod
                });
                alert("Deposit successful!");
                await WalletFlow.loadBalance();
                await WalletFlow.loadHistory();
            } catch (error) {
                alert("Deposit failed: " + error.message);
            }
        });

        //ถอนเงิน
        const btnWithdraw = document.getElementById('btn-withdraw');
        btnWithdraw.addEventListener('click', async () => {
            const amountStr = await WalletFlow.showModal('Withdraw', 'Amount (฿)', '0.00', 'number');
            if (!amountStr) return;

            const amount = parseFloat(amountStr);
            if (isNaN(amount) || amount <= 0) {
                alert("Wrong number, please try again.");
                return;
            }

            try {
                await Wallet.withdraw({
                    user_id: WalletFlow.userId,
                    amount: amount,
                    payment_method: WalletFlow.selectedMethod
                });
                alert("Withdraw successful!");

                await WalletFlow.loadBalance();
                await WalletFlow.loadHistory();
            } catch (error) {
                alert("Withdraw failed: " + error.message);
            }
        });
    }
}