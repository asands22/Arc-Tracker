(function () {
  function esc(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function getSb() {
    if (window.sb) return window.sb;

    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_KEY) {
      window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
      return window.sb;
    }

    return null;
  }

  function injectStyles() {
    if (document.getElementById('geoffrey-compact-styles')) return;

    var style = document.createElement('style');
    style.id = 'geoffrey-compact-styles';
    style.textContent = `
      .geoffrey-briefing {
        margin: 18px auto;
        max-width: 760px;
        width: calc(100% - 28px);
        border: 1px solid rgba(200,169,110,0.35);
        border-radius: 12px;
        background: rgba(255,255,255,0.025);
        padding: 14px;
        box-sizing: border-box;
      }

      .geoffrey-briefing-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .geoffrey-briefing-kicker {
        font-family: Georgia, serif;
        color: #8D9278;
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin-bottom: 5px;
      }

      .geoffrey-briefing-title {
        color: #F2EFE8;
        font-size: 18px;
        line-height: 1.35;
      }

      .geoffrey-briefing-buttons {
        display: flex;
        gap: 8px;
      }

      .geoffrey-briefing button {
        background: transparent;
        border: 1px solid rgba(200,169,110,0.4);
        color: #C8A96E;
        border-radius: 7px;
        padding: 7px 10px;
        font-family: Georgia, serif;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      #geoffrey-alerts-list {
        margin-top: 12px;
        max-height: 46vh;
        overflow-y: auto;
        padding-right: 4px;
      }

      #geoffrey-alerts-list.is-hidden {
        display: none;
      }

      .geoffrey-alert-card {
        border-top: 1px solid rgba(200,169,110,0.18);
        padding: 12px 0;
      }

      .geoffrey-alert-card:first-child {
        border-top: none;
      }

      .geoffrey-alert-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 7px;
      }

      .geoffrey-pill {
        border: 1px solid rgba(200,169,110,0.35);
        color: #C8A96E;
        border-radius: 999px;
        padding: 3px 8px;
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-family: Georgia, serif;
      }

      .geoffrey-alert-title {
        color: #F2EFE8;
        font-size: 15px;
        line-height: 1.4;
        margin-bottom: 4px;
      }

      .geoffrey-alert-pairing {
        color: #8D9278;
        font-size: 13px;
        margin-bottom: 8px;
      }

      .geoffrey-alert-details {
        display: none;
      }

      .geoffrey-alert-card.is-open .geoffrey-alert-details {
        display: block;
      }

      .geoffrey-alert-body,
      .geoffrey-alert-action,
      .geoffrey-alert-line {
        font-size: 14px;
        line-height: 1.5;
        margin-top: 8px;
      }

      .geoffrey-alert-body {
        color: #C9C6BB;
      }

      .geoffrey-alert-action {
        color: #E0C17A;
      }

      .geoffrey-alert-line {
        color: #B9BCA5;
        font-style: italic;
        border-left: 2px solid rgba(200,169,110,0.45);
        padding-left: 10px;
      }

      .geoffrey-alert-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }

      .geoffrey-chat-collapse {
        margin: 12px auto 10px;
        max-width: 760px;
        width: calc(100% - 28px);
        display: flex;
        justify-content: flex-end;
      }

      .geoffrey-chat-collapse button {
        background: transparent;
        border: 1px solid rgba(200,169,110,0.35);
        color: #C8A96E;
        border-radius: 7px;
        padding: 7px 10px;
        font-family: Georgia, serif;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      #messages.geoffrey-history-collapsed {
        display: none !important;
      }

      .geoffrey-error,
      .geoffrey-empty {
        color: #8D9278;
        font-style: italic;
        font-size: 14px;
        padding-top: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  function createShell() {
    if (document.getElementById('geoffrey-briefing')) return;

    var messages = document.getElementById('messages');
    if (!messages || !messages.parentNode) return;

    var shell = document.createElement('section');
    shell.id = 'geoffrey-briefing';
    shell.className = 'geoffrey-briefing';

    shell.innerHTML = `
      <div class="geoffrey-briefing-top">
        <div>
          <div class="geoffrey-briefing-kicker">Today’s Briefing</div>
          <div class="geoffrey-briefing-title" id="geoffrey-briefing-title">
            Geoffrey is reviewing the house.
          </div>
        </div>

        <div class="geoffrey-briefing-buttons">
          <button type="button" id="geoffrey-alerts-toggle">Show Alerts</button>
          <button type="button" id="geoffrey-refresh-btn">Refresh</button>
        </div>
      </div>

      <div id="geoffrey-alerts-list" class="is-hidden"></div>
    `;

    messages.parentNode.insertBefore(shell, messages);

    var chatWrap = document.createElement('div');
    chatWrap.id = 'geoffrey-chat-collapse';
    chatWrap.className = 'geoffrey-chat-collapse';
    chatWrap.innerHTML = `<button type="button" id="geoffrey-chat-toggle">Show Chat History</button>`;

    messages.parentNode.insertBefore(chatWrap, messages);
    messages.classList.add('geoffrey-history-collapsed');

    document.getElementById('geoffrey-chat-toggle').addEventListener('click', function () {
      var collapsed = messages.classList.toggle('geoffrey-history-collapsed');
      this.textContent = collapsed ? 'Show Chat History' : 'Hide Chat History';
    });

    document.getElementById('geoffrey-alerts-toggle').addEventListener('click', function () {
      var list = document.getElementById('geoffrey-alerts-list');
      var hidden = list.classList.toggle('is-hidden');
      this.textContent = hidden ? 'Show Alerts' : 'Hide Alerts';
    });

    document.getElementById('geoffrey-refresh-btn').addEventListener('click', refreshAndRender);
  }

  async function loadAlerts() {
    var sb = getSb();
    if (!sb) throw new Error('Supabase client not found.');

    var res = await sb
      .from('geoffrey_open_alerts')
      .select('id, created_at, severity_rank, severity, alert_type, handler_name, dog_name, title, summary, why_it_matters, recommended_action, geoffrey_line')
      .order('severity_rank', { ascending: true })
      .order('created_at', { ascending: false });

    if (res.error) throw res.error;
    return res.data || [];
  }

  async function refreshAlerts() {
    var sb = getSb();
    if (!sb) throw new Error('Supabase client not found.');

    var res = await sb.rpc('refresh_geoffrey_alerts');
    if (res.error) throw res.error;

    return res.data;
  }

  function renderAlerts(alerts) {
    var title = document.getElementById('geoffrey-briefing-title');
    var list = document.getElementById('geoffrey-alerts-list');

    if (!title || !list) return;

    title.textContent = alerts.length + ' item' + (alerts.length === 1 ? '' : 's') + ' require attention.';

    if (!alerts.length) {
      list.innerHTML = `<div class="geoffrey-empty">All quiet, sir. Disturbingly competent.</div>`;
      return;
    }

    list.innerHTML = alerts.map(function (a) {
      return `
        <article class="geoffrey-alert-card">
          <div class="geoffrey-alert-meta">
            <span class="geoffrey-pill">${esc(a.severity)}</span>
            <span class="geoffrey-pill">${esc(a.alert_type)}</span>
          </div>

          <div class="geoffrey-alert-title">${esc(a.title)}</div>

          <div class="geoffrey-alert-pairing">
            ${esc(a.handler_name || 'Unknown handler')}
            ${a.dog_name ? ' / ' + esc(a.dog_name) : ''}
          </div>

          <button type="button" class="geoffrey-card-toggle">Details</button>

          <div class="geoffrey-alert-details">
            <div class="geoffrey-alert-body">
              ${esc(a.why_it_matters || a.summary || '')}
            </div>

            <div class="geoffrey-alert-action">
              <strong>Recommended:</strong> ${esc(a.recommended_action || '')}
            </div>

            ${a.geoffrey_line ? `<div class="geoffrey-alert-line">“${esc(a.geoffrey_line)}”</div>` : ''}

            <div class="geoffrey-alert-actions">
              <button type="button" data-status="handled" data-id="${esc(a.id)}">Handled</button>
              <button type="button" data-status="dismissed" data-id="${esc(a.id)}">Dismiss</button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    list.querySelectorAll('.geoffrey-card-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.geoffrey-alert-card');
        card.classList.toggle('is-open');
        btn.textContent = card.classList.contains('is-open') ? 'Collapse' : 'Details';
      });
    });

    list.querySelectorAll('button[data-status]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var sb = getSb();
        var id = btn.getAttribute('data-id');
        var status = btn.getAttribute('data-status');

        await sb
          .from('geoffrey_alerts')
          .update({
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        await loadAndRender();
      });
    });
  }

  async function loadAndRender() {
    try {
      var alerts = await loadAlerts();
      renderAlerts(alerts);
    } catch (e) {
      var title = document.getElementById('geoffrey-briefing-title');
      var list = document.getElementById('geoffrey-alerts-list');

      if (title) title.textContent = 'Geoffrey could not review the house.';
      if (list) list.innerHTML = `<div class="geoffrey-error">${esc(e.message || e)}</div>`;
    }
  }

  async function refreshAndRender() {
    var btn = document.getElementById('geoffrey-refresh-btn');

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Reviewing';
    }

    try {
      await refreshAlerts();
      await loadAndRender();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Refresh';
      }
    }
  }

  function start() {
    injectStyles();
    createShell();
    loadAndRender();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();