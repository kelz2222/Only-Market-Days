const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

export function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop)
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = () => resolve(window.PaystackPop)
    script.onerror = () => reject(new Error('Failed to load Paystack'))
    document.body.appendChild(script)
  })
}

export async function initiatePayment({ email, amount, reference, metadata, onSuccess, onClose }) {
  const PaystackPop = await loadPaystack()
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount,
    ref: reference,
    metadata,
    callback: (response) => { if (onSuccess) onSuccess(response) },
    onClose: () => { if (onClose) onClose() },
  })
  handler.openIframe()
}

export function generateReference(orderNumber) {
  return `OMD-${orderNumber}-${Date.now()}`
}

export function formatNaira(kobo) {
  const naira = kobo / 100
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(naira)
}

export function calculateServiceFee(orderType, subtotalKobo) {
  if (orderType === 'wholesale') return 150000
  if (orderType === 'preorder') return 70000
  return 50000
}
