/* -------------------------------------------------------------
 * StyleXWear Collection Page Controller (collection.js)
 * ------------------------------------------------------------- */

// Global locale-independent price formatting helper
var formatPrice = window.formatPrice = window.formatPrice || function(val) {
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val;
  if (isNaN(num)) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

document.addEventListener('DOMContentLoaded', () => {
  try { initCollectionPage(); } catch (e) { console.error('Error in initCollectionPage:', e); }
  try { initCollectionMarquee(); } catch (e) { console.error('Error in initCollectionMarquee:', e); }
  try { initCollectionSortDropdown(); } catch (e) { console.error('Error in initCollectionSortDropdown:', e); }
  try { initCanvasBackground(); } catch (e) { console.error('Error in initCanvasBackground:', e); }
  try { initAnnouncementBar(); } catch (e) { console.error('Error in initAnnouncementBar:', e); }
  try { initDrawers(); } catch (e) { console.error('Error in initDrawers:', e); }
  try { updateCartUI(); } catch (e) { console.error('Error in updateCartUI:', e); }
  try { updateWishlistUI(); } catch (e) { console.error('Error in updateWishlistUI:', e); }
  try { initSearch(); } catch (e) { console.error('Error in initSearch:', e); }
  try { initMobileDrawerPanels(); } catch (e) { console.error('Error in initMobileDrawerPanels:', e); }

  // Zero-Delay Realtime Cloud Catalog updates
  window.addEventListener('stylexwear:products-updated', () => {
    try {
      const grid = document.getElementById('collection-grid');
      if (grid) {
        grid.innerHTML = '';
        displayedCount = 0;
        initCollectionPage();
      }
    } catch (e) {
      console.error('Error re-rendering collection:', e);
    }
  });
});

// Global state for collection
let filteredProducts = [];
let baselineProducts = [];
let displayedCount = 0;
const productsPerPage = 24;
let activeSortKey = 'featured';

const SWATCH_PALETTES = [
  ['s-black', 's-white'],
  ['s-black', 's-grey'],
  ['s-red', 's-black'],
  ['s-brown', 's-black'],
  ['s-navy', 's-black'],
  ['s-olive', 's-black'],
  ['s-wine', 's-black'],
  ['s-beige', 's-black'],
  ['s-grey', 's-white'],
  ['s-black'],
  ['s-white'],
];

function initCollectionMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('collection') || 'all';
  const labels = {
    'all': 'All Products',
    'oversized-premium': 'Oversized Tees',
    'hoodies': 'Hoodies',
    'the-solid-wear': 'The Solid Wear',
    'polos': 'Polo Shirts',
    'men': "Men's Collection",
    'women': "Women's Collection"
  };
  const label = labels[cat] || 'Collection';
  // Build two copies for seamless loop
  const makeSegment = () => {
    const seg = document.createElement('div');
    seg.style.cssText = 'display:flex;align-items:center;flex-shrink:0;';
    seg.innerHTML = `
      <span class="coll-marquee-item">${label}</span>
      <span class="coll-marquee-dot">&#9670;</span>
      <span class="coll-marquee-item filled">${label}</span>
      <span class="coll-marquee-dot">&#9670;</span>
    `;
    return seg;
  };
  // Repeat enough times to fill screen * 2 for loop
  for (let i = 0; i < 6; i++) track.appendChild(makeSegment());
}

function initCollectionSortDropdown() {
  const btns = document.querySelectorAll('.sort-dropdown-menu [data-sort], .mobile-sort-option');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeSortKey = btn.getAttribute('data-sort');
      btns.forEach(b => {
        if (b.getAttribute('data-sort') === activeSortKey) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      const grid = document.getElementById('collection-grid');
      if (grid) grid.innerHTML = '';
      displayedCount = 0;
      applySortAndRender();
      
      // Close mobile sort drawer if open
      const mobSortDrawer = document.getElementById('mobile-sort-drawer');
      if (mobSortDrawer) {
        mobSortDrawer.classList.remove('open');
        const overlay = document.getElementById('page-overlay');
        if (overlay) overlay.classList.remove('active');
      }
    });
  });
}

function renderBatch() {
  const grid = document.getElementById('collection-grid');
  const counterEl = document.getElementById('results-counter');
  const loadMoreContainer = document.getElementById('load-more-container');
  if (!grid) return;

  const nextBatch = filteredProducts.slice(displayedCount, displayedCount + productsPerPage);
  if (nextBatch.length === 0) {
    if (displayedCount === 0) {
      grid.innerHTML = '<div class="coll-empty-state"><i data-feather="package" style="width:40px;height:40px;"></i><span>No products found in this collection.</span></div>';
      if (typeof feather !== 'undefined') feather.replace();
    }
    return;
  }
  nextBatch.forEach((prod, index) => {
    const card = document.createElement('div');
    card.className = 'coll-product-card';
    card.style.transitionDelay = `${(index % 8) * 0.06}s`;
    
    const img1 = (prod.images && prod.images[0]) || '';
    const img2 = (prod.images && prod.images[1]) || img1;
    
    // Pick swatches based on product index
    const swatchSet = SWATCH_PALETTES[(filteredProducts.indexOf(prod)) % SWATCH_PALETTES.length] || ['s-black'];
    const swatchesHTML = swatchSet.map(cls => `<span class="coll-swatch ${cls}" title="${cls.replace('s-','')}"></span>`).join('');
    
    const sizes = ['S', 'M', 'L', 'XL', '2XL'];
    const sizesHTML = sizes.map(s => `<button class="coll-size-chip" data-size="${s}" data-id="${prod.id}">${s}</button>`).join('');
    
    const isWishlisted = typeof getWishlist === 'function' && getWishlist().includes(prod.handle);
    
    card.innerHTML = `
      <div class="coll-card-img-wrap">
        <img class="img-primary" src="${img1}" alt="${prod.title}" loading="lazy">
        ${img2 !== img1 ? `<img class="img-secondary" src="${img2}" alt="${prod.title} alternate" loading="lazy">` : ''}
        
        <button class="coll-wishlist-btn ${isWishlisted ? 'active' : ''}" data-handle="${prod.handle}" aria-label="Wishlist">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        
        <button class="coll-quick-add-strip" data-id="${prod.id}">Quick Add +</button>
        <a href="product.html?product=${prod.handle}" class="coll-card-link-overlay" aria-label="View ${prod.title}"></a>
      </div>
      
      <div class="coll-card-info">
        <div class="coll-card-title">
          <a href="product.html?product=${prod.handle}">${prod.title}</a>
        </div>
        <div class="coll-card-price">${prod.price}</div>
        <div class="coll-card-swatches">${swatchesHTML}</div>
        <div class="coll-card-sizes">${sizesHTML}</div>
      </div>
    `;
    
    grid.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('visible')));
  });
  
  displayedCount += nextBatch.length;
  if (counterEl) counterEl.textContent = `${filteredProducts.length} products`;
  
  if (loadMoreContainer) {
    loadMoreContainer.style.display = displayedCount < filteredProducts.length ? 'flex' : 'none';
  }
  
  if (typeof feather !== 'undefined') feather.replace();
  if (typeof wireProductCardActions === 'function') wireProductCardActions();
}

function applySortAndRender() {
  if (activeSortKey === 'price-low') {
    filteredProducts.sort((a, b) => (parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0) - (parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0));
  } else if (activeSortKey === 'price-high') {
    filteredProducts.sort((a, b) => (parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0) - (parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0));
  } else if (activeSortKey === 'title-asc') {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filteredProducts.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  }
  renderBatch();
}

function initCollectionPage() {
  const grid = document.getElementById('collection-grid');
  const titleEl = document.getElementById('collection-title');
  const breadcrumbEl = document.getElementById('collection-breadcrumb-name');
  const counterEl = document.getElementById('results-counter');
  const loadMoreBtn = document.getElementById('btn-load-more');
  const loadMoreContainer = document.getElementById('load-more-container');
  const sortSelector = document.getElementById('sort-selector');
  
  if (!grid) return;
  
  // 1. Parse URL Parameter
  const params = new URLSearchParams(window.location.search);
  let categoryKey = params.get('collection') || 'all';
  
  // Format visual header text
  let headerText = 'All Products';
  if (categoryKey === 'oversized-premium') headerText = 'Oversized Premium';
  else if (categoryKey === 'hoodies') headerText = 'Hoodies';
  else if (categoryKey === 'the-solid-wear') headerText = 'The Solid Wear';
  else if (categoryKey === 'polos') headerText = 'Polo Shirts';
  else if (categoryKey === 'men') headerText = 'Men\'s Collection';
  else if (categoryKey === 'women') headerText = 'Women\'s Collection';
  
  if (titleEl) titleEl.textContent = headerText;
  if (breadcrumbEl) breadcrumbEl.textContent = headerText;
  
  // 2. Filter products database
  if (categoryKey !== 'all') {
    baselineProducts = PRODUCTS.filter(prod => {
      // Matching tags or categories
      if (categoryKey === 'oversized-premium' || categoryKey === 'hoodies' || categoryKey === 'the-solid-wear' || categoryKey === 'polos') {
        return prod.category && prod.category.toLowerCase().includes(categoryKey.replace(/-/g, ' '));
      } else if (categoryKey === 'men') {
        return prod.gender === 'Men' || prod.gender === 'Unisex' || !prod.gender;
      } else if (categoryKey === 'women') {
        return prod.gender === 'Women' || prod.gender === 'Unisex';
      }
      return true;
    });
  } else {
    baselineProducts = [...PRODUCTS];
  }
  
  filteredProducts = [...baselineProducts];

  // Set default checkbox state based on URL category
  if (categoryKey !== 'all') {
    const matchingCheckbox = document.querySelector(`input[name="f-category"][value="${categoryKey.replace(/-/g, ' ')}"]`);
    if (matchingCheckbox) matchingCheckbox.checked = true;
  }

  
  // 3. Initial sort (default featured)
  
  // 4. Products rendered via global renderBatch()

  
  // Initial draw cycle
  applySortAndRender();
  
  // Wire Load More click
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => renderBatch());
}

function wireCardImageSliders() {
  document.querySelectorAll('.product-image-slider').forEach(slider => {
    const track = slider.querySelector('.product-image-track');
    const slides = slider.querySelectorAll('.product-image-slide');
    const dots = slider.querySelectorAll('.product-slider-dot');
    const prevBtn = slider.querySelector('.prod-slider-btn.prev');
    const nextBtn = slider.querySelector('.prod-slider-btn.next');
    
    if (slides.length <= 1) return;
    
    let activeIdx = 0;
    
    const updateSlider = (idx) => {
      activeIdx = (idx + slides.length) % slides.length;
      track.style.transform = `translateX(-${activeIdx * 100}%)`;
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === activeIdx);
      });
      slider.setAttribute('data-active-slide', activeIdx);
    };
    
    if (prevBtn && !prevBtn.hasAttribute('data-wired')) {
      prevBtn.setAttribute('data-wired', 'true');
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateSlider(activeIdx - 1);
      });
    }
    
    if (nextBtn && !nextBtn.hasAttribute('data-wired')) {
      nextBtn.setAttribute('data-wired', 'true');
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateSlider(activeIdx + 1);
      });
    }
    
    dots.forEach((dot, idx) => {
      if (!dot.hasAttribute('data-wired')) {
        dot.setAttribute('data-wired', 'true');
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          updateSlider(idx);
        });
      }
    });
  });
}

function wireProductCardActions() {
  // New coll-wishlist-btn
  document.querySelectorAll('.coll-wishlist-btn').forEach(btn => {
    if (!btn.hasAttribute('data-wired')) {
      btn.setAttribute('data-wired', 'true');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const handle = btn.getAttribute('data-handle');
        toggleWishlist(handle);
        btn.classList.toggle('active');
      });
    }
  });
  
  // Size chips — clicking a chip picks that size and adds to cart
  document.querySelectorAll('.coll-size-chip').forEach(chip => {
    if (!chip.hasAttribute('data-wired')) {
      chip.setAttribute('data-wired', 'true');
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        // Deselect siblings
        const siblings = chip.closest('.coll-card-sizes').querySelectorAll('.coll-size-chip');
        siblings.forEach(s => s.classList.remove('active'));
        chip.classList.add('active');
      });
    }
  });
  
  // Quick Add strip — uses selected size or opens global size picker if none is selected
  document.querySelectorAll('.coll-quick-add-strip').forEach(btn => {
    if (!btn.hasAttribute('data-wired')) {
      btn.setAttribute('data-wired', 'true');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const card = btn.closest('.coll-product-card');
        const activeChip = card ? card.querySelector('.coll-size-chip.active') : null;
        if (activeChip) {
          const size = activeChip.getAttribute('data-size');
          addToCart(id, size);
        } else {
          // No size selected, open the premium slide-up options drawer!
          if (window.openGlobalSizePicker) {
            window.openGlobalSizePicker(id);
          } else {
            addToCart(id, 'S');
          }
        }
      });
    }
  });
}

// Mobile drawer nested panel panels navigation
function initMobileDrawerPanels() {
  const collectionBtn = document.getElementById('mobile-nav-collection');
  const backBtn = document.getElementById('mobile-nav-back');
  const mainPanel = document.getElementById('menu-main-panel');
  const collectionPanel = document.getElementById('menu-collection-panel');
  
  if (collectionBtn && backBtn && mainPanel && collectionPanel) {
    collectionBtn.addEventListener('click', () => {
      mainPanel.classList.remove('active');
      collectionPanel.classList.add('active');
    });
    
    backBtn.addEventListener('click', () => {
      collectionPanel.classList.remove('active');
      mainPanel.classList.add('active');
    });
  }
}

// Re-using common UI modules from scripts.js
function initCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  const particles = [];
  const particleCount = Math.min(60, Math.floor((width * height) / 20000));
  
  const mouse = { x: null, y: null, radius: 100 };
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.4 + 0.2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
      
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 1.5;
          this.y += Math.sin(angle) * force * 1.5;
        }
      }
    }
    draw() {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) particles.push(new Particle());
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${(100 - dist) / 100 * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

function initAnnouncementBar() {
  const bar = document.getElementById('announcement-slider');
  if (!bar) return;
  const slides = bar.querySelectorAll('.announcement-slide');
  if (slides.length <= 1) return;
  let currentIdx = 0;
  setInterval(() => {
    currentIdx = (currentIdx + 1) % slides.length;
    bar.style.transform = `translateY(-${currentIdx * 36}px)`;
  }, 4000);
}

function initDrawers() {
  const drawers = [
    { open: 'menu-drawer-open', close: 'menu-drawer-close', element: 'menu-drawer' },
    { open: 'cart-drawer-open', close: 'cart-drawer-close', element: 'cart-drawer' },
    { open: 'wishlist-drawer-open', close: 'wishlist-drawer-close', element: 'wishlist-drawer' },
    { open: 'search-drawer-open', close: 'search-drawer-close', element: 'search-drawer' },
    { open: 'filter-toggle-btn', close: 'filter-drawer-close', element: 'filter-drawer' }
  ];
  const overlay = document.getElementById('page-overlay');
  const closeAllDrawers = () => {
    drawers.forEach(d => {
      const el = document.getElementById(d.element);
      if (el) el.classList.remove('open');
    });
    overlay.classList.remove('active');
  };
  drawers.forEach(d => {
    const openBtn = document.getElementById(d.open);
    const closeBtn = document.getElementById(d.close);
    const el = document.getElementById(d.element);
    if (openBtn && el) {
      openBtn.addEventListener('click', () => {
        closeAllDrawers();
        el.classList.add('open');
        overlay.classList.add('active');
        if (d.element === 'search-drawer') {
          setTimeout(() => document.getElementById('search-input').focus(), 300);
        }
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeAllDrawers);
  });
  if (overlay) overlay.addEventListener('click', closeAllDrawers);
}

function getCart() { return JSON.parse(localStorage.getItem('StyleXWear_cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('StyleXWear_cart', JSON.stringify(cart)); updateCartUI(); }

function addToCart(productId, size = 'S') {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const cart = getCart();
  const existingItem = cart.find(item => item.id === productId && item.size === size);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      handle: product.handle,
      image: product.images[0],
      size: size,
      qty: 1
    });
  }
  saveCart(cart);
  const cartDrawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('page-overlay');
  if (cartDrawer && overlay) {
    document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
    cartDrawer.classList.add('open');
    overlay.classList.add('active');
  }
}

function removeFromCart(productId, size) {
  const cart = getCart();
  const updatedCart = cart.filter(item => !(item.id === productId && item.size === size));
  saveCart(updatedCart);
}

function updateQty(productId, size, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId && i.size === size);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(productId, size);
    else saveCart(cart);
  }
}

function updateCartUI() {
  const cart = getCart();
  const badge = document.getElementById('cart-badge');
  const itemsContainer = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }
  if (itemsContainer) {
    itemsContainer.innerHTML = '';
    if (cart.length === 0) {
      itemsContainer.innerHTML = '<div class="cart-empty-message">Your shopping cart is empty.</div>';
      if (subtotalEl) subtotalEl.textContent = 'Rs. 0.00';
      return;
    }
    let subtotal = 0;
    cart.forEach(item => {
      const itemNumericPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      subtotal += itemNumericPrice * item.qty;
      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item';
      itemRow.innerHTML = `
        <div class="cart-item-image"><img src="${item.image}" alt="${item.title}"></div>
        <div class="cart-item-details">
          <div>
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-variant">Size: ${item.size}</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn dec" data-id="${item.id}" data-size="${item.size}">-</button>
            <span class="cart-item-qty-val">${item.qty}</span>
            <button class="qty-btn inc" data-id="${item.id}" data-size="${item.size}">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <div class="cart-item-price">Rs. ${formatPrice(item.price)}</div>
          <div class="cart-item-remove" data-id="${item.id}" data-size="${item.size}">Remove</div>
        </div>
      `;
      itemsContainer.appendChild(itemRow);
    });
    if (subtotalEl) subtotalEl.textContent = `Rs. ${formatPrice(subtotal)}`;
    itemsContainer.querySelectorAll('.qty-btn.dec').forEach(btn => btn.addEventListener('click', () => updateQty(btn.getAttribute('data-id'), btn.getAttribute('data-size'), -1)));
    itemsContainer.querySelectorAll('.qty-btn.inc').forEach(btn => btn.addEventListener('click', () => updateQty(btn.getAttribute('data-id'), btn.getAttribute('data-size'), 1)));
    itemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => btn.addEventListener('click', () => removeFromCart(btn.getAttribute('data-id'), btn.getAttribute('data-size'))));
  }
}

function getWishlist() { return JSON.parse(localStorage.getItem('StyleXWear_wishlist') || '[]'); }
function toggleWishlist(handle) {
  let wishlist = getWishlist();
  if (wishlist.includes(handle)) wishlist = wishlist.filter(h => h !== handle);
  else wishlist.push(handle);
  localStorage.setItem('StyleXWear_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}

function updateWishlistUI() {
  const wishlist = getWishlist();
  
  // Update wishlist badge in header
  const badge = document.getElementById('wishlist-badge');
  if (badge) {
    badge.textContent = wishlist.length;
    badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
  
  const itemsContainer = document.getElementById('wishlist-drawer-items');
  if (!itemsContainer) return;
  itemsContainer.innerHTML = '';
  if (wishlist.length === 0) {
    itemsContainer.innerHTML = '<div class="cart-empty-message">Your wishlist is empty.</div>';
    return;
  }
  wishlist.forEach(handle => {
    const product = PRODUCTS.find(p => p.handle === handle);
    if (!product) return;
    const row = document.createElement('div');
    row.className = 'search-result-item';
    row.innerHTML = `
      <div class="search-result-image"><a href="product.html?product=${product.handle}"><img src="${product.images[0]}" alt="${product.title}"></a></div>
      <div class="search-result-info">
        <a href="product.html?product=${product.handle}" class="search-result-title">${product.title}</a>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span class="search-result-price">${product.price}</span>
          <span class="cart-item-remove remove-wishlist" data-handle="${product.handle}" style="cursor:pointer;">Remove</span>
        </div>
      </div>
    `;
    itemsContainer.appendChild(row);
  });
  itemsContainer.querySelectorAll('.remove-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const handle = btn.getAttribute('data-handle');
      toggleWishlist(handle);
      const activeCardHeart = document.querySelector(`.wishlist-icon-btn[data-handle="${handle}"]`);
      if (activeCardHeart) activeCardHeart.classList.remove('active');
    });
  });
}

function initSearch() {
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');
  if (!searchInput) return;
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    resultsContainer.innerHTML = '';
    if (query.length < 2) {
      resultsContainer.innerHTML = '<div class="cart-empty-message">Type at least 2 characters to search.</div>';
      return;
    }
    const matched = PRODUCTS.filter(p => p.title.toLowerCase().includes(query) || (p.category && p.category.toLowerCase().includes(query)));
    if (matched.length === 0) {
      resultsContainer.innerHTML = '<div class="cart-empty-message">No products found.</div>';
      return;
    }
    matched.forEach(prod => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div class="search-result-image"><a href="product.html?product=${prod.handle}"><img src="${prod.images[0]}" alt="${prod.title}"></a></div>
        <div class="search-result-info">
          <a href="product.html?product=${prod.handle}" class="search-result-title">${prod.title}</a>
          <span class="search-result-price" style="margin-top:4px;">${prod.price}</span>
        </div>
      `;
      resultsContainer.appendChild(item);
    });
  });
}

/* =====================================================
 * FILTER SYSTEM CUSTOMIZATION AND INTERACTIVITY
 * ===================================================== */
function applyActiveFilters() {
  const selectedCategories = Array.from(document.querySelectorAll('input[name="f-category"]:checked')).map(cb => cb.value.toLowerCase());
  const selectedPrices     = Array.from(document.querySelectorAll('input[name="f-price"]:checked')).map(cb => cb.value);
  const selectedGenders    = Array.from(document.querySelectorAll('input[name="f-gender"]:checked')).map(cb => cb.value.toLowerCase());

  filteredProducts = baselineProducts.filter(prod => {
    // 1. Category Filter Match
    if (selectedCategories.length > 0) {
      const match = selectedCategories.some(cat => prod.category && prod.category.toLowerCase().includes(cat));
      if (!match) return false;
    }

    // 2. Price Filter Match
    if (selectedPrices.length > 0) {
      const priceVal = parseFloat(prod.price.replace(/[^0-9.]/g, '')) || 0;
      const match = selectedPrices.some(range => {
        if (range === 'under-800') return priceVal < 800;
        if (range === '800-900') return priceVal >= 800 && priceVal <= 900;
        if (range === 'over-900') return priceVal > 900;
        return false;
      });
      if (!match) return false;
    }

    // 3. Gender Filter Match
    if (selectedGenders.length > 0) {
      const prodGender = (prod.gender || 'Unisex').toLowerCase();
      const match = selectedGenders.includes(prodGender);
      if (!match) return false;
    }

    return true;
  });

  // Clear current grid and rebuild
  const grid = document.getElementById('collection-grid');
  if (grid) grid.innerHTML = '';
  displayedCount = 0;
  
  // Re-run sort on the newly filtered list and render the batch
  applySortAndRender();
}

function initFilterDrawerActions() {
  const applyBtn = document.getElementById('btn-filter-apply');
  const clearBtn = document.getElementById('btn-filter-clear');
  const drawer   = document.getElementById('filter-drawer');
  const overlay  = document.getElementById('page-overlay');

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      applyActiveFilters();
      // Close filter drawer
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // Uncheck all boxes
      document.querySelectorAll('.filter-drawer input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      applyActiveFilters();
    });
  }
}

// Register Filter drawer actions on ready
document.addEventListener('DOMContentLoaded', () => {
  initFilterDrawerActions();
});



