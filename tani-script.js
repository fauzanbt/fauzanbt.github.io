// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    mobileMenu.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    // Products data
    const products = [
        {
            name: "Beras Organik Premium",
            farmer: "Pak Suparman",
            price: "Rp 15.000/kg",
            image: "https://source.unsplash.com/400x300/?rice",
            description: "Beras organik berkualitas tinggi, ditanam dengan metode tradisional tanpa pestisida.",
            category: "beras"
        },
        {
            name: "Sayur Organik Box",
            farmer: "Bu Aminah",
            price: "Rp 50.000/box",
            image: "https://source.unsplash.com/400x300/?vegetables",
            description: "Paket sayuran segar organik, dipetik langsung dari kebun kami.",
            category: "sayuran"
        },
        {
            name: "Buah Lokal Segar",
            farmer: "Pak Rahman",
            price: "Rp 35.000/kg",
            image: "https://source.unsplash.com/400x300/?tropical-fruits",
            description: "Buah-buahan lokal segar langsung dari kebun petani.",
            category: "buah"
        },
        {
            name: "Kentang Dieng",
            farmer: "Pak Yusuf",
            price: "Rp 12.000/kg",
            image: "https://source.unsplash.com/400x300/?potato",
            description: "Kentang segar dari dataran tinggi Dieng.",
            category: "beras"
        },
        {
            name: "Tomat Cherry Organik",
            farmer: "Bu Aminah",
            price: "Rp 25.000/250g",
            image: "https://source.unsplash.com/400x300/?cherry-tomatoes",
            description: "Tomat cherry manis, cocok untuk salad.",
            category: "sayuran"
        },
        {
            name: "Mangga Harum Manis",
            farmer: "Pak Rahman",
            price: "Rp 45.000/kg",
            image: "https://source.unsplash.com/400x300/?mango",
            description: "Mangga manis segar langsung dari pohon.",
            category: "buah"
        }
    ];

    // Render products with filtering
    const productGrid = document.querySelector('.product-grid');
    const categoryTabs = document.querySelectorAll('.tab-btn');
    
    function renderProducts(category = 'semua') {
        if (!productGrid) return;
        
        productGrid.innerHTML = ''; // Clear existing products
        
        const filteredProducts = category === 'semua' 
            ? products 
            : products.filter(p => p.category === category);
            
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="farmer">Petani: ${product.farmer}</p>
                <p class="description">${product.description}</p>
                <p class="price">${product.price}</p>
                <button onclick="orderProduct('${product.name}')">Pesan Sekarang</button>
            `;
            productGrid.appendChild(productCard);
        });
    }
    
    // Initialize products
    renderProducts();
    
    // Add category filter functionality
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Filter products
            const category = tab.getAttribute('data-category');
            renderProducts(category);
        });
    });
    }

    // Farmer profiles data
    const farmers = [
        {
            name: "Pak Suparman",
            specialty: "Beras Organik",
            experience: "20 tahun",
            image: "https://source.unsplash.com/400x300/?farmer",
            story: "Telah bertani secara organik selama 20 tahun, menggunakan metode tradisional yang ramah lingkungan."
        },
        {
            name: "Bu Aminah",
            specialty: "Sayuran Organik",
            experience: "15 tahun",
            image: "https://source.unsplash.com/400x300/?farming-woman",
            story: "Mengembangkan kebun sayur organik dengan sistem pertanian berkelanjutan."
        },
        {
            name: "Pak Rahman",
            specialty: "Buah-buahan",
            experience: "25 tahun",
            image: "https://source.unsplash.com/400x300/?fruit-farmer",
            story: "Spesialis dalam budidaya buah lokal dengan teknik ramah lingkungan."
        }
    ];

    // Render farmer profiles
    const farmerStories = document.querySelector('.farmer-stories');
    if (farmerStories) {
        farmers.forEach(farmer => {
            const farmerCard = document.createElement('div');
            farmerCard.className = 'farmer-card';
            farmerCard.innerHTML = `
                <img src="${farmer.image}" alt="${farmer.name}">
                <h3>${farmer.name}</h3>
                <p class="specialty">Spesialisasi: ${farmer.specialty}</p>
                <p class="experience">Pengalaman: ${farmer.experience}</p>
                <p class="story">${farmer.story}</p>
            `;
            farmerStories.appendChild(farmerCard);
        });
    }
});

// Function to handle product orders
function orderProduct(productName) {
    const message = `Halo, saya tertarik dengan produk ${productName}. Mohon informasi lebih lanjut.`;
    const whatsappLink = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
}

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Terima kasih! Pesan Anda telah kami terima. Kami akan segera menghubungi Anda.');
        contactForm.reset();
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});