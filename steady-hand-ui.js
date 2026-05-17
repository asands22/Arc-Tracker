// steady-hand-ui.js
// Bottom navigation and status icon handling for Arc-Tracker

(function() {
  // Map nav items
  const navLinks = [
    { name: 'Hub', href: './index.html' },
    { name: 'Geoffrey', href: './geoffrey.html' },
    { name: 'Arc', href: './arc-tracker.html' },
    { name: 'Dogs', href: './dog-tracker.html' },
    { name: 'Fam', href: './community.html' }
  ];

  // Detect current page for highlighting
  const page = window.location.pathname.split('/').pop().toLowerCase();
  function isCurrent(href) {
    return page === href.replace('./', '').toLowerCase();
  }

  // Add/Replace bottom nav
  function renderBottomNav() {
    // Remove old nav if present
    const oldNav = document.getElementById('steady-hand-bottom-nav');
    if (oldNav) oldNav.remove();
    const nav = document.createElement('nav');
    nav.id = 'steady-hand-bottom-nav';
    nav.style = 'position:fixed;bottom:0;left:0;width:100%;background:#fff;border-top:1px solid #ddd;display:flex;justify-content:space-around;z-index:1111;min-height:48px;box-sizing:border-box;';
    nav.innerHTML = navLinks.map(link => `
      <a href="${link.href}" style="flex:1;padding:10px 0;text-align:center;text-decoration:none;color:${isCurrent(link.href)?'#197aff':'#222'};font-weight:${isCurrent(link.href)?'bold':'normal'};font-size:15px;${isCurrent(link.href)?'background:#f0f5ff;':'background:none;'}">${link.name}</a>
    `).join('');
    document.body.appendChild(nav);
    // Prevent nav tap scroll bounce
    nav.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  }

  // Restore green/online status icon
  function fixStatusIcon() {
    // Accept <span id="status-dot"> or <img id="status-dot">
    var statusEl = document.getElementById('status-dot');
    if (statusEl) {
      if (statusEl.tagName==='IMG') {
        statusEl.style.display = '';
        statusEl.style.filter = '';
        statusEl.src = statusEl.src.replace(/(offline|gray|grey|red)/i, 'green');
      } else {
        statusEl.style.display = '';
        statusEl.style.background = '#2ecc40';
        statusEl.style.border = '1.5px solid #107f1f';
        statusEl.style.boxShadow = '0 0 3px #8f8';
      }
      statusEl.title = 'Online';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    renderBottomNav();
    fixStatusIcon();
  });
  // Run immediately in case script is at bottom
  renderBottomNav();
  fixStatusIcon();
})();
