(function () {
  var SUPABASE_URL = 'https://sltdnnspznasywppyred.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_5w00av0A8YlCdMh4o6_RmQ_f-cYBVc5';

  var supabaseClient = null;

  function injectStyles() {
    if (document.getElementById('geoffrey-briefing-styles')) return;

    var style = document.createElement('style');
    style.id = 'geoffrey-briefing-styles';
    style.textContent = `
      .geoffrey-briefing {
        margin: 18px auto;
        max-width: 760px;
        width: calc(100% - 28px);
        border: 1px solid rgba(200,169,110,0.28);
        border-radius: 12px;
        background: rgba(255,255,255,0.025);
        padding: 14px;
        box-sizing: border-box;
      }

      .geoffrey-briefing-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 12px;
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
        font-family: Georgia, serif;
        color: #F2EFE8;
        font-size: 18px;
        letter-spacing: 0.04em;
        line-height: 1.35;
      }

      .geoffrey-refresh-btn {
        background: transparent;
        border: 1px solid rgba(200,169,110,0.45);
        color: #C8A96E;
        border-radius: 7px;
        padding: 7px 10px;
        font-family: Georgia, serif;
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .geoffrey-refresh-btn:disabled {
        opacity: 0.55;
      }

      .geoffrey-alerts-scroll {
        max-height: 52vh;
        overflow-y: auto;
        padding-right: 4px;
      }

      .geoffrey-alert-card {
        border-top: 1px solid rgba(200,169,110,0.18);
        padding: 14px 0;
      }

      .geoffrey-alert-card:first-child {
        border-top: none;
      }

      .geoffrey-alert-card.is-collapsed .geoffrey-alert-body,
      .geoffrey-alert-card.is-collapsed .geoffrey-alert-action,
      .geoffrey-alert-card.is-collapsed .geoffrey-alert-line,
      .geoffrey-alert-card.is-collapsed .geoffrey-alert-actions {
        display: none;
      }

      .geoffrey-alert-card.is-collapsed {
        padding: 10px 0;
      }

      .geoffrey-alert-card.is-collapsed .geoffrey-alert-title {
        margin-bottom: 3px;
      }

      .geoffrey-alert-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 8px;
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
        margin-bottom: 5px;
      }

      .geoffrey-alert-pairing {
        color: #8D9278;
        font-size: 13px;
        margin-bottom: 8px;
      }

      .geoffrey-alert-body {
        color: #C9C6BB;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 8px;
      }

      .geoffrey-alert-action {
        color: #E0C17A;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 8px;
      }

      .geoffrey-alert-line {
        color: #B9BCA5;
        font-size: 14px;
        line-height: 1.5;
        font-style: italic;
        border-left: 2px solid rgba(200,169,110,0.45);
        padding-left: 10px;
        margin-top: 10px;
      }

      .geoffrey-alert-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }

      .geoffrey-alert-actions button,
      .geoffrey-alert-toggle {
        background: transparent;
        border: 1px solid rgba(200,169,110,0.3);
        color: #C8A96E;
        border-radius: 6px;
        padding: 6px 9px;
        font-size: 12px;
      }

      .geoffrey-alert-toggle {
        margin: 4px 0 10px;
      }

      .geoffrey-empty {
        color: #8D9278;
        font-style: italic;
        font-size: 14px;
        padding-top: 8px;
      }

      .geoffrey-error {
        color: #E0A0A0;
        font-size: 14px;
        line-height: 1.5;
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
        display: none;
      }
    `;

    document.head.appendChild(style);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function loadSupabaseScript() {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) {
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function getClient() {
    if (supabaseClient) return supabaseClient;

    await loadSupabaseScript();

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    return supabaseClient;
  }

  function createBriefingShell() {
    if (document.getElementById('geoffrey-briefing')) return;

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

        <button class="geoffrey-refresh-btn" id="geoffrey-refresh-btn" type="button">
          Refresh
        </button>
      </div>

      <div id="geoffrey-alerts-list"></div>
    `;

    var messages = document.getElementById('messages');
    var main = document.querySelector('main');
    var app = document.getElementById('app') || document.querySelector('.app');

    if (messages && messages.parentNode) {
      messages.parentNode.insertBefore(shell, messages);
    } else if (main) {
      main.prepend(shell);
    } else if (app) {
      app.prepend(shell);
    } else {
      document.body.prepend(shell);
    }

    var btn = document.getElementById('geoffrey-refresh-btn');
    if (btn) {
      btn.addEventListener('click', manualRefreshGeoffrey);
    }
  }

  function setupGeoffreyChatCollapse() {
    var messages = document.getElementById('messages');
    if (!messages) return;

    if (document.getElementById('geoffrey-chat-collapse')) return;

    var wrap = document.createElement('div');
    wrap.id = 'geoffrey-chat-collapse';
    wrap.className = 'geoffrey-chat-collapse';

    wrap.innerHTML = `
      <button type="button" id="geoffrey-chat-toggle">
        Show Chat History
      </button>
    `;

    messages.parentNode.insertBefore(wrap, messages);
    messages.classList.add('geoffrey-history-collapsed');

    var btn = document.getElementById('geoffrey-chat-toggle');

    btn.addEventListener('click', function () {
      var isCollapsed = messages.classList.toggle('geoffrey-history-collapsed');
      btn.textContent = isCollapsed ? 'Show Chat History' : 'Hide Chat History';
    });
  }

  async function loadGeoffreyAlerts() {
    var sb = await getClient();

    var res = await sb
      .from('geoffrey_open_alerts')
      .select('id, created_at, severity_rank, severity, alert_type, handler_name, dog_name, pairing_label, confidence, title, summary, why_it_matters, recommended_action, evidence, geoffrey_line')
      .order('severity_rank', { ascending: true })
      .order('created_at', { ascending: false });

    if (res.error) {
      console.warn('Geoffrey alert load error:', res.error);
      throw res.error;
    }

    return res.data || [];
  }

  async function refreshGeoffreyAlerts() {
    var sb = await getClient();

    var res = await sb.rpc('refresh_geoffrey_alerts');

    if (res.error) {
      console.warn('Geoffrey refresh error:', res.error);
      throw res.error;
    }

    return res.data && res.data.length ? res.data[0] : null;
  }

  function renderGeoffreyAlerts(alerts) {
    var title = document.getElementById('geoffrey-briefing-title');
    var list = document.getElementById('geoffrey-alerts-list');

    if (!title || !list) return;

    if (!alerts.length) {
      title.textContent = 'No open alerts.';
      list.innerHTML = '<div class="geoffrey-empty">All quiet, sir. Disturbingly competent.</div>';
      return;
    }

    title.textContent =
      alerts.length + ' item' + (alerts.length === 1 ? '' : 's') + ' require attention.';

    list.classList.add('geoffrey-alerts-scroll');

    list.innerHTML = alerts.map(function (a, index) {
      var collapsedClass = index === 0 ? '' : ' is-collapsed';
      var toggleText = index === 0 ? 'Collapse' : 'Details';

      return `
        <article class="geoffrey-alert-card${collapsedClass}">
          <div class="geoffrey-alert-meta">
            <span class="geoffrey-pill">${esc(a.severity)}</span>
            <span class="geoffrey-pill">${esc(a.alert_type)}</span>
          </div>

          <div class="geoffrey-alert-title">${esc(a.title)}</div>

          <div class="geoffrey-alert-pairing">
            ${esc(a.handler_name || 'Unknown handler')}
            ${a.dog_name ? ' / ' + esc(a.dog_name) : ''}
          </div>

          <button type="button" class="geoffrey-alert-toggle">
            ${toggleText}
          </button>

          <div class="geoffrey-alert-body">
            ${esc(a.why_it_matters || a.summary || '')}
          </div>

          <div class="geoffrey-alert-action">
            <strong>Recommended:</strong> ${esc(a.recommended_action || '')}
          </div>

          ${
            a.geoffrey_line
              ? `<div class="geoffrey-alert-line">“${esc(a.geoffrey_line)}”</div>`
              : ''
          }

          <div class="geoffrey-alert-actions">
            <button type="button" data-geoffrey-action="handled" data-alert-id="${esc(a.id)}">
              Handled
            </button>
            <button type="button" data-geoffrey-action="dismissed" data-alert-id="${esc(a.id)}">
              Dismiss
            </button>
          </div>
        </article>
      `;
    }).join('');

    list.querySelectorAll('.geoffrey-alert-toggle').forEach(function (button) {
      button.addEventListener('click', function () {
        var card = button.closest('.geoffrey-alert-card');
        if (!card) return;

        card.classList.toggle('is-collapsed');
        button.textContent = card.classList.contains('is-collapsed') ? 'Details' : 'Collapse';
      });
    });

    list.querySelectorAll('button[data-geoffrey-action]').forEach(function (button) {
      button.addEventListener('click', async function () {
        var alertId = button.getAttribute('data-alert-id');
        var status = button.getAttribute('data-geoffrey-action');

        await updateAlertStatus(alertId, status);
        await loadAndRenderGeoffreyBriefing();
      });
    });
  }

  async function updateAlertStatus(alertId, status) {
    var sb = await getClient();

    var res = await sb
      .from('geoffrey_alerts')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (res.error) {
      console.warn('Geoffrey alert status update error:', res.error);
      throw res.error;
    }
  }

  async function loadAndRenderGeoffreyBriefing() {
    var title = document.getElementById('geoffrey-briefing-title');
    var list = document.getElementById('geoffrey-alerts-list');

    tr})();