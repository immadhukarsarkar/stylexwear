/* -------------------------------------------------------------
 * StyleXWear Storefront Interactive JavaScript Controller
 * ------------------------------------------------------------- */

// Global locale-independent price formatting helper
const formatPrice = (val) => {
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val;
  if (isNaN(num)) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

document.addEventListener('DOMContentLoaded', () => {
  // Auto-login/bypass sign in & sign up system by pre-populating mock session
  if (!localStorage.getItem('StyleXWear_currentUser')) {
    localStorage.setItem('StyleXWear_currentUser', JSON.stringify({
      name: 'Rare User',
      email: 'user@stylexwear.shop',
      phone: '9876543210',
      coins: 500
    }));
  }

  // Parse referral query parameter
  const refParam = new URLSearchParams(window.location.search).get('ref');
  if (refParam) {
    localStorage.setItem('StyleXWear_activeReferrer', refParam);
    console.log('[Referral Tracker] Active referrer set to:', refParam);
  }
  
  // 1. Dynamic Products Rendering on Homepage
  initHomepageProducts();
  
  // 2. Interactive Canvas Particle Background
  initCanvasBackground();
  
  // 3. Announcement Bar Rotation
  initAnnouncementBar();
  
  // 4. Hero Slider Actions
  initHeroSlider();
  
  // 5. Scroll Capsules Navigation
  initCapsuleNavigation();
  
  // 6. Drawers Open/Close Controllers
  initDrawers();
  
  // 7. Shopping Cart & Wishlist Logic
  updateCartUI();
  updateWishlistUI();
  updateHeaderCoins();
  
  // 8. Search Functionality
  initSearch();
  
  // 9. Intersection Observer for Scroll Reveals
  initScrollReveals();
  
  // 10. Newsletter Discount Modal Popup
  initNewsletterModal();
  
  // 11. Mobile Drawer Navigation Panels
  initMobileDrawerPanels();
});

/* -------------------------------------------------------------
 * 1. Dynamic Products Rendering
 * ------------------------------------------------------------- */
function initHomepageProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return; // If on product details page, skip

  grid.innerHTML = '';
  
  // Render top 8 products in the latest drops grid
  const latestDrops = PRODUCTS.slice(0, 8);
  
  const tags = ['BEST SELLER', 'NEW DROP', 'TRENDING', 'LIMITED', 'MUST HAVE', 'TOP RATED'];

  latestDrops.forEach((prod, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.08}s`;
    
    const badgeText = tags[index % tags.length];
    
    // Generate image slides
    let slidesHTML = '';
    prod.images.forEach((img) => {
      slidesHTML += `
        <div class="product-image-slide">
          <img src="${img}" alt="${prod.title}" loading="lazy">
        </div>
      `;
    });
    
    // Generate dots indicators
    let dotsHTML = '';
    prod.images.forEach((_, idx) => {
      dotsHTML += `<span class="product-slider-dot ${idx === 0 ? 'active' : ''}" data-idx="${idx}"></span>`;
    });
    
    card.innerHTML = `
      <div class="product-image-wrapper">
        <div class="product-badge-custom"><span>${badgeText}</span></div>
        
        <div class="product-image-slider" data-active-slide="0" data-total-slides="${prod.images.length}">
          <div class="product-image-track">
            ${slidesHTML}
          </div>
          
          ${prod.images.length > 1 ? `
            <button class="prod-slider-btn prev" aria-label="Prev image">
              <i data-feather="chevron-left"></i>
            </button>
            <button class="prod-slider-btn next" aria-label="Next image">
              <i data-feather="chevron-right"></i>
            </button>
            <div class="product-slider-dots">
              ${dotsHTML}
            </div>
          ` : ''}
        </div>
        
        <!-- Image overlay pills (Rating & Colors) -->
        <div class="product-image-overlay-pills">
          <div class="product-image-pill --rating">
            <span class="pill-star">✦</span>
            <span class="pill-text">${prod.rating ? prod.rating.toFixed(1) : '4.5'}  ${prod.reviewCount ? prod.reviewCount : '320'}</span>
          </div>
          <div class="product-image-pill --colors">
            <div class="pill-color-dots">
              <span class="color-dot" style="background-color: #f3ecd8; z-index: 2; margin-right: -4px;"></span>
              ${prod.images.length > 1 ? `<span class="color-dot" style="background-color: #0000ff; z-index: 1;"></span>` : ''}
            </div>
            <span class="pill-text">${prod.images.length}</span>
          </div>
        </div>
        <a href="product.html?product=${prod.handle}" class="product-link-overlay" aria-label="View ${prod.title}"></a>
      </div>
      
      <div class="product-info-custom">
        <div class="product-pricing-row">
          <span class="price-current">₹${formatPrice(parseFloat(prod.price.replace(/[^0-9.]/g,'')))}</span>
          ${ prod.originalPrice ? `
            <span class="price-original">₹${formatPrice(parseFloat(prod.originalPrice.replace(/[^0-9.]/g,'')))}</span>
            <span class="price-discount">${Math.round(((parseFloat(prod.originalPrice.replace(/[^0-9.,]/g,'').replace(',',''))-parseFloat(prod.price.replace(/[^0-9.,]/g,'').replace(',','')))/parseFloat(prod.originalPrice.replace(/[^0-9.,]/g,'').replace(',','')))*100)}% OFF</span>
          ` : '' }
        </div>
        
        <div class="product-best-price-row">
          <svg class="best-price-svg" viewBox="0 0 24 24" width="14" height="14" style="margin-right: 5px;"><circle cx="12" cy="12" r="10" fill="#00b050"></circle><text x="12" y="15" font-size="10" font-weight="900" fill="#fff" text-anchor="middle">%</text></svg>
          <span class="best-price-label">Best price <strong class="best-price-val">₹${formatPrice(Math.round(parseFloat(prod.price.replace(/[^0-9.]/g,'')) * 0.72))}</strong></span>
        </div>
        
        <h3 class="product-title-custom-label">
          <a href="product.html?product=${prod.handle}">${prod.title}</a>
        </h3>
      </div>
      <button class="add-to-cart-btn-full" data-id="${prod.id}">
        ADD TO CART
      </button>
    `;

    
    grid.appendChild(card);
  });
  
  // Re-run feather icons replacement for new elements
  feather.replace();
  
  // Wire image sliders inside card
  wireCardImageSliders();
  
  // Add Event Listeners for actions
  wireProductCardActions();
  
  // Inject Curved Carousel products
  initCurvedCarousel();

  // Start dynamic sliding text rotation on product badges
  const badgeTags = ['BEST SELLER', 'NEW DROP', 'TRENDING', 'LIMITED', 'MUST HAVE', 'TOP RATED'];
  let cycleIdx = 0;
  
  if (window.badgeRotationInterval) {
    clearInterval(window.badgeRotationInterval);
  }
  
  window.badgeRotationInterval = setInterval(() => {
    cycleIdx = (cycleIdx + 1) % badgeTags.length;
    document.querySelectorAll('.product-badge-custom').forEach((badge, cardIndex) => {
      const span = badge.querySelector('span');
      if (!span) return;
      const nextTag = badgeTags[(cycleIdx + cardIndex) % badgeTags.length];
      
      // 1. Slide Out UP (Snappy 0.3s exit animation)
      badge.style.transition = 'transform 0.3s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.25s ease-in-out';
      badge.style.transform = 'translateY(-150%)';
      badge.style.opacity = '0';
      
      // 2. Reposition instantly at bottom and slide back up immediately at 300ms
      setTimeout(() => {
        badge.style.transition = 'none';
        badge.style.transform = 'translateY(150%)';
        badge.style.opacity = '0';
        span.textContent = nextTag; // swap tag text
        
        // Force layout reflow
        badge.offsetWidth;
        
        // 3. Slide In UP (Snappy 0.3s entry animation)
        badge.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-in-out';
        badge.style.transform = 'translateY(0)';
        badge.style.opacity = '1';
      }, 300); // Triggered immediately when slide out completes!
    });
  }, 3000); // Cycles every 3.0 seconds (slower, premium ticker feel!)
}

window.wireCardImageSliders = function() {
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
    
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateSlider(activeIdx - 1);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateSlider(activeIdx + 1);
      });
    }
    
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        updateSlider(idx);
      });
    });

    // Desktop: show next image on hover, reset on leave
    const card = slider.closest('.product-card');
    if (card) {
      card.addEventListener('mouseenter', () => {
        updateSlider(1);
      });
      card.addEventListener('mouseleave', () => {
        updateSlider(0);
      });
    }

    // Mobile: swipe left = next image, swipe right = prev image
    let touchStartX = 0;
    let touchStartY = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;

      // Only treat as horizontal swipe if X movement is bigger than Y (not a scroll)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        e.stopPropagation();
        if (deltaX < 0) {
          updateSlider(activeIdx + 1); // Swipe left → next image
        } else {
          updateSlider(activeIdx - 1); // Swipe right → prev image
        }
      }
    }, { passive: true });
  });
}

function wireProductCardActions() {
  // Wishlist buttons
  document.querySelectorAll('.wishlist-icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const handle = btn.getAttribute('data-handle');
      toggleWishlist(handle);
      btn.classList.toggle('active');
    });
  });
  
  // Share buttons
  document.querySelectorAll('.share-icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const handle = btn.getAttribute('data-handle');
      const product = PRODUCTS.find(p => p.handle === handle);
      const title = product ? product.title : 'Product';
      shareProductLink(e, handle, title);
    });
  });

  // Add to Cart buttons (Opens Global Size Picker popup)
  document.querySelectorAll('.add-to-cart-btn-full, .add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openGlobalSizePicker(id);
    });
  });
}

function initCurvedCarousel() {
  const track = document.getElementById('curved-track');
  if (!track) return;
  
  track.innerHTML = '';
  
  // Populate the curved carousel with the first 12 premium products
  PRODUCTS.slice(0, 12).forEach((prod, index) => {
    const card = document.createElement('div');
    card.className = 'curved-carousel-card';
    card.setAttribute('data-index', index);
    
    const img1 = prod.images[0] || '';
    
    card.innerHTML = `
      <div class="curved-carousel-card-inner">
        <div class="curved-carousel-image-wrapper">
          <img class="curved-carousel-image" src="${img1}" alt="${prod.title}" loading="lazy">
          <button class="curved-carousel-add-to-cart" data-id="${prod.id}" aria-label="Add to Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </button>
        </div>
        <div class="curved-carousel-content">
          <h3 class="curved-carousel-product-title">
            <a href="product.html?product=${prod.handle}">${prod.title}</a>
          </h3>
          ${ prod.rating ? `<div style="display:flex; align-items:center; gap:4px; margin-bottom:4px;">
            <span style="color:#ffd60a; font-size:0.78rem;">${'★'.repeat(Math.floor(prod.rating))}${'☆'.repeat(5-Math.floor(prod.rating))}</span>
            <span style="font-size:0.7rem; color:#ccc;">${prod.rating.toFixed(1)}</span>
          </div>` : '' }
          <div style="display:flex; align-items:center; gap:7px; flex-wrap:wrap;">
            <p class="curved-carousel-product-price">${prod.price}</p>
            ${ prod.originalPrice && prod.originalPrice !== prod.price ? `<span style="font-size:0.75rem; color:#888; text-decoration:line-through;">${prod.originalPrice}</span>` : '' }
          </div>
        </div>

      </div>
      <a href="product.html?product=${prod.handle}" class="curved-carousel-click-overlay" aria-label="View ${prod.title}"></a>
    `;
    
    card.querySelector('.curved-carousel-add-to-cart').addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      openGlobalSizePicker(prod.id);
    });
    
    track.appendChild(card);
  });
  
  // Wire up Curved Carousel Drag / Scroll / Math Transformation
  wireCurvedCarousel();
}

function wireCurvedCarousel() {
  const track = document.getElementById('curved-track');
  const cards = Array.from(track.querySelectorAll('.curved-carousel-card'));
  if (cards.length === 0) return;
  
  const count = cards.length;
  
  // Spring physics variables
  let currentPosition = 0;   // Float position
  let targetPosition = 0;    // Target integer position
  let velocity = 0;          // Dynamic spring speed
  
  // Dragging states
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let startPosition = 0;
  
  // Momentum speed tracking
  let lastDragX = 0;
  let lastDragTime = 0;
  let dragVelocity = 0;
  
  // Hover tilt states
  let activeTiltX = 0;
  let activeTiltY = 0;
  
  let autoplayTimer;
  let wheelCooldown = false;
  
  // Render function using side-by-side Peek Carousel layout with custom spacing & spring interpolation
  const renderCoverFlow = (pos) => {
    const isMobile = window.innerWidth < 768;
    
    // Read actual card dimensions dynamically
    const W = cards[0].offsetWidth || (isMobile ? 240 : 320);
    const S = isMobile ? 12 : 25; // Spacing between card edges
    
    const scaleActive = 1.15; // Center active card scale (15% larger)
    const scaleSide = 0.95;   // Side cards scale
    
    const X_1 = W * (scaleActive + scaleSide) / 2 + S;
    const step = W * scaleSide + S;
    
    cards.forEach((card, idx) => {
      let offset = idx - pos;
      
      // Infinite circular wrap calculations
      if (offset > count / 2) {
        offset -= count;
      } else if (offset < -count / 2) {
        offset += count;
      }
      
      const absOffset = Math.abs(offset);
      const sign = offset < 0 ? -1 : 1;
      
      // Calculate scale based on proximity to center
      let scale = scaleSide;
      if (absOffset < 1.0) {
        scale = scaleActive - absOffset * (scaleActive - scaleSide);
      }
      
      // Calculate translation horizontally (no depth overlap, sit side-by-side)
      let translateX = 0;
      if (absOffset <= 1.0) {
        translateX = sign * absOffset * X_1;
      } else {
        translateX = sign * (X_1 + (absOffset - 1.0) * step);
      }
      
      // Keep only active and immediate neighbor cards visible (peek effect)
      let opacity = 1.0;
      if (absOffset > 1.5) {
        opacity = 0.0;
      } else if (absOffset > 1.0) {
        opacity = 1.0 - (absOffset - 1.0) * 2.0; // Fade out neighbors smoothly
      }
      
      // Clamp opacity bounds
      opacity = Math.max(0, Math.min(1, opacity));
      
      const isCenter = absOffset < 0.5;
      card.classList.toggle('active', isCenter);
      card.style.pointerEvents = isCenter ? 'auto' : 'none';
      card.style.zIndex = isCenter ? 100 : 10;
      card.style.opacity = opacity;
      
      // Apply transform with hover parallax tilt offset
      if (isCenter && (Math.abs(activeTiltX) > 0.01 || Math.abs(activeTiltY) > 0.01)) {
        card.style.transform = `translate3d(${translateX}px, 0, 0) rotateX(${activeTiltX}deg) rotateY(${activeTiltY}deg) scale(${scale})`;
      } else {
        card.style.transform = `translate3d(${translateX}px, 0, 0) scale(${scale})`;
      }
    });
  };
  
  // Spring loop solver run at 60 FPS
  const updateLoop = () => {
    if (isDragging) {
      const isMobile = window.innerWidth < 768;
      const dragSensitivity = isMobile ? 0.0035 : 0.0022;
      const diff = currentX - startX;
      targetPosition = startPosition - diff * dragSensitivity;
      currentPosition += (targetPosition - currentPosition) * 0.20; // smooth drag lag
    } else {
      // Spring calculations
      const displacement = targetPosition - currentPosition;
      
      let shortestDisplacement = displacement;
      if (shortestDisplacement > count / 2) {
        shortestDisplacement -= count;
      } else if (shortestDisplacement < -count / 2) {
        shortestDisplacement += count;
      }
      
      const springStrength = 0.045; // Expensive feeling damping spring
      const damping = 0.82;         // Premium overshoot settle
      
      velocity += shortestDisplacement * springStrength;
      velocity *= damping;
      currentPosition += velocity;
      
      // Maintain range
      currentPosition = (currentPosition + count) % count;
    }
    
    renderCoverFlow(currentPosition);
    requestAnimationFrame(updateLoop);
  };
  
  // Run requestAnimationFrame loop
  requestAnimationFrame(updateLoop);
  
  const goToIndex = (idx) => {
    // Determine shortest navigation path
    const diff = idx - targetPosition;
    let offset = diff;
    if (offset > count / 2) offset -= count;
    else if (offset < -count / 2) offset += count;
    
    targetPosition += offset;
  };
  
  // 1. Click Navigation on side cards
  cards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      let offset = idx - targetPosition;
      if (offset > count / 2) offset -= count;
      else if (offset < -count / 2) offset += count;
      
      if (Math.abs(offset) > 0.5) {
        e.preventDefault();
        goToIndex(idx);
      }
    });
  });
  
  // 2. Navigation Button Clicks
  const prevBtn = document.getElementById('curved-prev');
  const nextBtn = document.getElementById('curved-next');
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToIndex(Math.round(targetPosition) - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToIndex(Math.round(targetPosition) + 1);
    });
  }
  
  // 3. Mouse Wheel Support (only horizontal swipes hijack, vertical scrolls naturally bubble)
  track.addEventListener('wheel', (e) => {
    const deltaX = e.deltaX || 0;
    const deltaY = e.deltaY || 0;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      if (wheelCooldown) return;
      
      const delta = deltaX;
      if (Math.abs(delta) > 15) {
        wheelCooldown = true;
        if (delta > 0) {
          goToIndex(Math.round(targetPosition) + 1);
        } else {
          goToIndex(Math.round(targetPosition) - 1);
        }
        setTimeout(() => {
          wheelCooldown = false;
        }, 300); // Reduced cooldown to 300ms for more responsive swipes
      }
    }
  }, { passive: false });
  
  // 4. Keyboard Arrow Support
  window.addEventListener('keydown', (e) => {
    const rect = track.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (inViewport) {
      if (e.key === 'ArrowLeft') {
        goToIndex(Math.round(targetPosition) - 1);
      } else if (e.key === 'ArrowRight') {
        goToIndex(Math.round(targetPosition) + 1);
      }
    }
  });
  
  // 5. Autoplay Controls
  const startAutoplay = () => {
    autoplayTimer = setInterval(() => {
      goToIndex(Math.round(targetPosition) + 1);
    }, 4500);
  };
  const stopAutoplay = () => {
    clearInterval(autoplayTimer);
  };
  startAutoplay();
  
  // 6. Active Card Mouse Hover 3D Parallax Tilt
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      if (!card.classList.contains('active')) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      
      // Max 10 deg tilt
      activeTiltX = -percentY * 8;
      activeTiltY = percentX * 8;
      
      // Dynamic lighting reflection glow
      card.style.background = `
        radial-gradient(
          circle at ${x}px ${y}px,
          rgba(255, 255, 255, 0.08) 0%,
          rgba(255, 255, 255, 0.01) 75%
        )
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      activeTiltX = 0;
      activeTiltY = 0;
      card.style.background = 'rgba(255, 255, 255, 0.02)';
    });

    // Touch image swap toggles for mobile view
    card.addEventListener('touchstart', () => {
      card.classList.add('hover-active');
    }, { passive: true });
    
    card.addEventListener('touchend', () => {
      setTimeout(() => {
        card.classList.remove('hover-active');
      }, 1000);
    }, { passive: true });
  });
  
  // 7. Drag & Swipe Controls (with Inertia and touch-lock)
  track.addEventListener('mousedown', dragStart);
  track.addEventListener('touchstart', dragStart, { passive: false });
  track.addEventListener('mouseup', dragEnd);
  track.addEventListener('mouseleave', dragEnd);
  track.addEventListener('touchend', dragEnd);
  track.addEventListener('mousemove', dragAction);
  track.addEventListener('touchmove', dragAction, { passive: false });
  
  let startY = 0;
  let isTouchMoveY = false;
  
  function dragStart(e) {
    isDragging = true;
    isTouchMoveY = false;
    startX = getPositionX(e);
    startY = getPositionY(e);
    currentX = startX;
    startPosition = currentPosition;
    
    lastDragX = startX;
    lastDragTime = Date.now();
    dragVelocity = 0;
    
    stopAutoplay();
    track.style.cursor = 'grabbing';
  }
  
  function dragAction(e) {
    if (!isDragging) return;
    currentX = getPositionX(e);
    const currentY = getPositionY(e);
    
    const diffX = Math.abs(currentX - startX);
    const diffY = Math.abs(currentY - startY);
    
    // Prevent default scroll if dragging horizontally
    if (!isTouchMoveY && diffX > 8 && diffX > diffY) {
      if (e.cancelable) e.preventDefault();
    } else if (diffY > 8) {
      // Release drag if user is scrolling vertically
      isTouchMoveY = true;
      isDragging = false;
      track.style.cursor = 'grab';
      startAutoplay();
      return;
    }
    
    if (isTouchMoveY) return;
    
    const now = Date.now();
    const dt = now - lastDragTime;
    if (dt > 10) {
      const dx = currentX - lastDragX;
      dragVelocity = dx / dt;
      lastDragX = currentX;
      lastDragTime = now;
    }
  }
  
  function dragEnd(e) {
    if (!isDragging && !isTouchMoveY) return;
    isDragging = false;
    track.style.cursor = 'grab';
    
    if (isTouchMoveY) return;
    
    const velocityScale = 0.12;
    let offsetIndex = -dragVelocity * velocityScale;
    
    targetPosition = Math.round(targetPosition + offsetIndex);
    velocity = -dragVelocity * 0.035;
    
    startAutoplay();
  }
  
  function getPositionX(e) {
    return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  }
  
  function getPositionY(e) {
    return e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  }
}

/* -------------------------------------------------------------
 * 2. Interactive Canvas Particle Background
 * ------------------------------------------------------------- */
function initCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  const particles = [];
  const particleCount = Math.min(80, Math.floor((width * height) / 15000));
  
  const mouse = {
    x: null,
    y: null,
    radius: 120
  };
  
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
      this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Boundary collision check
      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
      
      // Mouse Interaction (drift away from mouse)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 2;
          this.y += Math.sin(angle) * force * 2;
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
  
  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    // Draw connecting lines between particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          const lineAlpha = (100 - dist) / 100 * 0.15;
          ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
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

/* -------------------------------------------------------------
 * 3. Announcement Bar Rotation
 * ------------------------------------------------------------- */
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

/* -------------------------------------------------------------
 * 4. Hero Slider Actions
 * ------------------------------------------------------------- */
function initHeroSlider() {
  const track = document.getElementById('hero-track');
  if (!track) return;
  const slides = track.querySelectorAll('.hero-slide');
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');
  const dotsContainer = document.getElementById('hero-dots');
  
  if (slides.length <= 1) return;
  
  let currentIdx = 0;
  let sliderInterval;
  
  // Dynamically build dots indicator
  dotsContainer.innerHTML = '';
  slides.forEach((_, idx) => {
    const dot = document.createElement('span');
    dot.className = `hero-slider-dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => updateSlide(idx));
    dotsContainer.appendChild(dot);
  });
  
  const dots = dotsContainer.querySelectorAll('.hero-slider-dot');
  
  const updateSlide = (idx) => {
    slides[currentIdx].classList.remove('active');
    dots[currentIdx].classList.remove('active');
    
    currentIdx = (idx + slides.length) % slides.length;
    
    slides[currentIdx].classList.add('active');
    dots[currentIdx].classList.add('active');
    resetInterval();
  };
  
  const nextSlide = () => updateSlide(currentIdx + 1);
  const prevSlide = () => updateSlide(currentIdx - 1);
  
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  
  const startInterval = () => {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(nextSlide, 5000);
  };
  
  const resetInterval = () => {
    clearInterval(sliderInterval);
    startInterval();
  };
  
  // Touch / Swipe drag support for mobile manual sliding
  let touchStartX = 0;
  let touchEndX = 0;
  
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    clearInterval(sliderInterval); // Stop autoplay while dragging
  }, { passive: true });
  
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const swipeDiff = touchStartX - touchEndX;
    
    if (Math.abs(swipeDiff) > 50) { // 50px swipe threshold
      if (swipeDiff > 0) {
        nextSlide(); // Swiped left -> load next image
      } else {
        prevSlide(); // Swiped right -> load prev image
      }
    }
    resetInterval(); // Restart autoplay timer
  }, { passive: true });

  // Mouse drag support for desktop swiping
  let isMouseDown = false;
  let mouseStartX = 0;

  track.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseStartX = e.clientX;
    clearInterval(sliderInterval);
  });

  track.addEventListener('mouseup', (e) => {
    if (!isMouseDown) return;
    isMouseDown = false;
    const dragDiff = mouseStartX - e.clientX;

    if (Math.abs(dragDiff) > 50) {
      if (dragDiff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    resetInterval();
  });

  track.addEventListener('mouseleave', () => {
    if (isMouseDown) {
      isMouseDown = false;
      resetInterval();
    } else {
      startInterval();
    }
  });
  
  track.addEventListener('mouseenter', () => clearInterval(sliderInterval));
  
  startInterval();
}

/* -------------------------------------------------------------
 * 5. Scroll Capsules Navigation
 * ------------------------------------------------------------- */
function initCapsuleNavigation() {
  const scrollContainer = document.getElementById('capsules-scroll');
  const prevBtn = document.getElementById('capsule-prev');
  const nextBtn = document.getElementById('capsule-next');
  
  if (!scrollContainer) return;
  
  // Smooth buttons clicks
  prevBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -220, behavior: 'smooth' });
  });
  
  nextBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: 220, behavior: 'smooth' });
  });
  
  // Filter Latest Drops products by Category when Capsule clicked
  document.querySelectorAll('.collection-capsule-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const category = card.getAttribute('data-category');
      
      // Update UI cards layout by sorting/filtering
      filterProductsByCategory(category);
      
      // Scroll smoothly to latest drops section
      const targetSec = document.getElementById('latest-drops');
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function filterProductsByCategory(category) {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const wishlistBtn = card.querySelector('.wishlist-icon-btn');
    let handle = wishlistBtn ? wishlistBtn.getAttribute('data-handle') : '';
    if (!handle) {
      const link = card.querySelector('.product-link-overlay') || card.querySelector('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        const match = href.match(/product=([^&]+)/);
        if (match) handle = match[1];
      }
    }
    if (!handle) return;
    const product = PRODUCTS.find(p => p.handle === handle);
    if (product) {
      if (category === 'New Arrivals' || product.category === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

/* -------------------------------------------------------------
 * 6. Drawers Open/Close Controllers
 * ------------------------------------------------------------- */
function initDrawers() {
  const drawers = [
    { open: 'menu-drawer-open', close: 'menu-drawer-close', element: 'menu-drawer' },
    { open: 'cart-drawer-open', close: 'cart-drawer-close', element: 'cart-drawer' },
    { open: 'wishlist-drawer-open', close: 'wishlist-drawer-close', element: 'wishlist-drawer' },
    { open: 'search-drawer-open', close: 'search-drawer-close', element: 'search-drawer' }
  ];
  
  const overlay = document.getElementById('page-overlay');
  
  const closeAllDrawers = () => {
    drawers.forEach(d => {
      const el = document.getElementById(d.element);
      if (el) el.classList.remove('open');
    });
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };
  
  drawers.forEach(d => {
    const openBtn = document.getElementById(d.open);
    const closeBtn = document.getElementById(d.close);
    const el = document.getElementById(d.element);
    
    if (openBtn && el) {
      openBtn.addEventListener('click', () => {
        closeAllDrawers();
        el.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Auto focus search field if search drawer
        if (d.element === 'search-drawer') {
          setTimeout(() => document.getElementById('search-input').focus(), 300);
        }
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeAllDrawers);
    }
  });
  
  // Close on overlay backdrop click
  if (overlay) {
    overlay.addEventListener('click', closeAllDrawers);
  }
  
  // Mobile Nav Drawer links closing (Only close drawer for actual navigation links)
  const mobileNavLinks = ['mobile-nav-about', 'mobile-nav-contact'];
  mobileNavLinks.forEach(id => {
    const link = document.getElementById(id);
    if (link) {
      link.addEventListener('click', closeAllDrawers);
    }
  });
}

/* -------------------------------------------------------------
 * 7. Shopping Cart & Wishlist Storage Engine
 * ------------------------------------------------------------- */
// Global Cart Helpers
function getCart() {
  return JSON.parse(localStorage.getItem('StyleXWear_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('StyleXWear_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(productId, size = 'S', openDrawer = true, color = 'Black', qtyToAdd = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const cart = getCart();
  const existingItem = cart.find(item => item.id === productId && item.size === size && (item.color || 'Black') === color);
  
  if (existingItem) {
    existingItem.qty += qtyToAdd;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      handle: product.handle,
      image: product.images[0],
      size: size,
      color: color,
      qty: qtyToAdd
    });
  }
  
  saveCart(cart);

  // Log to Audit Logs
  const currentUser = JSON.parse(localStorage.getItem('StyleXWear_currentUser'));
  const actor = currentUser ? `${currentUser.name} (${currentUser.email || currentUser.phone})` : 'Guest';
  logSystemEvent(actor, 'Cart Activity', `Added item to cart: "${product.title}" (Size: ${size}, Qty: ${qtyToAdd})`);
  
  if (openDrawer) {
    // Open the Cart Drawer to show add confirmation
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('page-overlay');
    if (cartDrawer && overlay) {
      // close other drawers first
      document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
      cartDrawer.classList.add('open');
      overlay.classList.add('active');
    }
  } else {
    // If not opening drawer, show a clean luxury subtle toast notification
    showCartToast(product.title);
  }
}

function showCartToast(title) {
  let toast = document.getElementById('cart-toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast-notification';
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translate(-50%, 100px);
      background: rgba(11, 11, 13, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
      padding: 14px 28px;
      border-radius: 30px;
      font-size: 1.3rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      z-index: 9999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease;
      opacity: 0;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `<i data-feather="check-circle" style="color:#15803d; width:16px; height:16px;"></i> ${title} added to cart!`;
  feather.replace();
  
  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0)';
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 100px)';
  }, 3000);
}

function removeFromCart(productId, size, color = 'Black') {
  const cart = getCart();
  const updatedCart = cart.filter(item => !(item.id === productId && item.size === size && (item.color || 'Black') === color));
  saveCart(updatedCart);
}

function updateQty(productId, size, color = 'Black', delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId && i.size === size && (i.color || 'Black') === color);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId, size, color);
    } else {
      saveCart(cart);
    }
  }
}

function updateItemSize(productId, oldSize, color, newSize) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id == productId && item.size === oldSize && (item.color || 'Black') === color);
  if (itemIndex === -1) return;

  const targetItem = cart[itemIndex];
  
  // Check if there is already an item in the cart with the new size
  const duplicateIndex = cart.findIndex(item => item.id == productId && item.size === newSize && (item.color || 'Black') === color);
  
  if (duplicateIndex !== -1 && duplicateIndex !== itemIndex) {
    // Merge quantities
    cart[duplicateIndex].qty += targetItem.qty;
    cart.splice(itemIndex, 1);
  } else {
    // Update size
    targetItem.size = newSize;
  }

  saveCart(cart);
}

function setCartItemQty(productId, size, color = 'Black', newQty) {
  const cart = getCart();
  const item = cart.find(i => i.id == productId && i.size === size && (i.color || 'Black') === color);
  if (item) {
    item.qty = parseInt(newQty) || 1;
    saveCart(cart);
  }
}

function updateCartUI() {
  const cart = getCart();
  const badge = document.getElementById('cart-badge');
  const itemsContainer = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  const cartTitle = document.getElementById('cart-drawer-title');
  const cartDrawer = document.getElementById('cart-drawer');

  // 1. Update Badge & Title
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }
  if (cartTitle) cartTitle.textContent = `MY CART (${totalCount})`;

  // 1.5. Update Floating Sticky View Cart Bar (StyleXWear Style - Homepage Only)
  const isHomepage = !!document.querySelector('.hero-slider-section');
  let floatingCart = document.getElementById('floating-view-cart-pill');
  if (totalCount > 0 && isHomepage) {
    if (!floatingCart) {
      floatingCart = document.createElement('div');
      floatingCart.id = 'floating-view-cart-pill';
      document.body.appendChild(floatingCart);
      
      floatingCart.addEventListener('click', () => {
        const cartDrawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('page-overlay');
        if (cartDrawer && overlay) {
          cartDrawer.classList.add('open');
          overlay.classList.add('active');
        }
      });
    }
    
    // Calculate current subtotal and original MRP total for real-time savings count
    let subtotalVal = 0;
    let mrpTotalVal = 0;
    cart.forEach(item => {
      const itemNumericPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      subtotalVal += itemNumericPrice * item.qty;
      const product = PRODUCTS.find(p => p.id == item.id);
      const originalPrice = product && product.originalPrice ? parseFloat(product.originalPrice.replace(/[^0-9.]/g, '')) : itemNumericPrice * 2.18;
      mrpTotalVal += originalPrice * item.qty;
    });
    const savingsVal = Math.max(0, mrpTotalVal - subtotalVal);
    
    floatingCart.innerHTML = `
      <div class="floating-cart-info">
        <div class="floating-cart-title">VIEW CART (${totalCount})</div>
        <div class="floating-cart-savings">SAVINGS ₹${formatPrice(Math.round(savingsVal))}</div>
      </div>
      <button class="floating-cart-btn" aria-label="Open Cart">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </button>
    `;
    
    requestAnimationFrame(() => {
      floatingCart.classList.add('active');
    });
  } else {
    if (floatingCart) {
      floatingCart.classList.remove('active');
    }
  }

  // Render Pincode Card State
  renderPincodeCard();

  // Toggle class on drawer depending on items count (for promo banners visibility in CSS)
  if (cartDrawer) {
    if (cart.length > 0) {
      cartDrawer.classList.add('has-items');
    } else {
      cartDrawer.classList.remove('has-items');
    }
  }

  // Start countdown timer for cart sale banner
  const countdownEl = document.getElementById('cart-countdown');
  if (countdownEl && !window._cartCountdownStarted) {
    window._cartCountdownStarted = true;
    let timeLeft = 11 * 3600 + 59 * 60 + 29; // 11h 59m 29s
    const tick = () => {
      if (timeLeft <= 0) return;
      const h = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
      const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
      const s = String(timeLeft % 60).padStart(2, '0');
      countdownEl.textContent = `${h}h : ${m}m : ${s}s`;
      timeLeft--;
    };
    tick();
    setInterval(tick, 1000);
  }

  // 2. Render Items & Banners
  if (itemsContainer) {
    itemsContainer.innerHTML = '';

    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state" style="text-align: center; padding: 60px 20px; color: #777;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom: 16px;"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; color: #333;">Your cart is empty</p>
          <p style="font-size: 0.9rem; margin-bottom: 24px; color: #888;">Add items to get started!</p>
          <a href="collection.html?collection=all" class="cart-shop-now-btn" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 24px; border-radius: 4px; font-weight: bold; text-decoration: none; font-size: 0.95rem;">Shop Our Collection</a>
        </div>`;
      if (subtotalEl) subtotalEl.textContent = '₹0.00';
      renderRecentlyViewed();
      return;
    }

    let subtotal = 0;
    let mrpTotal = 0;

    cart.forEach(item => {
      const itemNumericPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      subtotal += itemNumericPrice * item.qty;

      const product = PRODUCTS.find(p => p.id == item.id);
      const originalPrice = product && product.originalPrice ? parseFloat(product.originalPrice.replace(/[^0-9.]/g, '')) : itemNumericPrice * 2.18;
      mrpTotal += originalPrice * item.qty;

      const discountPct = originalPrice > itemNumericPrice ? Math.round(((originalPrice - itemNumericPrice) / originalPrice) * 100) : 54;

      const itemColor = item.color || 'Black';

      const savedDeliveryDate = localStorage.getItem('StyleXWear_deliveryDateStr');
      const deliveryStatusHtml = savedDeliveryDate ? `
        <div class="cart-item-delivery-status" style="margin-top: 8px; font-size: 0.78rem; font-weight: 800; color: #4b5563; display: flex; align-items: center; gap: 6px; border-top: 1px dashed #e2e8f0; padding-top: 6px; width: 100%;">
          <span style="font-size: 0.85rem;">🚚</span>
          <span>Delivery by <strong style="color: #111111;">${savedDeliveryDate}</strong></span>
        </div>
      ` : '';

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-card';
      itemRow.innerHTML = `
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-item-body">
          <button class="cart-item-x" data-id="${item.id}" data-size="${item.size}" data-color="${itemColor}" aria-label="Remove">✕</button>
          <div class="cart-item-price-row">
            <span class="cart-item-current-price">₹${formatPrice(itemNumericPrice)}</span>
            <span class="cart-item-original-price">₹${formatPrice(originalPrice)}</span>
            <span class="cart-item-discount-badge">${discountPct}% OFF</span>
          </div>
          <div class="cart-item-name">${item.title}</div>
          <div class="cart-item-meta">Details - ${item.size}, ${itemColor}</div>
          <div class="cart-item-controls">
            <div class="cart-item-size-selector-wrap" style="position: relative; display: inline-block;">
              <select class="cart-item-size-select" data-id="${item.id}" data-size="${item.size}" data-color="${itemColor}" style="font-size: 0.82rem; border: 1px solid #b5bac1; padding: 4px 22px 4px 10px; border-radius: 4px; color: #111111; font-weight: 800; background: #ffffff; appearance: none; -webkit-appearance: none; outline: none; cursor: pointer; font-family: inherit;">
                <option value="S" ${item.size === 'S' ? 'selected' : ''}>SIZE: S</option>
                <option value="M" ${item.size === 'M' ? 'selected' : ''}>SIZE: M</option>
                <option value="L" ${item.size === 'L' ? 'selected' : ''}>SIZE: L</option>
                <option value="XL" ${item.size === 'XL' ? 'selected' : ''}>SIZE: XL</option>
                <option value="XXL" ${item.size === 'XXL' ? 'selected' : ''}>SIZE: XXL</option>
              </select>
              <span style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 0.65rem; color: #111; pointer-events: none; font-weight: 800;">▾</span>
            </div>
            <div class="cart-item-qty-selector-wrap" style="position: relative; display: inline-block;">
              <select class="cart-item-qty-select" data-id="${item.id}" data-size="${item.size}" data-color="${itemColor}" style="font-size: 0.82rem; border: 1px solid #b5bac1; padding: 4px 22px 4px 10px; border-radius: 4px; color: #111111; font-weight: 800; background: #ffffff; appearance: none; -webkit-appearance: none; outline: none; cursor: pointer; font-family: inherit;">
                ${[1,2,3,4,5,6,7,8,9,10].map(val => `<option value="${val}" ${item.qty === val ? 'selected' : ''}>QTY: ${val}</option>`).join('')}
              </select>
              <span style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 0.65rem; color: #111; pointer-events: none; font-weight: 800;">▾</span>
            </div>
          </div>
          ${deliveryStatusHtml}
        </div>
      `;
      itemsContainer.appendChild(itemRow);
    });

    // Render summary breakdown card at the bottom of the list
    const bagDiscount = mrpTotal - subtotal;
    const summaryCard = document.createElement('div');
    summaryCard.className = 'cart-summary-breakdown';
    summaryCard.innerHTML = `
      <div class="cart-summary-total-header">
        <span>TOTAL (Incl. of all taxes)</span>
        <span class="summary-header-price">₹${formatPrice(subtotal)} ▾</span>
      </div>
      <div class="cart-summary-details-list">
        <div class="cart-summary-row">
          <span>Total MRP (Incl. Of Taxes)</span>
          <span>₹${formatPrice(mrpTotal)}</span>
        </div>
        <div class="cart-summary-row discount-row">
          <span>Bag Discount (Incl. of GST Benefit)</span>
          <span class="green-text">- ₹${formatPrice(bagDiscount)}</span>
        </div>
        <div class="cart-summary-row delivery-row">
          <span>Delivery Fee</span>
          <span class="green-text">FREE</span>
        </div>
      </div>
      <div class="cart-summary-banner-green">
        <span>Yayyy! You get <strong>FREE delivery</strong> on this order</span>
      </div>
    `;
    itemsContainer.appendChild(summaryCard);

    if (subtotalEl) subtotalEl.textContent = `₹${formatPrice(subtotal)}`;

    // Wire remove buttons
    itemsContainer.querySelectorAll('.cart-item-x').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id, btn.dataset.size, btn.dataset.color));
    });
    
    // Wire size dropdown changes
    itemsContainer.querySelectorAll('.cart-item-size-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        const oldSize = select.getAttribute('data-size');
        const color = select.getAttribute('data-color');
        const newSize = e.target.value;
        updateItemSize(id, oldSize, color, newSize);
      });
    });

    // Wire quantity dropdown changes
    itemsContainer.querySelectorAll('.cart-item-qty-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        const size = select.getAttribute('data-size');
        const color = select.getAttribute('data-color');
        const newQty = e.target.value;
        setCartItemQty(id, size, color, newQty);
      });
    });
    
    renderRecentlyViewed();
  }
}

function renderRecentlyViewed() {
  const section = document.getElementById('cart-recent-section');
  const grid = document.getElementById('cart-recent-grid');
  if (!section || !grid) return;

  const recentlyViewedIds = JSON.parse(localStorage.getItem('StyleXWear_recentlyViewed') || '[]');
  
  if (recentlyViewedIds.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  grid.innerHTML = '';

  // Get products from database and filter valid ones
  const recentProducts = recentlyViewedIds
    .map(id => PRODUCTS.find(p => p.id == id))
    .filter(Boolean)
    .slice(0, 4); // Display top 4 recently viewed products

  if (recentProducts.length === 0) {
    section.style.display = 'none';
    return;
  }

  recentProducts.forEach(prod => {
    const originalPriceNum = prod.originalPrice ? parseFloat(prod.originalPrice.replace(/[^0-9.]/g, '')) : 0;
    const currentPriceNum = parseFloat(prod.price.replace(/[^0-9.]/g, '')) || 0;
    const discountPct = originalPriceNum > currentPriceNum ? Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100) : 54;

    const card = document.createElement('div');
    card.className = 'cart-recent-card';
    card.innerHTML = `
      <div class="cart-recent-img-wrapper">
        <a href="product.html?product=${prod.handle}">
          <img src="${prod.images[0]}" alt="${prod.title}">
        </a>
        <button class="cart-recent-add-btn" data-id="${prod.id}"><i data-feather="shopping-bag"></i></button>
      </div>
      <div class="cart-recent-info">
        <div class="cart-recent-card-title"><a href="product.html?product=${prod.handle}">${prod.title}</a></div>
        <div class="cart-recent-price-row">
          <span class="cart-recent-current-price">₹${formatPrice(currentPriceNum)}</span>
          ${originalPriceNum > currentPriceNum ? `
            <span class="cart-recent-original-price">₹${formatPrice(originalPriceNum)}</span>
            <span class="cart-recent-discount-badge">${discountPct}% OFF</span>
          ` : ''}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  if (window.feather) {
    feather.replace();
  }

  // Quick Add handlers
  grid.querySelectorAll('.cart-recent-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      openGlobalSizePicker(id);
    });
  });
}

window.openGlobalSizePicker = function(productId) {
  const product = PRODUCTS.find(p => p.id == productId);
  if (!product) return;

  // Remove existing picker if any
  let picker = document.getElementById('global-size-picker-container');
  if (picker) picker.remove();

  // Create overlay container
  picker = document.createElement('div');
  picker.id = 'global-size-picker-container';
  picker.className = 'global-size-picker-overlay';
  
  const originalPriceNum = product.originalPrice ? parseFloat(product.originalPrice.replace(/[^0-9.]/g, '')) : 0;
  const currentPriceNum = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
  const discountPct = originalPriceNum > currentPriceNum ? Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100) : 54;

  picker.innerHTML = `
    <div class="global-size-picker-sheet" id="global-size-picker-sheet">
      <div class="picker-header">
        <img src="${product.images[0]}" alt="${product.title}" class="picker-thumb">
        <div class="picker-meta">
          <h4 class="picker-title">${product.title}</h4>
          <div class="picker-price-row">
            <span class="picker-current-price">₹${formatPrice(currentPriceNum)}</span>
            ${originalPriceNum > currentPriceNum ? `
              <span class="picker-original-price">₹${formatPrice(originalPriceNum)}</span>
              <span class="picker-discount-badge discount-green">${discountPct}% OFF</span>
            ` : ''}
          </div>
        </div>
        <button class="picker-close-btn" id="picker-close-btn">&times;</button>
      </div>
      <div class="picker-body">
        <div class="picker-section-label">Select Size</div>
        <div class="picker-sizes-grid">
          ${['S', 'M', 'L', 'XL', 'XXL'].map(size => `<button class="picker-size-btn" data-size="${size}">${size}</button>`).join('')}
        </div>
        <button id="picker-confirm-btn" class="picker-confirm-btn" disabled>SELECT A SIZE</button>
      </div>
    </div>
  `;

  document.body.appendChild(picker);

  // Trigger active class
  setTimeout(() => {
    picker.classList.add('active');
  }, 10);

  // Bind close buttons
  const closeBtn = picker.querySelector('#picker-close-btn');
  const closePicker = () => {
    picker.classList.remove('active');
    setTimeout(() => {
      picker.remove();
    }, 350);
  };
  
  if (closeBtn) closeBtn.addEventListener('click', closePicker);
  picker.addEventListener('click', (e) => {
    if (e.target === picker) closePicker();
  });

  // Bind size options selection
  let selectedSize = null;
  const sizeBtns = picker.querySelectorAll('.picker-size-btn');
  const confirmBtn = picker.querySelector('#picker-confirm-btn');

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.getAttribute('data-size');
      
      if (confirmBtn) {
        confirmBtn.removeAttribute('disabled');
        confirmBtn.textContent = 'ADD TO BAG';
        confirmBtn.classList.add('ready');
      }
    });
  });

  // Bind confirm button
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (!selectedSize) return;
      addToCart(product.id, selectedSize, true, 'Black', 1);
      closePicker();
    });
  }
}

// Global Wishlist Helpers
function getWishlist() {
  return JSON.parse(localStorage.getItem('StyleXWear_wishlist') || '[]');
}

function toggleWishlist(handle) {
  let wishlist = getWishlist();
  const isAdded = !wishlist.includes(handle);
  if (wishlist.includes(handle)) {
    wishlist = wishlist.filter(h => h !== handle);
  } else {
    wishlist.push(handle);
  }
  localStorage.setItem('StyleXWear_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();

  // Sync to database
  const currentUser = JSON.parse(localStorage.getItem('StyleXWear_currentUser'));
  if (currentUser) {
    const users = JSON.parse(localStorage.getItem('StyleXWear_users') || '[]');
    const userIndex = users.findIndex(u => (u.email && u.email === currentUser.email) || (u.phone && u.phone === currentUser.phone));
    if (userIndex !== -1) {
      users[userIndex].wishlist = wishlist;
      localStorage.setItem('StyleXWear_users', JSON.stringify(users));
    }
  }

  // Log to Audit Logs
  const product = PRODUCTS.find(p => p.handle === handle);
  const title = product ? product.title : handle;
  const actor = currentUser ? `${currentUser.name} (${currentUser.email || currentUser.phone})` : 'Guest';
  logSystemEvent(actor, 'Wishlist Activity', `${isAdded ? 'Added' : 'Removed'} "${title}" ${isAdded ? 'to' : 'from'} wishlist`);
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
      <div class="search-result-image">
        <a href="product.html?product=${product.handle}"><img src="${product.images[0]}" alt="${product.title}"></a>
      </div>
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
  
  // Wire up wishlist removal click
  itemsContainer.querySelectorAll('.remove-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const handle = btn.getAttribute('data-handle');
      toggleWishlist(handle);
      
      // Update matching product card heart styling if on homepage
      const homepageHeart = document.querySelector(`.wishlist-icon-btn[data-handle="${handle}"]`);
      if (homepageHeart) homepageHeart.classList.remove('active');
      
      // If on details page of this product, update heart button
      const detailsPageHeart = document.getElementById('product-wishlist-toggle');
      if (detailsPageHeart && window.location.search.includes(handle)) {
        detailsPageHeart.classList.remove('active');
      }
    });
  });
}

/* -------------------------------------------------------------
 * 8. Search Functionality
 * ------------------------------------------------------------- */
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
    
    const matched = PRODUCTS.filter(p => 
      p.title.toLowerCase().includes(query) || 
      (p.category && p.category.toLowerCase().includes(query)) ||
      p.description.toLowerCase().includes(query)
    );
    
    if (matched.length === 0) {
      resultsContainer.innerHTML = '<div class="cart-empty-message">No products found matching your search.</div>';
      return;
    }
    
    matched.forEach(prod => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      
      item.innerHTML = `
        <div class="search-result-image">
          <a href="product.html?product=${prod.handle}"><img src="${prod.images[0]}" alt="${prod.title}"></a>
        </div>
        <div class="search-result-info">
          <a href="product.html?product=${prod.handle}" class="search-result-title">${prod.title}</a>
          <span class="search-result-price" style="margin-top:4px;">${prod.price}</span>
        </div>
      `;
      
      resultsContainer.appendChild(item);
    });
  });
}

/* -------------------------------------------------------------
 * 9. Intersection Observer for Scroll Reveals
 * ------------------------------------------------------------- */
function initScrollReveals() {
  // Disabled completely to ensure standard native browser scrolling with zero layout shifts or delays
  return;
}

/* -------------------------------------------------------------
 * 10. Newsletter Discount Modal Popup (DISABLED)
 * ------------------------------------------------------------- */
function initNewsletterModal() {
  // Popup permanently disabled
  return;
}

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

/* =====================================================
 * QIKINK CHECKOUT INTEGRATION
 * =====================================================
 * HOW TO GO LIVE:
 * 1. Replace QIKINK_CLIENT_ID with your real Client ID from Qikink dashboard
 * 2. Replace QIKINK_ACCESS_TOKEN with your live access token
 * 3. Change QIKINK_API_URL to 'https://api.qikink.com/api/order/create'
 * 4. Add your Qikink product IDs to QIKINK_PRODUCT_MAP
 * ===================================================== */
const QIKINK_CONFIG = {
  CLIENT_ID: '280149031396200',
  ACCESS_TOKEN: 'ce56a8d6f9c8bb524f0ac7a42aceacdf837977e96ec2c5bd01290e3dcdd',
  API_URL: 'https://sandbox.qikink.com/api/order/create',
  PRODUCT_MAP: {
    '10884046586049': 'QIKINK_PROD_ID_1',
    '10898589188289': 'QIKINK_PROD_ID_2',
    '10951655620801': 'QIKINK_PROD_ID_3',
  }
};
// StyleX Coins & Referral Rewards utility functions
function getUserCoins() {
  const currentUser = JSON.parse(localStorage.getItem('StyleXWear_currentUser'));
  if (!currentUser) return 0;
  
  const users = JSON.parse(localStorage.getItem('StyleXWear_users') || '[]');
  const userIndex = users.findIndex(u => (u.email && u.email === currentUser.email) || (u.phone && u.phone === currentUser.phone));
  if (userIndex !== -1) {
    let coins = users[userIndex].coins;
    if (isNaN(coins) || coins === null || coins === undefined) {
      coins = 50; // Welcome signup bonus correction fallback
      users[userIndex].coins = coins;
      localStorage.setItem('StyleXWear_users', JSON.stringify(users));
      
      // Update session reference too
      currentUser.coins = coins;
      localStorage.setItem('StyleXWear_currentUser', JSON.stringify(currentUser));
    }
    return coins;
  }
  return 0;
}

function updateHeaderCoins() {
  const currentUser = JSON.parse(localStorage.getItem('StyleXWear_currentUser'));
  const coinsDisplay = document.getElementById('header-coins-display');
  const coinsCount = document.getElementById('header-coins-count');

  if (coinsDisplay) {
    coinsDisplay.style.display = 'none';
  }
}

function updateCheckoutTotal() {
  const cart = getCart();
  const cartTotal = cart.reduce((sum, item) => {
    return sum + (parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0) * item.qty;
  }, 0);

  const selectedRadio = document.querySelector('input[name="qk-payment-method"]:checked');
  const isCodOwner = selectedRadio && selectedRadio.value === 'COD_OWNER';
  const isStandardCod = selectedRadio && selectedRadio.value === 'COD';
  
  let extraFee = 0;
  if (isCodOwner) {
    extraFee = 20000;
  } else if (isStandardCod) {
    // 5% percentage-based charge of cloth price/cart total, capped between ₹40 and ₹100
    const calculatedCod = Math.round(cartTotal * 0.05);
    extraFee = Math.max(40, Math.min(100, calculatedCod));
  }
  const extraFeeLabel = isCodOwner ? 'Owner Delivery Fee' : 'COD Handling Fee';

  // Calculate discount from coins
  let discount = 0;
  const useCoinsCheckbox = document.getElementById('qk-use-coins');
  if (useCoinsCheckbox && useCoinsCheckbox.checked) {
    const userCoins = getUserCoins();
    discount = 0;
  }

  // Calculate discount from coupon code
  let couponDeduct = 0;
  if (window.couponDiscount && window.couponDiscount > 0) {
    couponDeduct = Math.round(cartTotal * window.couponDiscount);
  }

  // Calculate MRP Total & Product Discount dynamically based on PRODUCTS database
  let mrpTotal = 0;
  cart.forEach(item => {
    const prod = PRODUCTS.find(p => p.id === item.id);
    const saleNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    // Fallback to 2.18 multiplier (54% off) if no original price found
    const origNum = prod && prod.originalPrice ? (parseFloat(prod.originalPrice.replace(/[^0-9.]/g, '')) || 0) : Math.round(saleNum * 2.18);
    mrpTotal += origNum * item.qty;
  });

  const productDiscount = mrpTotal - cartTotal;
  const finalPrice = Math.max(0, cartTotal + extraFee - discount - couponDeduct);
  
  // Store values temporarily for payment API reference
  localStorage.setItem('StyleXWear_tempCoinsUsed', '0');
  localStorage.setItem('StyleXWear_tempFinalPrice', finalPrice.toString());

  // Render detailed discount breakdown
  const breakdownEl = document.getElementById('qk-breakdown-details');
  if (breakdownEl) {
    breakdownEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-weight: 500;">
        <span>Bag Total (MRP)</span>
        <span style="color: #111111;">₹${formatPrice(mrpTotal)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: 700; color: #00b050;">
        <span>Product Discount</span>
        <span>- ₹${formatPrice(productDiscount)}</span>
      </div>
      ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between; font-weight: 700; color: #7c3aed;">
          <span>Coins Applied</span>
          <span>- ₹${formatPrice(discount)}</span>
        </div>
      ` : ''}
      ${couponDeduct > 0 ? `
        <div style="display: flex; justify-content: space-between; font-weight: 700; color: #15803d;">
          <span>Coupon Discount (10% off)</span>
          <span>- ₹${formatPrice(couponDeduct)}</span>
        </div>
      ` : ''}
      ${extraFee > 0 ? `
        <div style="display: flex; justify-content: space-between; font-weight: 700; color: #ef4444;">
          <span>${extraFeeLabel}</span>
          <span>+ ₹${formatPrice(extraFee)}</span>
        </div>
      ` : ''}
    `;
  }

  document.getElementById('qk-total-display').textContent = `₹${formatPrice(finalPrice)}`;
}

function applyPurchaseRewards(subtotal, coinsUsed) {
  const currentUser = JSON.parse(localStorage.getItem('StyleXWear_currentUser'));
  if (!currentUser) return;

  const users = JSON.parse(localStorage.getItem('StyleXWear_users') || '[]');
  const userIndex = users.findIndex(u => u.email === currentUser.email || u.phone === currentUser.phone);
  if (userIndex === -1) return;

  // 1. Deduct used coins immediately
  let currentCoins = users[userIndex].coins || 0;
  currentCoins = Math.max(0, currentCoins - coinsUsed);

  // Save changes
  users[userIndex].coins = currentCoins;
  localStorage.setItem('StyleXWear_users', JSON.stringify(users));

  // Update active session reference
  currentUser.coins = currentCoins;
  localStorage.setItem('StyleXWear_currentUser', JSON.stringify(currentUser));
  updateHeaderCoins();
}

function initQikinkCheckout() {
  const overlay   = document.getElementById('qikink-checkout-overlay');
  const closeBtn  = document.getElementById('qk-modal-close');
  const form      = document.getElementById('qk-checkout-form');
  const placeBtn  = document.getElementById('qk-place-btn');
  const doneBtn   = document.getElementById('qk-done-btn');
  const retryBtn  = document.getElementById('qk-retry-btn');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!overlay || !checkoutBtn) return;

  // Helper: switch steps
  function showStep(id) {
    document.querySelectorAll('.qk-step').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // Globally expose checkout flow trigger to support direct onclick attribute
  window.triggerCheckoutFlow = function() {
    const overlay = document.getElementById('qikink-checkout-overlay');
    if (!overlay) return;

    // Force user login validation check before checkout flow
    const currentUser = localStorage.getItem('StyleXWear_currentUser');
    if (!currentUser) {
      localStorage.setItem('StyleXWear_redirectAfterLogin', 'checkout');
      localStorage.setItem('StyleXWear_redirectReferrer', window.location.href);
      location.href = 'account.html';
      return;
    }

    const cart = getCart();
    if (!cart.length) return;

    // Build order summary
    const summaryEl = document.getElementById('qk-order-summary');
    let total = 0;
    summaryEl.innerHTML = cart.map(item => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      total += price * item.qty;
      
      const isLastItem = cart.length === 1;

      return `
        <div class="qk-summary-item" data-handle="${item.handle}" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1.5px solid #e2e8f0; padding: 12px 4px; transition: background 0.2s ease;">
          
          <!-- Product image & title info -->
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; cursor: pointer;" class="qk-summary-item-trigger">
            <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 64px; border-radius: 6px; object-fit: cover; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; flex-shrink: 0;">
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
              <span style="font-size: 0.9rem; font-weight: 800; color: #18181b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; text-transform: uppercase; letter-spacing: 0.02em;">${item.title}</span>
              <span style="font-size: 0.8rem; color: #71717a; font-weight: 700;">₹${formatPrice(price)} each</span>
            </div>
          </div>

          <!-- Controls: Size Select & Qty Controls -->
          <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;" onclick="event.stopPropagation();">
            
            <!-- Size selector dropdown (3D Neo-brutalist Box) -->
            <select class="qk-summary-size-select" data-id="${item.id}" data-size="${item.size}" data-color="${item.color || 'Black'}" style="padding: 3px 6px; background: #ffffff; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; border-radius: 4px; color: #18181b; font-size: 0.8rem; font-weight: 800; cursor: pointer; outline: none; font-family: inherit; -webkit-appearance: none; padding-right: 18px; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22><path d=%22M0 3l5 5 5-5z%22/></svg>'); background-repeat: no-repeat; background-position: right 6px center;">
              <option value="S" ${item.size === 'S' ? 'selected' : ''}>S</option>
              <option value="M" ${item.size === 'M' ? 'selected' : ''}>M</option>
              <option value="L" ${item.size === 'L' ? 'selected' : ''}>L</option>
              <option value="XL" ${item.size === 'XL' ? 'selected' : ''}>XL</option>
              <option value="XXL" ${item.size === 'XXL' ? 'selected' : ''}>XXL</option>
            </select>

            <!-- Quantity Selector controls (3D Neo-brutalist Box) -->
            <div style="display: inline-flex; align-items: center; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; border-radius: 4px; background: #ffffff; overflow: hidden; height: 26px;">
              <button type="button" class="qk-summary-qty-btn dec" data-id="${item.id}" data-size="${item.size}" data-color="${item.color || 'Black'}" style="width: 22px; height: 100%; border: none; background: none; color: #000000; font-size: 0.9rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none;">-</button>
              <span style="font-size: 0.85rem; font-weight: 800; color: #000000; width: 20px; text-align: center;">${item.qty}</span>
              <button type="button" class="qk-summary-qty-btn inc" data-id="${item.id}" data-size="${item.size}" data-color="${item.color || 'Black'}" style="width: 22px; height: 100%; border: none; background: none; color: #000000; font-size: 0.9rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none;">+</button>
            </div>

          </div>

          <!-- Price & Cut Button -->
          <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end; width: 95px; flex-shrink: 0;" onclick="event.stopPropagation();">
            <span style="font-weight: 900; color: #18181b; font-size: 0.95rem;">₹${formatPrice(price * item.qty)}</span>
            
            ${isLastItem ? `
              <button type="button" disabled title="Cannot remove last product" style="background: none; border: none; color: #a1a1aa; font-size: 1.35rem; font-weight: 900; cursor: not-allowed; padding: 2px 4px; outline: none; display: flex; align-items: center; justify-content: center; opacity: 0.3;">×</button>
            ` : `
              <button type="button" class="qk-summary-remove-btn" data-id="${item.id}" data-size="${item.size}" data-color="${item.color || 'Black'}" title="Remove Item" style="background: none; border: none; color: #ef4444; font-size: 1.35rem; font-weight: 900; cursor: pointer; padding: 2px 4px; outline: none; display: flex; align-items: center; justify-content: center; transition: transform 0.1s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">×</button>
            `}
          </div>

        </div>
      `;
    }).join('');

    // Wire events:
    // 1. Click on item triggers product detail overlay
    summaryEl.querySelectorAll('.qk-summary-item-trigger').forEach(el => {
      el.addEventListener('click', () => {
        const itemEl = el.closest('.qk-summary-item');
        const handle = itemEl ? itemEl.dataset.handle : null;
        if (handle) openCheckoutProductDetail(handle);
      });
    });

    // 2. Change Size Select
    summaryEl.querySelectorAll('.qk-summary-size-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        const oldSize = select.getAttribute('data-size');
        const color = select.getAttribute('data-color');
        const newSize = e.target.value;
        updateItemSize(id, oldSize, color, newSize);
        window.triggerCheckoutFlow();
        updateCheckoutTotal();
      });
    });

    // 3. Qty Controls
    summaryEl.querySelectorAll('.qk-summary-qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const size = btn.getAttribute('data-size');
        const color = btn.getAttribute('data-color');
        const delta = btn.classList.contains('inc') ? 1 : -1;
        updateQty(id, size, color, delta);
        window.triggerCheckoutFlow();
        updateCheckoutTotal();
      });
    });

    // 4. Remove Item Click
    summaryEl.querySelectorAll('.qk-summary-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const size = btn.getAttribute('data-size');
        const color = btn.getAttribute('data-color');
        removeFromCart(id, size, color);
        window.triggerCheckoutFlow();
        updateCheckoutTotal();
      });
    });

    // Automatically compute and update breakdown display totals
    updateCheckoutTotal();

    // Populate coins balance quick-checkout check option
    const userCoins = getUserCoins();
    const coinsContainer = document.getElementById('qk-coins-container');
    const useCoinsCheckbox = document.getElementById('qk-use-coins');

    if (coinsContainer) {
      if (userCoins > 0) {
        coinsContainer.style.display = 'block';
        document.getElementById('qk-coins-balance-text').textContent = `Available Balance: ${userCoins} Coins (₹${userCoins}.00)`;
        if (useCoinsCheckbox) {
          useCoinsCheckbox.checked = false; // Reset by default
        }
      } else {
        coinsContainer.style.display = 'none';
      }
    }

    // Bind checkbox change to update price display
    if (useCoinsCheckbox) {
      useCoinsCheckbox.onchange = () => {
        updateCheckoutTotal();
      };
    }

    // Set initial total correctly with potential default coin checked states
    updateCheckoutTotal();
    
    // Set default selection state style
    document.querySelectorAll('.qk-payment-option').forEach(opt => {
      opt.classList.remove('active');
    });
    const defaultRadio = document.querySelector('input[name="qk-payment-method"]:checked');
    if (defaultRadio) {
      defaultRadio.closest('.qk-payment-option').classList.add('active');
    }

    showStep('qk-step-form');

    // Close cart drawer
    document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
    document.getElementById('page-overlay')?.classList.remove('active');

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  // Open modal when Checkout clicked
  checkoutBtn.addEventListener('click', () => {
    window.triggerCheckoutFlow();
  });

  // Dynamic selector click handling & price calculation updating
  document.querySelectorAll('input[name="qk-payment-method"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      // Toggle CSS selection classes
      document.querySelectorAll('.qk-payment-option').forEach(opt => {
        opt.classList.remove('active');
      });
      e.target.closest('.qk-payment-option').classList.add('active');

      updateCheckoutTotal();
    });
  });

  // Close modal
  const closeModal = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Done / Retry / Track buttons
  const trackBtn = document.getElementById('qk-track-btn');
  trackBtn?.addEventListener('click', () => { closeModal(); clearCart(); updateCartUI(); });
  doneBtn?.addEventListener('click', () => { closeModal(); clearCart(); updateCartUI(); window.location.href = 'index.html'; });
  retryBtn?.addEventListener('click', () => showStep('qk-step-form'));

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate fields
    const fields = ['qk-name','qk-phone','qk-address','qk-city','qk-state','qk-pincode'];
    let valid = true;
    fields.forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('error');
      if (!el.value.trim()) { el.classList.add('error'); valid = false; }
    });

    const phone = document.getElementById('qk-phone').value.trim();
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      document.getElementById('qk-phone').classList.add('error');
      valid = false;
    }

    const pincode = document.getElementById('qk-pincode').value.trim();
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      document.getElementById('qk-pincode').classList.add('error');
      valid = false;
    }

    if (!valid) return;

    // Collect customer info
    const customerName  = document.getElementById('qk-name').value.trim();
    const customerPhone = document.getElementById('qk-phone').value.trim();
    const customerAddr  = document.getElementById('qk-address').value.trim();
    const customerCity  = document.getElementById('qk-city').value.trim();
    const customerState = document.getElementById('qk-state').value.trim();
    const customerPin   = document.getElementById('qk-pincode').value.trim();

    // Build cart totals
    const cart = getCart();
    const cartTotal = cart.reduce((sum, item) => {
      return sum + (parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0) * item.qty;
    }, 0);

    const selectedPaymentMethod = document.querySelector('input[name="qk-payment-method"]:checked').value;
    const isCodOwner = selectedPaymentMethod === 'COD_OWNER';
    const isStandardCod = selectedPaymentMethod === 'COD';
    
    let extraFee = 0;
    if (isCodOwner) {
      extraFee = 20000;
    } else if (isStandardCod) {
      // 5% percentage-based charge of cloth price/cart total, capped between ₹40 and ₹100
      const calculatedCod = Math.round(cartTotal * 0.05);
      extraFee = Math.max(40, Math.min(100, calculatedCod));
    }
    const coinsUsed = document.getElementById('qk-use-coins')?.checked ? parseFloat(localStorage.getItem('StyleXWear_tempCoinsUsed') || '0') : 0;
    const total = Math.max(0, cartTotal + extraFee - coinsUsed);

    const orderNumber = `SXW-${Date.now()}`;

    // Helper to save order details locally for user status tracking
    function saveOrderToLocalStorage(orderId, orderItems) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('StyleXWear_currentUser'));
        const userRef = currentUser ? (currentUser.email || currentUser.phone) : 'guest';

        const newOrder = {
          orderId: orderId,
          userRef: userRef,
          status: 'In Transit',
          date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          subtotal: cartTotal,
          coinsUsed: coinsUsed,
          pendingRewards: {
            buyerRef: userRef,
            referrerRef: localStorage.getItem('StyleXWear_activeReferrer') || null,
            subtotal: cartTotal
          },
          items: orderItems.map(item => ({
            title: item.title,
            size: item.size,
            color: item.color || 'Black',
            qty: item.qty,
            price: item.price,
            image: item.image
          }))
        };
        const savedOrders = JSON.parse(localStorage.getItem('StyleXWear_orders') || '[]');
        savedOrders.push(newOrder);
        localStorage.setItem('StyleXWear_orders', JSON.stringify(savedOrders));

        // Log to Audit Logs
        const actor = currentUser ? `${currentUser.name} (${currentUser.email || currentUser.phone})` : 'Guest';
        logSystemEvent(actor, 'Order Checkout Success', `Successfully placed Order #${orderId} for ₹${formatPrice(cartTotal)}`);
      } catch (e) {
        console.error('[Save Order LocalStorage Error]', e);
      }
    }

    // Helper to send order payload directly to Qikink (used for COD and after successful Online payment)
    async function sendOrderToQikink(payload) {
      try {
        const response = await fetch('/api/create-qikink-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('[Qikink Response]', data);

        if (response.ok && (data.success || data.order_id || data.status === 'success')) {
          saveOrderToLocalStorage(data.order_id || orderNumber, cart);
          
          document.getElementById('qk-success-msg').textContent =
            `Order #${data.order_id || orderNumber} confirmed successfully! We'll contact you soon. 🎉`;
          showStep('qk-step-success');
          applyPurchaseRewards(cartTotal, coinsUsed);
          clearCart();
          updateCartUI();
        } else {
          // Log exact API response and alert details for testing debugging
          console.error('[Qikink Sync Failed]', data);
          const errorMsg = data.message || data.error || (data.errors ? JSON.stringify(data.errors) : 'Unknown Qikink API Error');
          alert(`[QIKINK INTEGRATION ERROR]\nOrder created locally in browser, but Qikink API rejected it.\n\nReason: ${errorMsg}\n\nCheck browser Console tab for full payload debug logs.`);

          saveOrderToLocalStorage(orderNumber, cart);
          
          document.getElementById('qk-success-msg').textContent =
            `Order #${orderNumber} received! We will process it shortly.`;
          showStep('qk-step-success');
          applyPurchaseRewards(cartTotal, coinsUsed);
          clearCart();
          updateCartUI();
        }
      } catch (err) {
        console.error('[Qikink Error]', err);
        alert(`[QIKINK NETWORK ERROR]\nCould not connect to Qikink server.\n\nDetails: ${err.message}`);
        saveOrderToLocalStorage(orderNumber, cart);
        
        document.getElementById('qk-success-msg').textContent =
          `Order #${orderNumber} received! We will confirm it shortly.`;
        showStep('qk-step-success');
        applyPurchaseRewards(cartTotal, coinsUsed);
        clearCart();
        updateCartUI();
      }
    }

    // ── STEP 1: Process Payment choice ──
    // ── STEP 1: Process Payment choice ──
    if (selectedPaymentMethod === 'COD') {
      // Standard Cash on Delivery (COD): bypass Razorpay gateway, dispatch directly to Qikink
      showStep('qk-step-loading');
      
      const line_items = cart.map(item => ({
        product_id: QIKINK_CONFIG.PRODUCT_MAP[item.id] || item.id,
        size: item.size,
        quantity: item.qty,
        color: item.color || 'Black'
      }));

      const orderPayload = {
        order_number: orderNumber,
        qikink_shipping: 1, // Qikink ships standard courier
        gateway: 'COD',    // COD payment method
        total_order_value: Math.round(total),
        line_items,
        shipping_address: {
          name:    customerName,
          address: customerAddr,
          city:    customerCity,
          state:   customerState,
          pincode: customerPin,
          phone:   customerPhone,
          country: 'India'
        }
      };

      await sendOrderToQikink(orderPayload);
    } else {
      // ONLINE PAYMENT (Razorpay) - for Standard Courier (Prepaid) and Delivery by Owner
      showStep('qk-step-loading');
      
      try {
        // 1. Fetch Razorpay Public Key ID securely
        const keyRes = await fetch('/api/razorpay-key');
        const { keyId } = await keyRes.json();
        
        if (!keyId) {
          throw new Error('Could not retrieve payment credentials.');
        }

        // 2. Create Order on Razorpay backend (amount in paise, min 100 paise)
        const totalPaise = Math.round(total * 100);
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPaise,
            currency: 'INR',
            receipt: `receipt_${orderNumber}`
          })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.order_id) {
          throw new Error(orderData.error || 'Failed to create payment order.');
        }

        // 3. Configure Razorpay Standard Checkout options
        const rzpOptions = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'StyleXWear',
          description: `Order ${orderNumber}`,
          image: 'stylexwear_logo.png',
          order_id: orderData.order_id, // SECURE ORDER ID FROM BACKEND!
          prefill: {
            name:    customerName,
            contact: customerPhone,
          },
          notes: {
            address: `${customerAddr}, ${customerCity}, ${customerState} - ${customerPin}`
          },
          theme: { color: '#7c3aed' },

          handler: async function(paymentResponse) {
            console.log('[Razorpay Payment Success]', paymentResponse);
            overlay.classList.add('open');
            showStep('qk-step-loading');

            try {
              // 4. Verify payment signature securely on backend
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature
                })
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.error || 'Signature verification failed');
              }

              // 5. Send order payload to Qikink after successful verification
              const line_items = cart.map(item => ({
                product_id: QIKINK_CONFIG.PRODUCT_MAP[item.id] || item.id,
                size: item.size,
                quantity: item.qty,
                color: item.color || 'Black'
              }));

              const orderPayload = {
                order_number: orderNumber,
                qikink_shipping: isCodOwner ? 0 : 1, // 0 = Owner ships (self delivery), 1 = Qikink ships
                gateway: 'PREPAID',
                total_order_value: Math.round(total),
                payment_id: paymentResponse.razorpay_payment_id,
                line_items,
                shipping_address: {
                  name:    customerName,
                  address: customerAddr,
                  city:    customerCity,
                  state:   customerState,
                  pincode: customerPin,
                  phone:   customerPhone,
                  country: 'India'
                }
              };

              await sendOrderToQikink(orderPayload);

            } catch (verifyErr) {
              console.error('[Payment Verification Failed]', verifyErr);
              overlay.classList.add('open');
              document.getElementById('qk-error-msg').textContent =
                `Payment verification failed: ${verifyErr.message}. Please contact support.`;
              showStep('qk-step-error');
              placeBtn.disabled = false;
            }
          },

          modal: {
            ondismiss: function() {
              overlay.classList.add('open');
              placeBtn.disabled = false;
              showStep('qk-step-form');
            }
          }
        };

        const rzp = new Razorpay(rzpOptions);
        
        rzp.on('payment.failed', function(response) {
          console.error('[Razorpay Failed]', response.error);
          overlay.classList.add('open');
          document.getElementById('qk-error-msg').textContent =
            `Payment failed: ${response.error.description}. Please try again.`;
          showStep('qk-step-error');
          placeBtn.disabled = false;
        });

        overlay.classList.remove('open');
        rzp.open();

      } catch (err) {
        console.error('[Razorpay Init Error]', err);
        overlay.classList.add('open');
        document.getElementById('qk-error-msg').textContent =
          `Failed to initiate payment: ${err.message}. Please try again.`;
        showStep('qk-step-error');
        placeBtn.disabled = false;
      }
    }
  });
}

// Helper: clear cart
function clearCart() {
  localStorage.removeItem('StyleXWear_cart');
  updateCartUI();
}

/* =====================================================
 * RAZORPAY CONFIG
 * =====================================================
 * HOW TO GO LIVE:
 * 1. Sign up at razorpay.com
 * 2. Dashboard → Settings → API Keys → Generate Key
 * 3. Replace KEY_ID below with your actual key
 * ===================================================== */
const RAZORPAY_CONFIG = {
  KEY_ID: 'rzp_test_TBumKQiNoHhr9F'
};

function renderPincodeCard() {
  const container = document.getElementById('cart-pincode-container');
  if (!container) return;

  const savedPincode = localStorage.getItem('StyleXWear_savedPincode');
  
  if (!savedPincode) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; width: 100%; justify-content: space-between; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="2" style="flex-shrink: 0;"><path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style="font-size: 0.82rem; color: #4b5563; font-weight: 700;">Enter Pincode to check delivery date</span>
        </div>
        <button id="cart-pincode-check-trigger-btn" style="background: none; border: none; color: #7c3aed; font-weight: 900; font-size: 0.82rem; cursor: pointer; text-transform: uppercase;">CHECK</button>
      </div>
      <div id="cart-pincode-input-area" style="display: none; align-items: center; gap: 8px; width: 100%; margin-top: 10px; border-top: 1px solid #f3f4f6; padding-top: 10px;">
        <input type="tel" id="cart-pincode-field" placeholder="Enter 6-digit Pincode" maxlength="6" style="flex-grow: 1; padding: 6px 12px; border: 1px solid #b5bac1; border-radius: 6px; font-size: 0.85rem; outline: none; background: #ffffff; color: #111111; font-weight: 700;">
        <button id="cart-pincode-submit-btn" style="background: #7c3aed; color: #ffffff; border: none; padding: 6px 16px; border-radius: 6px; font-size: 0.82rem; font-weight: 800; cursor: pointer;">SUBMIT</button>
      </div>
      <div id="cart-pincode-error-msg" style="display: none; color: #ef4444; font-size: 0.74rem; font-weight: 700; margin-top: 6px;">Invalid pincode. Enter 6 digits.</div>
    `;

    // Bind CHECK trigger click
    const checkTrigger = document.getElementById('cart-pincode-check-trigger-btn');
    const inputArea = document.getElementById('cart-pincode-input-area');
    if (checkTrigger && inputArea) {
      checkTrigger.addEventListener('click', () => {
        if (inputArea.style.display === 'none') {
          inputArea.style.display = 'flex';
          const fld = document.getElementById('cart-pincode-field');
          if (fld) fld.focus();
        } else {
          inputArea.style.display = 'none';
        }
      });
    }

    // Bind SUBMIT button click
    const submitBtn = document.getElementById('cart-pincode-submit-btn');
    const field = document.getElementById('cart-pincode-field');
    const errorMsg = document.getElementById('cart-pincode-error-msg');
    
    const submitPincode = () => {
      const val = field.value.trim();
      if (!/^\d{6}$/.test(val)) {
        if (errorMsg) errorMsg.style.display = 'block';
        return;
      }
      
      let days = 4;
      const firstDigit = val[0];
      if (firstDigit === '1' || firstDigit === '2') days = 2; // North
      else if (firstDigit === '4' || firstDigit === '3') days = 3; // West/South
      else days = 5;

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      const dateStr = deliveryDate.toLocaleDateString('en-IN', options);

      localStorage.setItem('StyleXWear_savedPincode', val);
      localStorage.setItem('StyleXWear_deliveryDateStr', dateStr);

      // Re-render and update UI
      renderPincodeCard();
      updateCartUI();
    };

    if (submitBtn && field) {
      submitBtn.addEventListener('click', submitPincode);
      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitPincode();
      });
    }
  } else {
    // State 2: Pincode Saved
    container.innerHTML = `
      <div style="display: flex; align-items: center; width: 100%; justify-content: space-between; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="2.5" style="flex-shrink: 0;"><path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style="font-size: 0.85rem; color: #1f2937; font-weight: 700;">Deliver to: <strong style="color: #000000; font-weight: 900; font-size: 0.9rem;">${savedPincode}</strong></span>
        </div>
        <button id="cart-pincode-change-trigger-btn" style="background: none; border: none; color: #7c3aed; font-weight: 900; font-size: 0.85rem; cursor: pointer; text-transform: uppercase;">CHANGE</button>
      </div>
    `;

    // Bind CHANGE trigger click
    const changeTrigger = document.getElementById('cart-pincode-change-trigger-btn');
    if (changeTrigger) {
      changeTrigger.addEventListener('click', () => {
        localStorage.removeItem('StyleXWear_savedPincode');
        localStorage.removeItem('StyleXWear_deliveryDateStr');
        // Re-render and update UI
        renderPincodeCard();
        updateCartUI();
      });
    }
  }
}

function initCartPincode() {
  renderPincodeCard();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initQikinkCheckout();
  initCartPincode();

  // Auto open cart drawer if query parameter is present (used for post-auth redirections)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('openCart') === 'true') {
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('page-overlay');
    if (cartDrawer && overlay) {
      cartDrawer.classList.add('open');
      overlay.classList.add('active');
    }
    // Clean URL parameters cleanly
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
  }
});

/* =====================================================
 * COPIER / SHARE CLIPBOARD UTILITY
 * ===================================================== */
window.shareProductLink = function(e, handle, title) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  
  // Calculate dynamic product details URL
  const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace('product.html', '');
  const url = baseUrl + 'product.html?product=' + handle;
  
  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      const success = document.execCommand('copy');
      document.body.removeChild(el);
      return success ? Promise.resolve() : Promise.reject();
    }
  };

  copyToClipboard(url).then(() => {
    showStorefrontToast(`Copied share link for "${title}" to clipboard!`);
  }).catch(() => {
    showStorefrontToast(`Failed to copy link.`, true);
  });
};

function showStorefrontToast(message, isError = false) {
  let container = document.getElementById('storefront-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'storefront-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: rgba(15, 15, 25, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${isError ? 'rgba(255, 69, 58, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${isError ? '#ff453a' : '#fff'};
    border-radius: 99px;
    padding: 12px 24px;
    font-size: 0.85rem;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    opacity: 0;
    transform: translateY(15px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
    text-align: center;
  `;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ── AUDIT TELEMETRY LOGS SYSTEM ──
function logSystemEvent(actor, action, details = '—') {
  const logs = JSON.parse(localStorage.getItem('StyleXWear_auditLogs') || '[]');
  const entry = {
    timestamp: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    actor: actor,
    action: action,
    details: details,
    ip: '192.168.1.' + Math.floor(Math.random() * 80 + 100),
    device: getDeviceType()
  };
  logs.unshift(entry);
  localStorage.setItem('StyleXWear_auditLogs', JSON.stringify(logs));
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) return "Mobile (Phone)";
  return "Desktop (Computer)";
}

// ── STYLEXWEAR STYLE ACCORDION FOOTER INITIALIZER ──
document.addEventListener('DOMContentLoaded', () => {
  const accItems = document.querySelectorAll('.footer-stylexwear-accordion-item');
  accItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    if (trigger && panel) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        accItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherPanel = otherItem.querySelector('.accordion-panel');
          if (otherPanel) otherPanel.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add('active');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    }
  });
});

// ── CHECKOUT NESTED PRODUCT POPUP DRAWER DETAILED VIEW ──
function openCheckoutProductDetail(handle) {
  const product = PRODUCTS.find(p => p.handle === handle);
  if (!product) return;

  const modal = document.getElementById('qk-product-detail-modal');
  if (!modal) return;

  // Render carousel images HTML (supports manual swipe/indicator dots)
  const imagesHTML = product.images.map((img, idx) => `
    <div class="qk-prod-popup-slide" style="min-width: 100%; height: 320px; display: flex; justify-content: center; align-items: center; background: #ffffff;">
      <img src="${img}" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="${product.title} view ${idx + 1}">
    </div>
  `).join('');

  // Calculate discount dynamically
  const saleNum = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
  const origNum = product.originalPrice ? (parseFloat(product.originalPrice.replace(/[^0-9.]/g, '')) || 0) : 0;
  const discountPct = origNum > saleNum ? Math.round(((origNum - saleNum) / origNum) * 100) : 0;

  modal.innerHTML = `
    <!-- Header with Back Button -->
    <div class="qk-modal-header" style="position: sticky; top: 0; background: #ffffff; z-index: 10; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px;">
      <button class="qk-prod-popup-back-btn" style="background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 1.15rem; font-weight: 800; color: #7c3aed; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.2s;">
        ← Back
      </button>
      <span style="font-size: 1.15rem; font-weight: 900; text-transform: uppercase; color: #000000; letter-spacing: 1px;">Product Info</span>
    </div>
    
    <!-- Body Content (Scrollable) -->
    <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; max-height: calc(85vh - 75px); box-sizing: border-box;">
      
      <!-- Image Showcase -->
      <div style="position: relative; width: 100%; overflow: hidden; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
        <div style="display: flex; transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);" class="qk-prod-popup-track">
          ${imagesHTML}
        </div>
        ${product.images.length > 1 ? `
          <!-- Swipe indicators -->
          <div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 10px; z-index: 5;">
            ${product.images.map((_, idx) => `<span class="qk-dot" data-idx="${idx}" style="width: 6px; height: 6px; border-radius: 50%; background: ${idx === 0 ? '#7c3aed' : 'rgba(255,255,255,0.6)'}; display: inline-block; cursor: pointer;"></span>`).join('')}
          </div>
        ` : ''}
      </div>
      
      <!-- Title & Category block -->
      <div>
        <div style="font-size: 1.05rem; font-weight: 800; text-transform: uppercase; color: #7c3aed; letter-spacing: 0.1em; margin-bottom: 4px;">
          ${product.category || 'Streetwear'}
        </div>
        <h2 style="font-size: 1.7rem; font-weight: 800; color: #000000; margin: 0; line-height: 1.25; text-transform: uppercase; letter-spacing: 0.5px;">
          ${product.title}
        </h2>
      </div>
      
      <!-- Price block -->
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 4px;">
        <span style="font-size: 2.1rem; font-weight: 900; color: #000000;">${product.price}</span>
        ${product.originalPrice ? `
          <span style="font-size: 1.25rem; color: #71717a; text-decoration: line-through; font-weight: 600;">${product.originalPrice}</span>
          <span style="background: linear-gradient(135deg, #ff3a3a, #ff6a00); color: #ffffff; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase;">
            ${discountPct}% OFF
          </span>
        ` : ''}
      </div>
      
      <!-- Product Description -->
      <div style="font-size: 1.3rem; line-height: 1.6; color: #4b5563; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        <div style="font-weight: 800; color: #000000; text-transform: uppercase; font-size: 1.1rem; letter-spacing: 0.5px; margin-bottom: 8px;">Product Description</div>
        <p style="margin: 0; color: #4b5563;">${product.description || 'Premium drop-shoulder luxury streetwear article, crafted for a boxy relaxed drape and high density print detail. Highly breathable premium styling weight.'}</p>
      </div>
      
      <!-- Informative Specs -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #71717a; text-transform: uppercase;">Fit Type</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #111111;">Oversized Fit</div>
        </div>
        <div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #71717a; text-transform: uppercase;">Material</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #111111;">100% Cotton</div>
        </div>
      </div>
      
      <!-- Sticky style bottom CTA equivalent -->
      <button class="qk-prod-popup-back-btn-primary" style="margin-top: 10px; width: 100%; background: #7c3aed; color: #ffffff; font-weight: 900; font-size: 1.15rem; padding: 12px 20px 14px; border: none; border-radius: 8px; border-bottom: 4px solid #4c1d95; cursor: pointer; letter-spacing: 0.8px; text-transform: uppercase; transition: all 0.1s ease;">
        Back to Checkout
      </button>
      
    </div>
  `;

  // Wire interactive dot indicators if multiple images exist
  if (product.images.length > 1) {
    const track = modal.querySelector('.qk-prod-popup-track');
    const dots = modal.querySelectorAll('.qk-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.idx);
        track.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach((d, i) => {
          d.style.background = i === idx ? '#7c3aed' : 'rgba(0,0,0,0.4)';
        });
      });
    });
  }

  // Wire back actions (both back header button and bottom action button)
  const closePopupDetail = () => {
    modal.classList.remove('active');
    
    const checkoutModal = document.getElementById('qikink-checkout-modal');
    checkoutModal.style.opacity = '1';
    checkoutModal.style.pointerEvents = 'auto';
    checkoutModal.style.transform = 'translateY(0) scale(1)';
  };

  modal.querySelectorAll('.qk-prod-popup-back-btn, .qk-prod-popup-back-btn-primary').forEach(btn => {
    btn.addEventListener('click', closePopupDetail);
  });

  // Active hover details for bottom CTA buttons
  const backBtnPrimary = modal.querySelector('.qk-prod-popup-back-btn-primary');
  if (backBtnPrimary) {
    backBtnPrimary.addEventListener('mouseover', () => backBtnPrimary.style.background = '#a855f7');
    backBtnPrimary.addEventListener('mouseout', () => backBtnPrimary.style.background = '#7c3aed');
    backBtnPrimary.addEventListener('mousedown', () => {
      backBtnPrimary.style.transform = 'translateY(2px)';
      backBtnPrimary.style.borderBottom = '1px solid #4c1d95';
    });
    backBtnPrimary.addEventListener('mouseup', () => {
      backBtnPrimary.style.transform = 'translateY(0)';
      backBtnPrimary.style.borderBottom = '4px solid #4c1d95';
    });
  }

  // Toggle visible display steps with smooth layer transition
  const checkoutModal = document.getElementById('qikink-checkout-modal');
  checkoutModal.style.transition = 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
  checkoutModal.style.opacity = '0.15';
  checkoutModal.style.pointerEvents = 'none';
  // Shrink/push back the checkout modal slightly for a nice 3D stack effect
  checkoutModal.style.transform = 'translateY(-20px) scale(0.95)';

  modal.classList.add('active');
}




