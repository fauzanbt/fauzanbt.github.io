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
  // optional: open WhatsApp with order summary
  const pesan = cart.map(i => `${i.name} (Rp${Number(i.price).toLocaleString('id-ID')})`).join('%0A');
  const waUrl = `https://wa.me/6281234567890?text=Halo%20saya%20ingin%20memesan:%0A${encodeURIComponent(pesan)}%0ATotal:%20Rp${total.toLocaleString('id-ID')}`;
  // open WA in new tab and then clear cart
  window.open(waUrl, '_blank');
  cart = [];
  renderCart();
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
