// admin.js — Panel admin untuk manajemen pesanan Toko Teh
let orders = [];
let filteredOrders = [];
let currentFilter = 'all';
let searchQuery = '';

// Status pesanan dan badge/warnanya
const STATUS = {
  PENDING: { id: 'pending', label: 'Menunggu', class: 'badge-pending' },
  PROCESS: { id: 'process', label: 'Diproses', class: 'badge-process' },
  DELIVERY: { id: 'delivery', label: 'Dikirim', class: 'badge-delivery' },
  COMPLETE: { id: 'complete', label: 'Selesai', class: 'badge-complete' },
  CANCEL: { id: 'cancel', label: 'Batal', class: 'badge-cancel' }
};

// Format currency ke Rupiah
function formatRupiah(amount) {
  return `Rp${Number(amount).toLocaleString('id-ID')}`;
}

// Format tanggal ke lokal Indonesia
function formatDate(date) {
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Render badge status dengan warna yang sesuai
function renderStatusBadge(status) {
  const statusInfo = STATUS[status.toUpperCase()] || STATUS.PENDING;
  return `<span class="badge ${statusInfo.class}">${statusInfo.label}</span>`;
}

// Render tombol aksi berdasarkan status
function renderActionButtons(order) {
  const { id, status } = order;
  let buttons = [];

  switch(status.toLowerCase()) {
    case 'pending':
      buttons = [
        `<button class="btn btn-sm btn-primary" onclick="updateStatus(${id}, 'process')">Proses</button>`,
        `<button class="btn btn-sm btn-danger" onclick="updateStatus(${id}, 'cancel')">Batalkan</button>`
      ];
      break;
    case 'process':
      if (order.takeMode === 'delivery') {
        buttons = [
          `<button class="btn btn-sm btn-primary" onclick="updateStatus(${id}, 'delivery')">Kirim</button>`
        ];
      } else {
        buttons = [
          `<button class="btn btn-sm btn-success" onclick="updateStatus(${id}, 'complete')">Selesai</button>`
        ];
      }
      break;
    case 'delivery':
      buttons = [
        `<button class="btn btn-sm btn-success" onclick="updateStatus(${id}, 'complete')">Selesai</button>`
      ];
      break;
    case 'complete':
      buttons = [`<button class="btn btn-sm" disabled>Selesai</button>`];
      break;
    case 'cancel':
      buttons = [`<button class="btn btn-sm" disabled>Dibatalkan</button>`];
      break;
  }

  return `<div class="action-buttons">${buttons.join('')}</div>`;
}

// Render satu baris pesanan
function renderOrderRow(order) {
  const {
    id,
    date,
    items,
    total,
    takeMode,
    address,
    status,
    customerName,
    paymentMethod
  } = order;

  const itemsList = items.map(i => `${i.name} (${formatRupiah(i.price)})`).join('<br>');
  const pickup = takeMode === 'delivery' 
    ? `Delivery ke:<br><strong>${address}</strong>` 
    : 'Ambil di tempat';
  
  const paymentLabel = paymentMethod === 'qris' ? 'QRIS' : 'WhatsApp';

  return `
    <tr data-id="${id}">
      <td>${formatDate(date)}</td>
      <td><strong>${customerName || '-'}</strong></td>
      <td>${itemsList}</td>
      <td>${formatRupiah(total)}</td>
      <td>${paymentLabel}</td>
      <td>${pickup}</td>
      <td>${renderStatusBadge(status)}</td>
      <td>${renderActionButtons(order)}</td>
    </tr>
  `;
}

// Update statistik di cards
function updateStats() {
  const today = new Date().toDateString();
  
  const stats = orders.reduce((acc, order) => {
    const orderDate = new Date(order.date).toDateString();
    if (orderDate === today) {
      acc.totalToday++;
      if (order.status === 'complete') acc.completedToday++;
    }
    if (order.status === 'pending' || order.status === 'process') {
      acc.needAction++;
    }
    if (order.status === 'delivery') {
      acc.inDelivery++;
    }
    return acc;
  }, {
    totalToday: 0,
    needAction: 0,
    inDelivery: 0,
    completedToday: 0
  });

  document.getElementById('total-today').textContent = stats.totalToday;
  document.getElementById('need-action').textContent = stats.needAction;
  document.getElementById('in-delivery').textContent = stats.inDelivery;
  document.getElementById('completed-today').textContent = stats.completedToday;
}

// Filter pesanan berdasarkan status
function filterStatus(status) {
  currentFilter = status;
  applyFilters();
}

// Filter pesanan berdasarkan pencarian
function filterOrders(query) {
  searchQuery = query.toLowerCase();
  applyFilters();
}

// Terapkan filter status dan pencarian
function applyFilters() {
  filteredOrders = orders.filter(order => {
    const matchesStatus = currentFilter === 'all' || order.status === currentFilter;
    const matchesSearch = !searchQuery || 
      order.items.some(item => item.name.toLowerCase().includes(searchQuery)) ||
      (order.address && order.address.toLowerCase().includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  renderOrders();
}

// Render tabel pesanan dengan data yang sudah difilter
function renderOrders() {
  const tbody = document.getElementById('orders-table');
  if (!tbody) return;

  tbody.innerHTML = filteredOrders.length 
    ? filteredOrders.map(renderOrderRow).join('')
    : '<tr><td colspan="6" style="text-align:center;padding:2rem;">Tidak ada pesanan yang sesuai filter</td></tr>';
}

// Update status pesanan
function updateStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  if (newStatus === 'cancel' && !confirm('Yakin ingin membatalkan pesanan ini?')) {
    return;
  }

  order.status = newStatus;
  
  // In a real app, you'd save to backend here
  localStorage.setItem('orders', JSON.stringify(orders));
  
  applyFilters();
  updateStats();
}

// Muat pesanan dari storage (contoh data jika kosong)
function loadOrders() {
  try {
    orders = JSON.parse(localStorage.getItem('orders')) || getSampleOrders();
    filteredOrders = [...orders];
    renderOrders();
    updateStats();
  } catch (err) {
    console.error('Error loading orders:', err);
    orders = getSampleOrders();
  }
}

// Generate contoh pesanan untuk demo
function getSampleOrders() {
  return [
    {
      id: 1,
      date: new Date().toISOString(),
      items: [
        { name: 'Teh Hijau Premium', price: 35000 },
        { name: 'Teh Hitam Asli', price: 30000 }
      ],
      total: 65000,
      takeMode: 'pickup',
      status: 'pending'
    },
    {
      id: 2,
      date: new Date(Date.now() - 3600000).toISOString(),
      items: [
        { name: 'Teh Melati Wangi', price: 40000 }
      ],
      total: 50000, // with delivery
      takeMode: 'delivery',
      address: 'Jl. Contoh No. 123, Karawang',
      status: 'delivery'
    },
    {
      id: 3,
      date: new Date(Date.now() - 7200000).toISOString(),
      items: [
        { name: 'Teh Hitam Asli', price: 30000 }
      ],
      total: 30000,
      takeMode: 'pickup',
      status: 'complete'
    }
  ];
}

// Auto-refresh setiap 30 detik
function startAutoRefresh() {
  setInterval(refreshOrders, 30000);
}

// Refresh data pesanan
function refreshOrders() {
  loadOrders();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  startAutoRefresh();
});