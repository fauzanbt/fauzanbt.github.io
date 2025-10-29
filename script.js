// script.js — simple cart management for Toko Teh Nusantara
let cart = [];

function tambahKeranjang(name, price) {
  // price expected as number
  cart.push({ name, price });
  renderCart();
}

function hapusItem(index) {
  if (index >= 0 && index < cart.length) {
    const item = cart[index];
    const konfirmasi = confirm(`Hapus "${item.name}" dari keranjang?`);
    if (!konfirmasi) return;
    cart.splice(index, 1);
    renderCart();
  }
}

function renderCart() {
  const list = document.getElementById('keranjang-list');
  const totalEl = document.getElementById('total');
  if (!list || !totalEl) return;
  list.innerHTML = '';
  let total = 0;
  cart.forEach((item, idx) => {
    total += Number(item.price) || 0;
    const li = document.createElement('li');
    li.className = 'cart-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    nameSpan.textContent = item.name;

    const priceSpan = document.createElement('span');
    priceSpan.className = 'item-price';
    priceSpan.textContent = `Rp${Number(item.price).toLocaleString('id-ID')}`;

    const btn = document.createElement('button');
    btn.className = 'remove-btn';
    btn.setAttribute('aria-label', 'Hapus item');
    btn.title = 'Hapus';
    btn.textContent = '×';
    btn.addEventListener('click', () => hapusItem(idx));

    li.appendChild(nameSpan);
    li.appendChild(priceSpan);
    li.appendChild(btn);
    list.appendChild(li);
  });

  totalEl.textContent = `Total: Rp${total.toLocaleString('id-ID')}`;
}

function checkout() {
  if (cart.length === 0) {
    alert('Keranjang kosong. Silakan tambahkan produk terlebih dahulu.');
    return;
  }
  const total = cart.reduce((s, it) => s + Number(it.price || 0), 0);
  // open payment modal to choose QRIS or WhatsApp
  openPaymentModal(total);
}

let pendingTotal = 0;
let baseTotal = 0;
const DELIVERY_FEE = 10000; // ganti sesuai kebutuhan
function updatePayAmountDisplay() {
  const amtEl = document.getElementById('pay-amount');
  const mode = document.querySelector('input[name="take-mode"]:checked')?.value || 'pickup';
  const address = document.getElementById('delivery-address')?.value || '';
  const fee = (mode === 'delivery') ? DELIVERY_FEE : 0;
  pendingTotal = Number(baseTotal || 0) + fee;

  if (amtEl) {
    if (fee > 0) {
      amtEl.textContent = `Total: Rp${Number(baseTotal).toLocaleString('id-ID')}  (+ Ongkir: Rp${fee.toLocaleString('id-ID')})  → Jumlah: Rp${pendingTotal.toLocaleString('id-ID')}`;
    } else {
      amtEl.textContent = `Total: Rp${Number(pendingTotal).toLocaleString('id-ID')}`;
    }
  }
}
function openPaymentModal(total) {
  baseTotal = Number(total || 0);
  // set default pendingTotal and update UI
  pendingTotal = baseTotal;

  const modal = document.getElementById('payment-modal');
  const amt = document.getElementById('pay-amount');
  if (amt) amt.textContent = `Total: Rp${Number(total).toLocaleString('id-ID')}`;

  // ensure radio defaults and hide address input initially
  const pickupRadio = document.querySelector('input[name="take-mode"][value="pickup"]');
  const deliveryRadio = document.querySelector('input[name="take-mode"][value="delivery"]');
  const addrWrap = document.getElementById('delivery-address-wrap');
  const addrInput = document.getElementById('delivery-address');
  
  // Set default to pickup and hide address input
  if (pickupRadio) pickupRadio.checked = true;
  if (addrWrap) addrWrap.style.display = 'none';
  if (addrInput) addrInput.value = '';
  
  // Add event listeners to radio buttons
  document.querySelectorAll('input[name="take-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (addrWrap) {
        addrWrap.style.display = e.target.value === 'delivery' ? 'block' : 'none';
      }
      updatePayAmountDisplay();
    });
  });

  // update display using helper
  updatePayAmountDisplay();

  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function validateOrder() {
  const customerName = document.getElementById('customer-name')?.value || '';
  const mode = document.querySelector('input[name="take-mode"]:checked')?.value || 'pickup';
  const address = document.getElementById('delivery-address')?.value || '';

  if (!customerName.trim()) {
    alert('Mohon masukkan nama Anda');
    return false;
  }

  if (mode === 'delivery' && !address.trim()) {
    alert('Mohon masukkan alamat pengiriman');
    return false;
  }

  return { customerName, mode, address };
}

function showQRIS() {
  const img = document.getElementById('qris-img');
  const preview = document.getElementById('qris-preview');
  if (!img || !preview) return;

  // Validate order details
  const orderDetails = validateOrder();
  if (!orderDetails) return;

  // Save order with customer details
  const { customerName, mode, address } = orderDetails;
  const total = pendingTotal || cart.reduce((s, it) => s + Number(it.price || 0), 0);
  const orderId = saveOrder(cart, total, mode, address, 'qris', customerName);

  // Attempt to load local file first (prefer qris.jpg); if missing generate EMV/QRIS payload and create QR.
  const localPath = 'img/qris.jpg';
  img.onload = () => {
    preview.style.display = 'block';
    
    // Clear cart after successful QRIS display
    cart = [];
    pendingTotal = 0;
    baseTotal = 0;
    renderCart();
  };
  img.onerror = () => {
    // Build EMV/QRIS payload using template and the pending total (client-side).
    const emv = buildEMVWithAmount(emvTemplate, pendingTotal || 0);


    // create temporary container for QR generator
    const tmp = document.createElement('div');
    tmp.style.position = 'absolute';
    tmp.style.left = '-9999px';
    document.body.appendChild(tmp);

  try {
      if (window.QRCode && emv) {
        // qrcode.min.js expects an element and options ({text, width, height})
        new QRCode(tmp, { text: emv, width: 300, height: 300 });
        const generatedImg = tmp.querySelector('img');
        if (generatedImg && generatedImg.src) {
          img.src = generatedImg.src;
        } else {
          const canvas = tmp.querySelector('canvas');
          if (canvas) img.src = canvas.toDataURL('image/png');
          else img.src = '';
        }
      } else {
        // Fallback to Google Chart API using the EMV payload (or a simple placeholder if emv missing)
        const payload = emv || `QRIS|AMOUNT:${Number(pendingTotal||0).toFixed(2)}`;
        const q = encodeURIComponent(payload);
        const size = 300;
        img.src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${q}`;
      }
    } catch (err) {
      const payload = emv || `QRIS|AMOUNT:${Number(pendingTotal||0).toFixed(2)}`;
      const q = encodeURIComponent(payload);
      const size = 300;
      img.src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${q}`;
    } finally {
      preview.style.display = 'block';
      if (tmp && tmp.parentNode) tmp.parentNode.removeChild(tmp);
    }
  };

  // start by setting local path; if it exists it will show, otherwise onerror will trigger client-side generation
  img.src = localPath;
}

// --- EMV/QRIS helper: build EMV payload with updated amount and CRC16 ---
// If you have a full EMV template string (without or with CRC), this function will replace or insert tag 54 (amount)
// and recompute the CRC (tag 63). Uses CRC-16/CCITT-FALSE.
const emvTemplate = `00020101021126570011ID.DANA.WWW011893600915325013193002092501319300303UMI51440014ID.CO.QRIS.WWW0215ID10254467066790303UMI5204654053033605802ID5905UZNBT6008Karawang61054135263047920`;

function buildEMVWithAmount(template, amountNumber) {
  if (!template) return null;
  // remove existing CRC (63..)
  let body = template;
  const crcTagIndex = body.indexOf('6304');
  if (crcTagIndex !== -1 && body.length >= crcTagIndex + 8) {
    body = body.slice(0, crcTagIndex); // remove crc tag and value
  }

  // format amount with 2 decimals, no thousands separator
  const amt = Number(amountNumber || 0).toFixed(2);

  // tag 54 handling: find '54' occurrence
  const tag54 = '54';
  const idx54 = body.indexOf(tag54);
  if (idx54 !== -1) {
    // read length (two chars) after tag
    const lenStr = body.substr(idx54 + 2, 2);
    const len = parseInt(lenStr, 10);
    if (!isNaN(len)) {
      const before = body.substr(0, idx54);
      const after = body.substr(idx54 + 4 + len);
      const newVal = amt;
      const newLen = String(newVal.length).padStart(2, '0');
      body = before + '54' + newLen + newVal + after;
    } else {
      // malformed length, just skip replacement
    }
  } else {
    // insert before tag '58' if present, else append
    const idx58 = body.indexOf('58');
    const insertion = '54' + String(amt.length).padStart(2, '0') + amt;
    if (idx58 !== -1) {
      body = body.slice(0, idx58) + insertion + body.slice(idx58);
    } else {
      body = body + insertion;
    }
  }

  // compute CRC16 on body + '6304'
  const withCrcTag = body + '6304';
  const crc = crc16_ccitt(withCrcTag);
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  const final = withCrcTag + crcHex;
  return final;
}

// CRC-16/CCITT-FALSE implementation
function crc16_ccitt(str) {
  // compute CRC over ASCII bytes of the input string
  const polynomial = 0x1021;
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) & 0xff) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = ((crc << 1) & 0xffff) ^ polynomial;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc & 0xffff;
}

// Save order to localStorage for admin panel
function saveOrder(items, total, takeMode, address = '', paymentMethod = 'whatsapp', customerName = '') {
  // Get existing orders or initialize
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem('orders')) || [];
  } catch (e) {
    orders = [];
  }

  // Create new order
  const order = {
    id: Date.now(), // use timestamp as ID
    date: new Date().toISOString(),
    customerName: customerName,
    items: items.map(i => ({ name: i.name, price: i.price })),
    total: total,
    takeMode: takeMode,
    address: address,
    status: 'pending',
    paymentMethod: paymentMethod
  };

  // Add to start of array (newest first)
  orders.unshift(order);
  
  // Save back to storage
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Return order ID for reference
  return order.id;
}

function payWithWhatsApp() {
  // Validate order details first
  const orderDetails = validateOrder();
  if (!orderDetails) return;

  const { customerName, mode, address } = orderDetails;
  const total = pendingTotal || cart.reduce((s, it) => s + Number(it.price || 0), 0);
  
  // Save order with customer details
  const orderId = saveOrder(cart, total, mode, address, 'whatsapp', customerName);

  const lines = [];
  lines.push(`Halo saya ingin memesan (Order #${orderId}):`);
  lines.push(`Nama: ${customerName}`);
  cart.forEach(i => lines.push(`${i.name} (Rp${Number(i.price).toLocaleString('id-ID')})`));
  lines.push(`Total: Rp${Number(total).toLocaleString('id-ID')}`);

  if (mode === 'delivery') {
    lines.push('Metode: Delivery');
    lines.push(`Alamat: ${address}`);
  } else {
    lines.push('Metode: Ambil di Tempat');
  }

  const message = lines.join('\n');
  const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
  cart = [];
  pendingTotal = 0;
  baseTotal = 0;
  renderCart();
  closePaymentModal();
}

function bukaWhatsApp() {
  // nomor contoh; ganti sesuai kebutuhan
  window.open('https://wa.me/6281234567890', '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  // Testimoni otomatis — init after DOM ready
  let idx = 0;
  const testi = document.querySelectorAll('.testi');
  if (testi.length > 0) {
    setInterval(() => {
      testi[idx].classList.remove('active');
      idx = (idx + 1) % testi.length;
      testi[idx].classList.add('active');
    }, 4000);
  }
  
  // shapes container (for animated shapes)
  if (!document.querySelector('.shapes-container')) {
    const sc = document.createElement('div');
    sc.className = 'shapes-container';
    document.body.appendChild(sc);
  }

  // Attach extra click handler to product buttons to spawn shapes
  const productButtons = document.querySelectorAll('.produk-card button');
  productButtons.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      // spawn a few shapes from the button to the 'Tentang Kami' nav link
      spawnShapes(ev.currentTarget, document.querySelector('a[href="index2.html"]'));
    });
  });
});

// spawnShapes: create N colored circles at source element, animate to target element
function spawnShapes(sourceEl, targetEl, count = 6) {
  if (!sourceEl || !targetEl) return;
  const container = document.querySelector('.shapes-container');
  if (!container) return;

  const srcRect = sourceEl.getBoundingClientRect();
  const tgtRect = targetEl.getBoundingClientRect();
  const startX = srcRect.left + srcRect.width/2 + window.scrollX;
  const startY = srcRect.top + srcRect.height/2 + window.scrollY;
  const endX = tgtRect.left + tgtRect.width/2 + window.scrollX;
  const endY = tgtRect.top + tgtRect.height/2 + window.scrollY;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'shape';
    // random color palette
    const colors = ['#F56565','#ED8936','#ECC94B','#48BB78','#4FD1C5','#63B3ED'];
    el.style.background = colors[i % colors.length];
    // small random offset so they don't overlap exactly
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    el.style.left = (startX + offsetX) + 'px';
    el.style.top = (startY + offsetY) + 'px';
    container.appendChild(el);

    // Force a reflow so transition will occur
    // compute translation vector
    const dx = endX - (startX + offsetX) + (Math.random() - 0.5) * 40; // slight randomness
    const dy = endY - (startY + offsetY) + (Math.random() - 0.5) * 40;

    // small stagger
    const delay = i * 60;
    setTimeout(() => {
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${0.6 + Math.random()*0.6})`;
      el.style.opacity = '1';
      // fade out shortly after arriving
      setTimeout(() => {
        el.classList.add('fade-out');
      }, 700);
      // remove after animation
      setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 1100 + delay);
    }, delay);
  }
}
