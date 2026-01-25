(() => {
  const $ = (id) => document.getElementById(id);

  const btnSend = $('btnSend');
  const btnClear = $('btnClear');
  const btnCopyLog = $('btnCopyLog'); // 可能不存在（已移除全局日志按钮）
  // 旧版日志容器可能不存在，兜底创建隐藏节点以避免空引用
  const out =
    $('output') ||
    (() => {
      const el = document.createElement('pre');
      el.id = 'output';
      el.style.display = 'none';
      document.body.appendChild(el);
      return el;
    })();
  const logTaskPanel = $('tabPanelLog');
  const logListContainer = $('logListContainer');
  const logDetailId = $('logDetailId');
  const logDetailStatus = $('logDetailStatus');
  const logDetailMeta = $('logDetailMeta');
  const logDetailContent = $('logDetailContent');
  const btnCopyTaskLog = $('btnCopyTaskLog');
  const previewGrid = $('previewGrid');
  const previewFilterBar = $('previewFilterBar');
  const previewCount = $('previewCount');
  const btnPreviewBatchDownload = $('btnPreviewBatchDownload');
  const previewModal = $('previewModal');
  const previewModalMedia = $('previewModalMedia');
  const previewModalTaskId = $('previewModalTaskId');
  const previewModalStoryboard = $('previewModalStoryboard');
  const previewModalWatermark = $('previewModalWatermark');
  const previewModalMeta = $('previewModalMeta');
  const btnPreviewClose = $('btnPreviewClose');
  const btnPreviewOpenNew = $('btnPreviewOpenNew');
  const btnPreviewCopyLink = $('btnPreviewCopyLink');
  const btnPreviewCopyHtml = $('btnPreviewCopyHtml');
  const previewModalDownload = $('previewModalDownload');
  const btnPreviewLocateTask = $('btnPreviewLocateTask');
  const editStoryboardModal = $('editStoryboardModal');
  const editStoryboardModalBadge = $('editStoryboardModalBadge');
  const editStoryboardModalMeta = $('editStoryboardModalMeta');
  const editStoryboardTextarea = $('editStoryboardTextarea');
  const btnEditStoryboardCancel = $('btnEditStoryboardCancel');
  const btnEditStoryboardRetry = $('btnEditStoryboardRetry');
  const taskList = $('taskList');
  const taskCount = $('taskCount');
  const dropzone = $('dropzone');
  const fileInput = $('file');
  const filePreviewBox = $('filePreviewBox');
  const filePreviewMedia = $('filePreviewMedia');
  const filePreviewName = $('filePreviewName');
  const filePreviewKind = $('filePreviewKind');
  const filePreviewMeta = $('filePreviewMeta');
  const filePreviewHints = $('filePreviewHints');
  const filePreviewList = $('filePreviewList');
  const btnUseRecommendedModel = $('btnUseRecommendedModel');
  const btnClearFiles = $('btnClearFiles');
  const uxBanner = $('uxBanner');
  const toastHost = $('toastHost') || document.getElementById('toastHost');
  const promptBox = $('prompt');
  const tagBar = $('tagBar');
  const roleList = $('roleList');
  const roleSearch = $('roleSearch');
  const roleSearchClear = $('roleSearchClear');
  const roleCountEl = $('roleCount');
  const roleFilterBar = $('roleFilterBar');
  const roleSort = $('roleSort');
  const btnReloadRoles = $('btnReloadRoles');
  const btnRoleDense = $('btnRoleDense');
  const attachedRolesBox = $('attachedRoles');
  const btnClearMainRoles = document.getElementById('btnClearMainRoles');
  const multiGlobalRolesBar = document.getElementById('multiGlobalRolesBar');
  const multiAttachedRolesBox = document.getElementById('multiAttachedRoles');
  const btnMultiClearRoles = document.getElementById('btnMultiClearRoles');
  const storyboardAttachedRolesBox = document.getElementById('storyboardAttachedRoles');
  const btnStoryboardScopeRoles = document.getElementById('btnStoryboardScopeRoles');
  const btnStoryboardClearRoles = document.getElementById('btnStoryboardClearRoles');
  const formStorageKey = 'gen_form_v1';
  const btnClearDone = $('btnClearDone');
  const btnClearAll = $('btnClearAll');
  const taskStorageKey = 'gen_tasks_v1';
  // 角色挂载：按模式隔离，避免“分镜挂载影响单次/同提示”的错觉
  const roleStorageKeyLegacy = 'gen_roles_v1';
  const roleStorageKeyMain = 'gen_roles_main_v1';
  const roleStorageKeyMulti = 'gen_roles_multi_v1';
  const roleStorageKeyStoryboard = 'gen_roles_storyboard_v1';
  const ROLE_UI_KEY = 'gen_role_ui_v2';
  const ROLE_FAV_KEY = 'gen_role_fav_v1';
  const ROLE_USED_KEY = 'gen_role_used_v1';
  const authHeaderKey = 'adminToken';
  const batchPromptList = $('batchPromptList');
  const batchModeBar = $('batchModeBar');
  const batchConcurrencyInput = $('batchConcurrency');
  const btnApplyGlobalCountToAll = $('btnApplyGlobalCountToAll');
  const batchMetaActions = document.getElementById('batchMetaActions');
  const btnExportBatch = $('btnExportBatch');
  const btnImportBatch = $('btnImportBatch');
  const importBatchFile = $('importBatchFile');
  const multiPromptList = document.getElementById('multiPromptList');
  const btnAddPrompt = document.getElementById('btnAddPrompt');
  const multiPromptActions = document.getElementById('multiPromptActions');
  const storyboardBox = document.getElementById('storyboardBox');
  const storyboardTitle = document.getElementById('storyboardTitle');
  const storyboardShotCount = document.getElementById('storyboardShotCount');
  const btnApplyStoryboardCount = document.getElementById('btnApplyStoryboardCount');
  const storyboardSequential = document.getElementById('storyboardSequential');
  const btnStoryboardFromPrompt = document.getElementById('btnStoryboardFromPrompt');
  const btnStoryboardClear = document.getElementById('btnStoryboardClear');
  const storyboardContext = document.getElementById('storyboardContext');
  const storyboardList = document.getElementById('storyboardList');
  const globalCountLabel = document.getElementById('globalCountLabel');
  const uploadCard = document.getElementById('uploadCard');
  const dropzoneWrap = document.getElementById('dropzoneWrap');
  const btnSendPrimary = document.getElementById('btnSendPrimary');
  const btnClearPrimary = document.getElementById('btnClearPrimary');
  const quickModeBar = document.getElementById('quickModeBar');
  const btnOpenMoreModes = document.getElementById('btnOpenMoreModes');
  const quickCountWrap = document.getElementById('quickCountWrap');
  const quickCountInput = document.getElementById('quickCount');
  const quickCountDec = document.getElementById('quickCountDec');
  const quickCountInc = document.getElementById('quickCountInc');
  const quickPlan = document.getElementById('quickPlan');
  const btnToggleAdvanced = $('btnToggleAdvanced');
  const advancedBox = $('advancedBox');
  const btnOnlyRunning = $('btnOnlyRunning');
  const btnPreviewDense = $('btnPreviewDense');
  const btnLogBottom = $('btnLogBottom');
  const concurrencyDec = $('concurrencyDec');
  const concurrencyInc = $('concurrencyInc');
  const rightTabButtons = Array.from(document.querySelectorAll('[data-tab]'));
  const tabPanelTasks = $('tabPanelTasks');
  const tabPanelPreview = $('tabPanelPreview');
  const tabPanelLog = $('tabPanelLog');
  const RIGHT_TAB_KEY = 'gen_right_tab';
  const PREVIEW_SEEN_KEY = 'gen_preview_seen_v1';
  const PREVIEW_FILTER_KEY = 'gen_preview_filter_v1';
  const PREVIEW_DENSE_KEY = 'gen_preview_dense_v1';
  const ADV_OPEN_KEY = 'gen_adv_open';
  const LOG_MAX_CHARS = 4000;
  const LOG_MAX_LINES = 120;
  const LOG_STORE_LIMIT = 20000;
  const DRAFT_KEY = 'gen_prompt_draft_v1';
  let draftTimer = null;
  let previewHintTimer = null;
  let applyingMainFiles = false; // 防止 set files 触发 change 后递归
  // 高级设置默认常驻显示：减少“展开/收起”这种额外操作（更符合自用高频工作流）
  let advancedOpen = true;
  // “生成份数/默认份数”按模式隔离：避免单次/同提示的份数污染分镜默认份数（分镜默认应为 1）
  let batchConcurrencyByType = {};

  let tasks = [];
  let taskIdCounter = 1;
  let roles = [];
  let roleUi = { query: '', filter: 'all', sort: 'smart', dense: false };
  let roleFavs = new Set(); // username set
  let roleUsed = {}; // { [username]: lastUsedTs }
  let attachedRoles = [];
  let attachedRolesMulti = [];
  let attachedRolesStoryboard = [];
  let multiPrompts = [];
  const multiPromptRoles = {};
  // storyboardShots: { text, count, fileDataUrl, fileName, roles: [], useGlobalRoles?: boolean }
  // useGlobalRoles=false 表示该分镜被手动排除：不再自动挂载“全局角色”（后续全局变更也不会影响它）
  let storyboardShots = [];
  const STORYBOARD_RUN_KEY = 'gen_storyboard_run_v1';
  let storyboardRunCounter = parseInt(localStorage.getItem(STORYBOARD_RUN_KEY) || '0', 10) || 0;
  let tagFilter = '';

  // 上传文件预览状态（用于“模型/横竖/提示词为空”即时提醒）
  let previewObjectUrl = null;
  let lastPreviewSignature = '';
  let lastPreviewInfo = null; // { w, h, orientation, isImage, isVideo }
  let currentRecommendedModel = null;

  const getAuthHeaders = () => {
    const t = localStorage.getItem(authHeaderKey);
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const escapeAttr = (str = '') =>
    str
      .replace(/"/g, "'")
      .replace(/'/g, '&#39;')
      .replace(/\s+/g, ' ')
      .trim();

  const escapeHtml = (str = '') => {
    const s = String(str || '');
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // 默认头像：纯本地 data URI（避免外链占位图被拦截/离线不可用）
  const DEFAULT_ROLE_AVATAR = (() => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#6366f1"/>' +
      '</linearGradient></defs>' +
      '<rect width="160" height="160" rx="34" fill="url(#g)"/>' +
      '<circle cx="80" cy="66" r="22" fill="rgba(255,255,255,0.92)"/>' +
      '<path d="M46 118c4-18 18-28 34-28s30 10 34 28" fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="10" stroke-linecap="round"/>' +
      '</svg>';
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  })();

  // URL 白名单：Sora/OpenAI 域名或常见媒体扩展名
  const isValidMediaUrl = (u) => {
    if (!u) return false;
    const s = u.toString();
    const domainOk = /(?:^https?:\/\/)?(?:videos\.openai\.com|oscdn\d*\.dyysy\.com)/i.test(s);
    const extOk = /\.(mp4|webm|mov|m4v|mpg|mpeg|avi|gif|png|jpg|jpeg|webp)(?:\?|#|$)/i.test(s);
    return domainOk || extOk;
  };

  // ===== 下载友好命名 & 同源 /tmp 重写（解决“哈希英文名 + 手动改名”痛点） =====
  const padNum = (n, width = 2) => {
    const v = Math.max(0, parseInt(String(n ?? '0'), 10) || 0);
    const s = String(v);
    return s.length >= width ? s : `${'0'.repeat(width)}${s}`.slice(-width);
  };

  const sanitizeFilename = (name, fallback = 'download') => {
    let s = String(name || '').trim();
    if (!s) return fallback;
    // 去掉控制字符，避免 Windows/浏览器保存失败
    s = s.replace(/[\u0000-\u001f\u007f]/g, '');
    // Windows 禁用字符：\ / : * ? " < > |
    s = s.replace(/[\\/:*?"<>|]/g, '-');
    // 合并空白
    s = s.replace(/\s+/g, ' ').trim();
    // 不允许以点或空格结尾（Windows）
    s = s.replace(/[. ]+$/g, '');
    if (!s) return fallback;
    // 控制长度，避免过长导致系统截断/失败（保守）
    if (s.length > 120) s = s.slice(0, 120).trim();
    return s || fallback;
  };

  const mediaExtFromUrl = (url, type = 'video') => {
    const s = String(url || '');
    const m = s.match(/\.([a-zA-Z0-9]{2,6})(?:[?#]|$)/);
    const ext = m ? String(m[1]).toLowerCase() : '';
    const ok = new Set(['mp4', 'mov', 'm4v', 'webm', 'gif', 'png', 'jpg', 'jpeg', 'webp']);
    if (ok.has(ext)) return ext;
    return type === 'image' ? 'png' : 'mp4';
  };

  const normalizeTmpDownloadUrl = (url) => {
    // 目标：把 `http://127.0.0.1:8000/tmp/xxx.mp4` 统一重写成 `/tmp/xxx.mp4`
    // 这样无论用户用 127.0.0.1 / 局域网 IP / 域名访问，都能同源下载并应用 download 文件名。
    try {
      const u = new URL(String(url || ''), window.location.href);
      if (u && u.pathname && u.pathname.startsWith('/tmp/')) {
        return u.pathname + (u.search || '');
      }
    } catch (_) {
      /* ignore */
    }
    return String(url || '');
  };

  const buildDownloadFilename = (task, url, type = 'video', ordinal = 1) => {
    const ty = String(type || '').toLowerCase() === 'image' ? 'image' : 'video';
    const ext = mediaExtFromUrl(url, ty);
    const id = task && typeof task.id === 'number' ? task.id : null;

    // 分镜任务：按“分镜组标题 + 镜号/总数 + 第几份 + 任务ID”命名，便于批量后按名称排序
    if (task && task.storyboard) {
      const sb = task.storyboard || {};
      const run = parseInt(String(sb.run || '0'), 10) || 0;
      const idx = parseInt(String(sb.idx || '0'), 10) || 0;
      const total = parseInt(String(sb.total || '0'), 10) || 0;
      const take = parseInt(String(sb.take || '1'), 10) || 1;
      const takes = parseInt(String(sb.takes || '1'), 10) || 1;

      const titleRaw = String(sb.title || (run ? `分镜组${run}` : '分镜')).trim();
      const title = sanitizeFilename(titleRaw, run ? `分镜组${run}` : '分镜');
      const shotPart = idx ? `分镜${padNum(idx, 2)}${total ? `of${padNum(total, 2)}` : ''}` : `分镜${padNum(ordinal, 2)}`;
      const takePart = takes > 1 ? `第${take}份` : '';
      const idPart = id ? `T${id}` : '';
      const parts = [title, shotPart, takePart, idPart].filter(Boolean);
      return `${sanitizeFilename(parts.join('_'), '分镜')}.${ext}`;
    }

    // 普通任务：任务ID + 提示词片段（可选）
    const prefix = id ? `任务${id}` : `${ty === 'image' ? '图片' : '视频'}${padNum(ordinal, 3)}`;
    const hintRaw = task && task.promptSnippet ? String(task.promptSnippet).trim() : '';
    const hint = hintRaw ? sanitizeFilename(hintRaw.slice(0, 26), '') : '';
    return `${sanitizeFilename(hint ? `${prefix}_${hint}` : prefix, prefix)}.${ext}`;
  };

  const triggerBrowserDownload = (url, filename) => {
    const href = normalizeTmpDownloadUrl(url);
    if (!href) return false;
    try {
      const a = document.createElement('a');
      a.href = href;
      if (filename) a.download = String(filename);
      a.rel = 'noreferrer';
      // 不强制新标签：避免被浏览器当作“弹窗”拦截
      a.target = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return true;
    } catch (_) {
      return false;
    }
  };

  const showToast = (msg, type = 'info', opts = {}) => {
    const host = toastHost || document.body;
    const safeType = ['info', 'success', 'error', 'warn'].includes(type) ? type : 'info';

    const el = document.createElement('div');
    el.className = `toast toast-${safeType}`;

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent =
      opts.title ||
      (safeType === 'success' ? '成功' : safeType === 'error' ? '出错了' : safeType === 'warn' ? '注意' : '提示');

    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = String(msg || '');

    el.appendChild(title);
    el.appendChild(desc);

    const duration = typeof opts.duration === 'number' ? opts.duration : 1800;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      el.classList.remove('show');
      setTimeout(() => el.parentNode && el.parentNode.removeChild(el), 220);
    };
    const timer = setTimeout(close, duration);

    // 可选操作按钮：用于“轻提醒”，不打断输入流
    if (opts.action && typeof opts.action === 'object' && opts.action.text && typeof opts.action.onClick === 'function') {
      const actions = document.createElement('div');
      actions.className = 'actions';
      const btn = document.createElement('button');
      btn.className = 'toast-action-btn';
      btn.type = 'button';
      btn.textContent = String(opts.action.text);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(timer);
        try {
          opts.action.onClick();
        } catch (_) {
          /* ignore */
        }
        close();
      });
      actions.appendChild(btn);
      el.appendChild(actions);
    }

    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));

    el.addEventListener('click', () => {
      clearTimeout(timer);
      close();
    });
  };

  const copyTextSafe = async (text) => {
    const content = text || '';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        return true;
      }
    } catch (_) {
      /* fallback below */
    }
    // 兼容 HTTP / 非安全环境：使用隐藏 textarea
    const ta = document.createElement('textarea');
    ta.value = content;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (_) {
      ok = false;
    }
    ta.parentNode && document.body.removeChild(ta);
    return ok;
  };

  let previewModalState = null; // { url, type, taskId }
  let editStoryboardModalState = null; // { taskId }

  const buildEmbedHtml = (url, type) => {
    const u = String(url || '');
    if (!u) return '';
    return type === 'image'
      ? `<img src='${u}' alt='preview'>`
      : `<video src='${u}' controls playsinline></video>`;
  };

  const closePreviewModal = () => {
    if (!previewModal) return;
    previewModal.classList.remove('open');
    previewModal.setAttribute('aria-hidden', 'true');
    if (previewModalMedia) previewModalMedia.innerHTML = '';
    previewModalState = null;
  };

  const openPreviewModal = (url, type = 'video', taskId = null) => {
    if (!previewModal || !previewModalMedia) return;
    if (!url || !isValidMediaUrl(url)) {
      showToast('无效的预览链接', 'warn');
      return;
    }

    const tid = taskId ? parseInt(String(taskId), 10) : null;
    const t = tid ? tasks.find((x) => x.id === tid) : null;
    const metaText = t && t.meta ? [t.meta.resolution, t.meta.duration, t.meta.info].filter(Boolean).join(' · ') : '';
    const stage = t && t.wmStage ? String(t.wmStage) : '';
    const attempt =
      t && typeof t.wmAttempt === 'number' ? t.wmAttempt : t ? parseInt(String(t.wmAttempt || '0'), 10) || 0 : 0;

    previewModalState = { url: String(url), type: type === 'image' ? 'image' : 'video', taskId: tid };

    // Head: badges
    if (previewModalTaskId) {
      if (tid) {
        previewModalTaskId.style.display = 'inline-flex';
        previewModalTaskId.textContent = `任务 ${tid}`;
      } else {
        previewModalTaskId.style.display = 'none';
        previewModalTaskId.textContent = '';
      }
    }
    if (previewModalStoryboard) {
      const sbLabel = t && t.storyboard && t.storyboard.label ? String(t.storyboard.label) : '';
      if (sbLabel) {
        previewModalStoryboard.style.display = 'inline-flex';
        previewModalStoryboard.textContent = sbLabel;
      } else {
        previewModalStoryboard.style.display = 'none';
        previewModalStoryboard.textContent = '';
      }
    }
    if (previewModalWatermark) {
      if (stage) {
        previewModalWatermark.style.display = 'inline-flex';
        previewModalWatermark.textContent =
          stage === 'cancelled'
            ? '已取消去水印'
            : stage === 'ready'
              ? '无水印'
              : `去水印中${attempt > 0 ? ` · ${attempt}` : ''}`;
      } else {
        previewModalWatermark.style.display = 'none';
        previewModalWatermark.textContent = '';
      }
    }

    // Head: meta line (kept simple; full URL still available via copy/open)
    if (previewModalMeta) {
      previewModalMeta.textContent = (metaText ? `${metaText} · ` : '') + String(url);
    }

    // Actions
    if (previewModalDownload) {
      const href = normalizeTmpDownloadUrl(String(url));
      previewModalDownload.setAttribute('href', href);
      try {
        const filename = buildDownloadFilename(t, href, previewModalState.type, 1);
        previewModalDownload.setAttribute('download', filename);
        previewModalDownload.title = filename;
      } catch (_) {
        // 至少保证有 download 属性（无值时浏览器会用 URL 文件名）
        previewModalDownload.setAttribute('download', '');
        previewModalDownload.title = '下载';
      }
    }
    if (btnPreviewLocateTask) {
      btnPreviewLocateTask.disabled = !tid;
    }

    // 兜底：无论用户是否切到“预览”Tab，只要打开了预览弹层，就视为已读（避免红点反复冒出来）
    if (tid) {
      try {
        markPreviewSeen(tid);
      } catch (_) {
        /* ignore */
      }
      updateUnreadDots();
    }

    // Body: media
    previewModalMedia.innerHTML = '';
    if (previewModalState.type === 'image') {
      const img = document.createElement('img');
      img.src = String(url);
      img.alt = 'preview';
      previewModalMedia.appendChild(img);
    } else {
      const v = document.createElement('video');
      v.src = String(url);
      v.controls = true;
      v.autoplay = true;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      previewModalMedia.appendChild(v);
    }

    // Open
    previewModal.classList.add('open');
    previewModal.setAttribute('aria-hidden', 'false');
  };

  const closeEditStoryboardModal = () => {
    if (!editStoryboardModal) return;
    editStoryboardModal.classList.remove('open');
    editStoryboardModal.setAttribute('aria-hidden', 'true');
    editStoryboardModalState = null;
    if (editStoryboardTextarea) editStoryboardTextarea.value = '';
  };

  const rebuildStoryboardPromptSend = (oldSend, oldShotText, newShotText) => {
    const send = String(oldSend || '');
    const oldShot = String(oldShotText || '');
    const next = String(newShotText || '');
    if (!send) return next;

    const sendTrim = send.replace(/\s+$/, '');
    const oldTrim = oldShot.replace(/\s+$/, '');
    if (oldTrim && sendTrim.endsWith(oldTrim)) {
      return sendTrim.slice(0, sendTrim.length - oldTrim.length) + next;
    }
    if (oldTrim) {
      const idx = sendTrim.lastIndexOf(oldTrim);
      if (idx >= 0) {
        return sendTrim.slice(0, idx) + next + sendTrim.slice(idx + oldTrim.length);
      }
    }
    // Fallback: append as a new final segment, keeping old context intact.
    return sendTrim + (sendTrim ? '\n\n' : '') + next;
  };

  const openEditStoryboardModal = (taskId) => {
    if (!editStoryboardModal || !editStoryboardTextarea) return;
    const tid = taskId ? parseInt(String(taskId), 10) : 0;
    const t = tid ? tasks.find((x) => x.id === tid) : null;
    if (!t || !t.storyboard) {
      showToast('未找到该分镜任务', 'warn');
      return;
    }
    const sbLabel = t.storyboard && t.storyboard.label ? String(t.storyboard.label) : '';
    if (editStoryboardModalBadge) {
      if (sbLabel) {
        editStoryboardModalBadge.style.display = 'inline-flex';
        editStoryboardModalBadge.textContent = sbLabel;
      } else {
        editStoryboardModalBadge.style.display = 'none';
        editStoryboardModalBadge.textContent = '';
      }
    }
    if (editStoryboardModalMeta) {
      editStoryboardModalMeta.textContent = sbLabel ? `修改分镜提示词（${sbLabel}）` : '修改分镜提示词（仅影响当前分镜任务）';
    }
    editStoryboardModalState = { taskId: tid };
    editStoryboardTextarea.value = String(t.promptUser || '');
    editStoryboardModal.classList.add('open');
    editStoryboardModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      try {
        editStoryboardTextarea.focus();
        const len = editStoryboardTextarea.value.length;
        editStoryboardTextarea.setSelectionRange(len, len);
      } catch (_) {
        /* ignore */
      }
    }, 0);
  };

  const submitEditStoryboardModal = async () => {
    if (!editStoryboardModalState || !editStoryboardTextarea) return;
    const tid = editStoryboardModalState && editStoryboardModalState.taskId ? parseInt(String(editStoryboardModalState.taskId), 10) : 0;
    const t = tid ? tasks.find((x) => x.id === tid) : null;
    if (!t) {
      closeEditStoryboardModal();
      return;
    }

    const nextShotText = String(editStoryboardTextarea.value || '').trim();
    if (!nextShotText) {
      showToast('请先修改分镜提示词（不能为空）', 'warn');
      return;
    }

    const apiKey = $('apiKey').value.trim();
    const baseUrl = getBaseUrl();
    if (!apiKey || !baseUrl) {
      showToast('请先填写 API Key 和服务器地址');
      return;
    }

    const nextSend = rebuildStoryboardPromptSend(t.promptSend, t.promptUser, nextShotText);
    closeEditStoryboardModal();
    showToast('已提交修改，正在重试该分镜…', 'info', { title: '分镜重试' });
    await runJobs(
      [
        {
          taskId: tid,
          promptSend: nextSend,
          promptUser: nextShotText,
          file: null,
          model: t.model || $('model').value,
          storyboard: t.storyboard || null
        }
      ],
      apiKey,
      baseUrl,
      1
    );
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const sleepCancellable = async (ms, shouldStop) => {
    const end = Date.now() + Math.max(0, ms || 0);
    while (Date.now() < end) {
      if (shouldStop && shouldStop()) return false;
      const left = end - Date.now();
      await sleep(Math.min(250, Math.max(0, left)));
    }
    return !(shouldStop && shouldStop());
  };

  const formatBytes = (bytes) => {
    const n = Number(bytes) || 0;
    if (n <= 0) return '0B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const idx = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
    const val = n / Math.pow(1024, idx);
    return `${val.toFixed(idx === 0 ? 0 : 2)}${units[idx]}`;
  };

  const detectOrientation = (w, h) => {
    const ww = Number(w) || 0;
    const hh = Number(h) || 0;
    if (!ww || !hh) return '';
    if (Math.abs(ww - hh) <= 2) return 'square';
    return ww > hh ? 'landscape' : 'portrait';
  };

  const parseModelId = (m = '') => {
    const model = String(m || '');
    const isVideo = model.startsWith('sora-video');
    const isImage = model.startsWith('sora-image');
    const orientation = /portrait/i.test(model) ? 'portrait' : /landscape/i.test(model) ? 'landscape' : '';
    const duration = /15s/i.test(model) ? '15s' : /10s/i.test(model) ? '10s' : '';
    return { isVideo, isImage, orientation, duration };
  };

  const getSelectedModelLabel = () => {
    const sel = $('model');
    return sel && sel.selectedOptions && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent.trim() : $('model')?.value || '';
  };

  const setBannerText = (text) => {
    if (!uxBanner) return;
    const msg = (text || '').trim();
    if (!msg) {
      uxBanner.style.display = 'none';
      uxBanner.textContent = '';
      return;
    }
    uxBanner.textContent = msg;
    uxBanner.style.display = 'block';
  };

  const clearPreviewObjectUrl = () => {
    try {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    } catch (_) {
      /* ignore */
    }
    previewObjectUrl = null;
    lastPreviewSignature = '';
    lastPreviewInfo = null;
  };

  const getImageSize = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const renderChips = (el, items) => {
    if (!el) return;
    el.innerHTML = '';
    (items || []).forEach((it) => {
      const chip = document.createElement('span');
      const cls = it.kind ? `chip ${it.kind}` : 'chip';
      chip.className = cls;
      chip.textContent = it.text || '';
      el.appendChild(chip);
    });
  };

  const humanizeUpstreamError = (raw) => {
    const text = String(raw?.message || raw?.error?.message || raw || '').trim();

    // 尝试从 “API request failed: 400 - {json}” 中提取 JSON
    let inner = null;
    const jsonStart = text.indexOf('{');
    if (jsonStart >= 0) {
      const maybe = text.slice(jsonStart);
      try {
        inner = JSON.parse(maybe);
      } catch (_) {
        inner = null;
      }
    }

    const err = inner && inner.error ? inner.error : raw && raw.error ? raw.error : null;
    const code = err && err.code ? String(err.code) : '';
    const param = err && err.param ? String(err.param) : '';
    const msg = err && err.message ? String(err.message) : '';
    const merged = (msg || text || '').trim();

    // 典型：地区限制（用户最常见困惑点之一）
    const ccFromText = (() => {
      const m = merged.match(/\(([A-Za-z]{2})\)/);
      return m ? m[1] : '';
    })();
    if (
      code === 'unsupported_country_code' ||
      /not available in your country/i.test(merged) ||
      /国家\/地区不可用|地区不可用|Sora.*不可用/i.test(merged)
    ) {
      const cc = param || ccFromText || '未知';
      return {
        type: 'error',
        title: '地区限制',
        message: `Sora 在你当前网络出口地区不可用（${cc}）。\n解决：切换代理/机房到支持地区后再试。`
      };
    }

    // 典型：Cloudflare challenge（Sora 网页端经常触发）
    if (/Just a moment|Enable JavaScript and cookies to continue|__cf_bm|cloudflare/i.test(text)) {
      return {
        type: 'error',
        title: 'Cloudflare 拦截',
        message: '触发 Cloudflare 风控拦截。\n解决：更换更“干净”的出口 IP/代理，或降低并发与请求频率。'
      };
    }

    // 兜底：把 JSON 里的 error.message 拿出来
    if (merged) {
      return {
        type: /warn|limit|blocked|guardrail|违规|不支持|限制/i.test(merged) ? 'warn' : 'error',
        title: '生成失败',
        message: merged
      };
    }

    return { type: 'error', title: '生成失败', message: '未知错误（上游未返回可读信息）' };
  };

  // 内容政策/审查命中：用于分镜兜底（出现审查报错时提供“修改分镜提示词”按钮）
  const isContentPolicyViolation = (raw) => {
    const s = String(raw || '').trim();
    if (!s) return false;
    return (
      /Content Policy Violation/i.test(s) ||
      /may violate our content policies/i.test(s) ||
      /content policies?/i.test(s) && /violate|violation/i.test(s) ||
      /内容.*(政策|审核|审查)/.test(s) ||
      /审核未通过|审查未通过|内容不合规|内容违规/.test(s)
    );
  };

  const renderFilePreview = async () => {
    if (!filePreviewBox || !filePreviewMedia || !filePreviewName || !filePreviewKind || !filePreviewMeta || !filePreviewHints) return;

    const files = Array.from((fileInput?.files && fileInput.files.length ? fileInput.files : []) || []);
    const promptText = (promptBox?.value || '').trim();
    const modelId = $('model')?.value || '';
    const modelInfo = parseModelId(modelId);

    currentRecommendedModel = null;
    if (btnUseRecommendedModel) btnUseRecommendedModel.style.display = 'none';

    if (!files.length) {
      filePreviewBox.style.display = 'none';
      filePreviewMedia.innerHTML = '';
      filePreviewName.textContent = '未选择文件';
      filePreviewKind.textContent = '素材';
      filePreviewMeta.textContent = '';
      renderChips(filePreviewHints, []);
      setBannerText('');
      clearPreviewObjectUrl();
      notifyHeight();
      return;
    }

    filePreviewBox.style.display = 'flex';

    const imgCount = files.filter((f) => (f.type || '').startsWith('image')).length;
    const vidCount = files.filter((f) => (f.type || '').startsWith('video')).length;
    const mixed = imgCount > 0 && vidCount > 0;

    const first = files[0];
    const name = first?.name || '未命名文件';
    filePreviewName.textContent = files.length > 1 ? `${files.length} 个文件（${name} 等）` : name;

    // 素材类型标签
    const kindText = mixed ? `混合(${imgCount}图/${vidCount}视频)` : vidCount ? `视频(${vidCount})` : `图片(${imgCount})`;
    filePreviewKind.textContent = kindText;

    const signature = `${files.length}:${name}:${first.size}:${first.lastModified}:${first.type}`;
    const isImage = (first.type || '').startsWith('image');
    const isVideo = (first.type || '').startsWith('video');
    const needReload = signature !== lastPreviewSignature || !previewObjectUrl || !filePreviewMedia.firstChild;

    let w = 0;
    let h = 0;
    let orientation = '';

    // 预览媒体：只有文件变化才重新创建 objectURL，避免输入提示词时闪烁/浪费
    if (needReload) {
      // 清理旧预览
      if (previewObjectUrl) {
        try {
          URL.revokeObjectURL(previewObjectUrl);
        } catch (_) {
          /* ignore */
        }
      }
      previewObjectUrl = URL.createObjectURL(first);
      lastPreviewSignature = signature;
      lastPreviewInfo = null;
      filePreviewMedia.innerHTML = '';

      if (isImage) {
        const imgEl = document.createElement('img');
        imgEl.src = previewObjectUrl;
        imgEl.alt = 'upload preview';
        filePreviewMedia.appendChild(imgEl);

        const size = await getImageSize(previewObjectUrl);
        if (size) {
          w = size.w;
          h = size.h;
          orientation = detectOrientation(w, h);
        }
        lastPreviewInfo = { w, h, orientation, isImage: true, isVideo: false };
      } else if (isVideo) {
        const v = document.createElement('video');
        v.src = previewObjectUrl;
        v.controls = true;
        v.muted = true;
        v.playsInline = true;
        v.preload = 'metadata';
        filePreviewMedia.appendChild(v);
        lastPreviewInfo = { w: 0, h: 0, orientation: '', isImage: false, isVideo: true };
        // 尽力拿到分辨率（不阻塞 UI）
        v.addEventListener(
          'loadedmetadata',
          () => {
            const vw = v.videoWidth || 0;
            const vh = v.videoHeight || 0;
            const o = detectOrientation(vw, vh);
            const base = filePreviewMeta.textContent || '';
            const extra = vw && vh ? ` · ${vw}x${vh}${o ? `(${o === 'portrait' ? '竖' : o === 'landscape' ? '横' : '方'})` : ''}` : '';
            if (extra && !base.includes(`${vw}x${vh}`)) {
              filePreviewMeta.textContent = base + extra;
              notifyHeight();
            }
          },
          { once: true }
        );
      } else {
        filePreviewMedia.innerHTML = `<div style="padding:12px;color:#cbd5e1;font-size:12px;">无法预览该文件类型</div>`;
        lastPreviewInfo = { w: 0, h: 0, orientation: '', isImage: false, isVideo: false };
      }
    } else if (lastPreviewInfo) {
      w = lastPreviewInfo.w || 0;
      h = lastPreviewInfo.h || 0;
      orientation = lastPreviewInfo.orientation || '';
    }

    const sizeText = formatBytes(first.size);
    const dimText = w && h ? `${w}x${h}` : '';
    const orientationText = orientation === 'portrait' ? '竖' : orientation === 'landscape' ? '横' : orientation === 'square' ? '方' : '';
    const modelLabel = getSelectedModelLabel();

    filePreviewMeta.textContent = [
      `当前模型：${modelLabel}`,
      `文件：${sizeText}`,
      dimText ? `分辨率：${dimText}${orientationText ? `(${orientationText})` : ''}` : ''
    ]
      .filter(Boolean)
      .join(' · ');

    // 推荐模型：仅对“图片首帧”特别提示横竖匹配（最常见困惑点）
    if (isImage && orientation) {
      if (modelInfo.isVideo) {
        const dur = modelInfo.duration || '15s';
        if (orientation === 'portrait') currentRecommendedModel = `sora-video-portrait-${dur}`;
        if (orientation === 'landscape') currentRecommendedModel = `sora-video-landscape-${dur}`;
        // square 不强推
      } else if (modelInfo.isImage) {
        if (orientation === 'portrait') currentRecommendedModel = 'sora-image-portrait';
        if (orientation === 'landscape') currentRecommendedModel = 'sora-image-landscape';
        if (orientation === 'square') currentRecommendedModel = 'sora-image';
      }
      if (currentRecommendedModel && currentRecommendedModel !== modelId && btnUseRecommendedModel) {
        btnUseRecommendedModel.style.display = 'inline-flex';
      }
    }

    const chips = [];
    if (mixed) chips.push({ text: '混合选择：建议不要图/视频混用（容易跑偏）', kind: 'warn' });
    if (modelInfo.isImage && vidCount > 0) chips.push({ text: '图片模型 + 视频素材：视频不会被使用', kind: 'warn' });
    if (modelInfo.isVideo && imgCount > 0 && !promptText) chips.push({ text: '图片首帧但提示词为空：结果可能与图无关', kind: 'warn' });
    if (currentRecommendedModel && currentRecommendedModel !== modelId) chips.push({ text: `推荐模型：${currentRecommendedModel}`, kind: 'info' });
    if (!chips.length) chips.push({ text: '已就绪', kind: 'ok' });
    renderChips(filePreviewHints, chips);

    // Banner：只保留最关键一句，避免信息噪声
    if (modelInfo.isVideo && imgCount > 0 && !promptText) {
      setBannerText('提示：你上传了图片但没写提示词。图片只是“参考/首帧”，建议补一句你希望画面发生什么（动作/镜头/风格），否则容易跑偏。');
    } else if (modelInfo.isImage && vidCount > 0) {
      setBannerText('提示：你上传的是视频，但当前模型是“图片”。视频不会参与生成；请切换到视频模型或换成图片文件。');
    } else if (mixed) {
      setBannerText('提示：你同时选了图片和视频。建议分开跑（同一批只放同类型文件），可减少异常与不相关结果。');
    } else {
      setBannerText('');
    }

    notifyHeight();
  };

  const showBubble = (msg, anchor) => {
    const host = document.getElementById('logActions') || anchor?.parentElement || document.body;
    const bubble = document.createElement('div');
    bubble.className = 'bubble-toast';
    bubble.textContent = msg;
    host.appendChild(bubble);
    requestAnimationFrame(() => bubble.classList.add('show'));
    setTimeout(() => {
      bubble.classList.remove('show');
      setTimeout(() => bubble.parentNode && bubble.parentNode.removeChild(bubble), 180);
    }, 1200);
  };

  const notifyHeight = () => {
    try {
      const page = document.querySelector('.page');
      const h = page
        ? Math.ceil((page.getBoundingClientRect()?.height || 0) + (page.offsetTop || 0))
        : Math.max(document.documentElement?.scrollHeight || 0, document.body?.scrollHeight || 0);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'sora-generate-height', height: h }, '*');
      }
    } catch (_) {
      /* ignore */
    }
  };

  // ===== 预览未读红点：基于“任务 id 是否已看过” =====
  const getCurrentPreviewTaskIds = () =>
    (Array.isArray(tasks) ? tasks : [])
      .filter((t) => t && t.url)
      .map((t) => t.id)
      .filter((id) => typeof id === 'number' && id > 0);

  const prunePreviewSeenTaskIds = () => {
    const existing = new Set((Array.isArray(tasks) ? tasks : []).map((t) => t.id).filter((id) => typeof id === 'number'));
    previewSeenTaskIds = new Set(Array.from(previewSeenTaskIds).filter((id) => existing.has(id)));
  };

  const persistPreviewSeenTaskIds = () => {
    try {
      prunePreviewSeenTaskIds();
      localStorage.setItem(PREVIEW_SEEN_KEY, JSON.stringify(Array.from(previewSeenTaskIds.values())));
    } catch (_) {
      /* ignore */
    }
  };

  const loadPreviewSeenTaskIds = () => {
    try {
      const raw = localStorage.getItem(PREVIEW_SEEN_KEY) || '[]';
      const arr = JSON.parse(raw);
      previewSeenTaskIds = new Set(
        Array.isArray(arr)
          ? arr
              .map((x) => parseInt(String(x), 10))
              .filter((n) => !isNaN(n) && n > 0)
          : []
      );
    } catch (_) {
      previewSeenTaskIds = new Set();
    }
    prunePreviewSeenTaskIds();
  };

  const markPreviewSeen = (taskId) => {
    const id = typeof taskId === 'number' ? taskId : parseInt(String(taskId || '0'), 10);
    if (!id) return;
    previewSeenTaskIds.add(id);
    persistPreviewSeenTaskIds();
  };

  const markAllPreviewsSeen = () => {
    getCurrentPreviewTaskIds().forEach((id) => previewSeenTaskIds.add(id));
    persistPreviewSeenTaskIds();
  };

  const hasUnseenPreviews = () => getCurrentPreviewTaskIds().some((id) => !previewSeenTaskIds.has(id));

  // ===== 预览过滤（全部/视频/图片/分镜）=====
  const normalizePreviewFilter = (v) => {
    const s = String(v || '').toLowerCase();
    return s === 'video' || s === 'image' || s === 'storyboard' ? s : 'all';
  };
  const previewFilterLabel = (f) =>
    f === 'video' ? '视频' : f === 'image' ? '图片' : f === 'storyboard' ? '分镜' : '全部';
  let previewFilter = normalizePreviewFilter(localStorage.getItem(PREVIEW_FILTER_KEY) || 'all');

  const taskMatchesPreviewFilter = (t, f) => {
    const filter = normalizePreviewFilter(f);
    if (!t) return false;
    if (filter === 'all') return true;
    if (filter === 'storyboard') return (t.tag || '') === 'storyboard' || !!t.storyboard;
    const ty = String(t.type || '').toLowerCase();
    return filter === 'video' ? ty === 'video' : filter === 'image' ? ty === 'image' : true;
  };

  const syncPreviewFilterButtons = () => {
    if (!previewFilterBar) return;
    previewFilterBar.querySelectorAll('[data-preview-filter]').forEach((btn) => {
      const val = normalizePreviewFilter(btn.getAttribute('data-preview-filter') || 'all');
      btn.classList.toggle('active', val === previewFilter);
    });
  };

  const setPreviewFilter = (next, opts = {}) => {
    const persist = !(opts && opts.persist === false);
    const render = !(opts && opts.render === false);
    const toast = !!(opts && opts.toast);
    const f = normalizePreviewFilter(next);
    if (f === previewFilter) return;
    previewFilter = f;
    if (persist) {
      try {
        localStorage.setItem(PREVIEW_FILTER_KEY, previewFilter);
      } catch (_) {
        /* ignore */
      }
    }
    syncPreviewFilterButtons();
    if (render) renderPreviews();
    if (toast) showToast(`预览过滤：${previewFilterLabel(previewFilter)}`, 'info', { duration: 1400 });
  };

  const updateUnreadDots = () => {
    const setDot = (tab, on) => {
      const btn = rightTabButtons.find((b) => b.getAttribute('data-tab') === tab);
      const dot = btn?.querySelector('.dot');
      btn?.classList.toggle('has-unread', on);
      if (dot) dot.style.display = on ? 'block' : 'none';
    };
    const previewUnread = hasUnseenPreviews() && currentRightTab !== 'preview';
    const logUnread = logVersion > logSeenVersion && currentRightTab !== 'log';
    setDot('tasks', unread.tasks && currentRightTab !== 'tasks');
    setDot('preview', previewUnread);
    setDot('log', logUnread);
  };

  const appendLog = (text) => {
    const line = `[${new Date().toLocaleTimeString()}] ${text}`;
    const existing = (out.textContent || '').split('\n').filter(Boolean);
    existing.push(line);
    const trimmed = existing.slice(-LOG_MAX_LINES).join('\n');
    out.textContent = trimmed.slice(-LOG_MAX_CHARS) + '\n';
    out.scrollTop = out.scrollHeight;
    logVersion += 1;
    if (currentRightTab === 'log') {
      logSeenVersion = logVersion;
    }
    updateUnreadDots();
  };

  const log = (msg) => appendLog(msg);

  const logTask = (taskId, msg) => {
    appendLog(`任务#${taskId} | ${msg}`);
    taskLogBuffer[taskId] = (taskLogBuffer[taskId] || '') + `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    const t = tasks.find((x) => x.id === taskId);
    if (t) {
      const mergedLog = (t.logFull || '') + '\n' + `[${new Date().toLocaleTimeString()}] ${msg}`;
      updateTask(taskId, { logFull: mergedLog });
    }
  };

  const getTaskLogText = (t) => {
    if (!t) return '';
    const merged =
      (taskLogBuffer[t.id] || '')
        .split('\n')
        .filter(Boolean)
        .join('\n') ||
      t.logFull ||
      t.logTail ||
      '';
    return merged.trim();
  };

  const renderLogPanel = () => {
    if (!logListContainer || !logDetailContent) return;
    if (!tasks.length) {
      logListContainer.innerHTML = '<div class="muted" style="padding:12px;">暂无任务</div>';
      logDetailId.textContent = '';
      logDetailStatus.textContent = '';
      logDetailMeta.textContent = '';
      logDetailContent.textContent = '暂无日志';
      return;
    }

    // 确保当前选中任务合法
    if (!currentLogTaskId || !tasks.find((t) => t.id === currentLogTaskId)) {
      currentLogTaskId = tasks[0].id;
    }

    // 渲染左侧列表
    const statusMap = {
      queue: '排队中',
      running: '生成中',
      retrying: '重试中',
      done: '已完成',
      error: '失败',
      stalled: '中断',
      character_done: '角色卡成功',
      character_error: '角色卡失败'
    };
    logListContainer.innerHTML = tasks
      .map((t) => {
        const active = t.id === currentLogTaskId;
        const statusText =
          t.type === 'character'
            ? t.status === 'done'
              ? statusMap.character_done
              : statusMap.character_error
            : statusMap[t.status] || '未知';
        const msg = t.message || '';
        return `
          <div class="log-card ${active ? 'active' : ''}" data-logitem="${t.id}" style="cursor:pointer;">
            <div class="log-card-head">
              <span class="task-id-pill">#${t.id}</span>
              <span class="pill-pill ${t.status}">${statusText}</span>
            </div>
            <div class="log-card-body" style="padding:8px 10px;">
              <div class="task-log-title" style="font-weight:600; font-size:13px; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeAttr(t.promptSnippet || '')}">
                ${escapeHtml(t.promptSnippet || '(空提示)')}
              </div>
              ${msg ? `<div class="muted" style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(msg)}</div>` : ''}
            </div>
          </div>
        `;
      })
      .join('');

    logListContainer.querySelectorAll('[data-logitem]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = parseInt(el.getAttribute('data-logitem'), 10);
        if (!isNaN(id)) {
          currentLogTaskId = id;
          renderLogPanel();
        }
      });
    });

    // 渲染右侧详情
    const current = tasks.find((t) => t.id === currentLogTaskId) || tasks[0];
    if (current) {
      const statusText =
        current.type === 'character'
          ? current.status === 'done'
            ? statusMap.character_done
            : statusMap.character_error
          : statusMap[current.status] || '未知';
      logDetailId.textContent = `#${current.id}`;
      logDetailStatus.textContent = statusText;
      logDetailMeta.textContent =
        (current.meta && [current.meta.resolution, current.meta.duration, current.meta.info].filter(Boolean).join(' · ')) ||
        current.message ||
        '';
      logDetailContent.textContent = getTaskLogText(current) || '暂无日志';
      logDetailContent.scrollTop = logDetailContent.scrollHeight;
    }
  };

  const renderTaskLogContent = renderLogPanel;
  const renderTaskLogList = renderLogPanel;

  const setTaskCount = () => {
    taskCount.textContent = `${tasks.length} 个任务`;
  };

  const renderTasks = () => {
    const baseList = onlyRunning
      ? tasks.filter((t) => t.status === 'running' || t.status === 'retrying' || t.status === 'queue' || t.status === 'stalled')
      : tasks;
    const byTag = tagFilter
      ? baseList.filter((t) => (tagFilter === 'storyboard' ? (t.tag === 'storyboard' || !!t.storyboard) : false))
      : baseList;
    const filtered = statusFilter
      ? byTag.filter((t) =>
          statusFilter === 'running' ? t.status === 'running' || t.status === 'retrying' : t.status === statusFilter
        )
      : byTag;
    const counts = {
      running: tasks.filter((t) => t.status === 'running' || t.status === 'retrying').length,
      queue: tasks.filter((t) => t.status === 'queue').length,
      done: tasks.filter((t) => t.status === 'done').length,
      error: tasks.filter((t) => t.status === 'error').length
    };
    const tagCounts = {
      storyboard: tasks.filter((t) => t.tag === 'storyboard' || !!t.storyboard).length
    };
    const totalCount = tasks.length;
    const hiddenCount = baseList.length - filtered.length;
    const groupBar = `
      <div class="chips" style="margin-bottom:6px;">
        <button class="pill-btn ${statusFilter ? '' : 'active'}" data-filter="">全部 (${totalCount})</button>
        <button class="pill-btn ${statusFilter === 'running' ? 'active' : ''}" data-filter="running">运行中 (${counts.running})</button>
        <button class="pill-btn ${statusFilter === 'queue' ? 'active' : ''}" data-filter="queue">排队中 (${counts.queue})</button>
        <button class="pill-btn ${statusFilter === 'done' ? 'active' : ''}" data-filter="done">已完成 (${counts.done})</button>
        <button class="pill-btn ${statusFilter === 'error' ? 'active' : ''}" data-filter="error">失败 (${counts.error})</button>
      </div>
      <div class="chips" style="margin-bottom:6px;">
        <span class="muted" style="padding:6px 2px;">标签</span>
        <button class="pill-btn ${tagFilter ? '' : 'active'}" data-tag="">全部</button>
        <button class="pill-btn ${tagFilter === 'storyboard' ? 'active' : ''}" data-tag="storyboard">分镜 (${tagCounts.storyboard})</button>
      </div>
      ${hiddenCount > 0 ? `<div class="banner">已隐藏 ${hiddenCount} 条不匹配的任务</div>` : ''}
    `;

    const html = filtered
      .map((t) => {
        const statusText =
          t.timedOut
            ? '网络超时'
            : t.type === 'character' && t.status === 'done'
              ? '角色卡创建成功'
              : t.type === 'character' && t.status === 'error'
                ? '角色卡创建失败'
                : (() => {
                    const retryCount =
                      typeof t.retryCount === 'number' ? t.retryCount : parseInt(String(t.retryCount || '0'), 10) || 0;
                    const statusMap = {
                      queue: '排队中',
                      running: '生成中',
                      retrying: `重试中${retryCount > 0 ? ` · ${retryCount}` : ''}`,
                      done: '已完成',
                      error: '失败',
                      stalled: '中断'
                    };
                    return statusMap[t.status] || '未知';
                  })();
        const statusClass = `status ${t.timedOut ? 'timedout' : t.status}`;
        const msg = t.message || '';
        const msgColor = t.status === 'retrying' ? '#b45309' : '#f87171';
        const metaText = t.meta ? [t.meta.resolution, t.meta.duration].filter(Boolean).join(' · ') : '';
        const stepIdx = t.status === 'queue' ? 1 : t.status === 'running' || t.status === 'retrying' ? 2 : 3;
        const stepClass = t.status === 'error' ? 'error' : 'active';
        const missingUrlWarn =
          t.type !== 'character' && t.status === 'done' && !t.url
            ? '<div style="margin-top:6px;font-size:12px;color:#b45309;">未返回视频链接，可能生成失败或后端未返回地址</div>'
            : '';
        const progress = t.progress ?? (t.status === 'done' ? 100 : 0);
        const safeTitle = escapeAttr(t.promptUser || t.promptSnippet || '-');
        const displayTitle = escapeHtml(t.promptSnippet || '-');
        const safeMsg = escapeHtml(msg);
        const metaChip = metaText ? `<span class="task-meta-chip">${escapeHtml(metaText)}</span>` : '';
        const sb = t.storyboard;
        const policyHit =
          t.status === 'error' &&
          (t.errorKind === 'policy' ||
            isContentPolicyViolation(t.message || '') ||
            isContentPolicyViolation(t.logTail || '') ||
            isContentPolicyViolation(String(t.logFull || '').slice(-800)));
        const canEditStoryboardPrompt = !!(policyHit && sb && sb.label);
        const sbChip =
          sb && sb.label
            ? `<span class="task-tag-chip storyboard" title="${escapeAttr(
                [sb.title, sb.label].filter(Boolean).join(' · ')
              )}">${escapeHtml(sb.label)}</span>`
            : '';
        const sbTitleChip =
          sb && sb.title
            ? `<span class="task-tag-chip" title="${escapeAttr(sb.title)}">${escapeHtml(sb.title)}</span>`
            : '';
        const wmStage = t.wmStage ? String(t.wmStage) : '';
        const wmAttempt =
          typeof t.wmAttempt === 'number' ? t.wmAttempt : parseInt(String(t.wmAttempt || '0'), 10) || 0;
        const wmLabel = wmStage
          ? wmStage === 'cancelled'
            ? '已取消去水印'
            : wmStage === 'ready'
              ? '无水印已就绪'
              : '等待去水印'
          : '';
        const wmChip = wmStage
          ? `<span class="task-tag-chip watermark" title="去水印处理中">${wmLabel}${wmAttempt > 0 ? ` · ${wmAttempt}` : ''}</span>`
          : '';
        const progressWidth = Math.max(0, Math.min(100, progress));
        if (t.collapsed && t.status === 'done') {
          return `
          <div class="task-card" data-status="${t.status}" data-id="${t.id}">
            <div class="task-main">
              <div class="task-head">
                <div class="task-id-pill">任务 ${t.id}</div>
                ${sbChip}
                ${wmChip}
                <div class="${statusClass}" data-task-status="1">${statusText}</div>
                ${metaChip}
                ${sbTitleChip}
              </div>
              <div class="task-title ellipsis" data-task-title="1" title="${safeTitle}">${displayTitle}</div>
              <div class="muted" style="font-size:12px;">已折叠，点击展开查看详情</div>
            </div>
            <div class="task-actions">
              ${t.url ? `<button class="link-btn" data-url="${escapeHtml(t.url)}" data-type="${escapeAttr(t.type || 'video')}">预览</button>` : ''}
              <button class="link-btn" data-expand="${t.id}">展开</button>
            </div>
          </div>
        `;
        }
        return `
          <div class="task-card" data-status="${t.status}" data-id="${t.id}">
            <div class="task-main">
            <div class="task-head">
              <div class="task-id-pill">任务 ${t.id}</div>
              ${sbChip}
              ${wmChip}
              <div class="${statusClass}" data-task-status="1">${statusText}</div>
              ${metaChip}
              ${sbTitleChip}
            </div>
              <div class="task-title ellipsis" data-task-title="1" title="${safeTitle}">${displayTitle}</div>
              <div data-task-msg="1" style="font-size:12px;color:${msgColor};${msg ? '' : 'display:none;'}">${safeMsg}</div>
              ${missingUrlWarn}
              <div>
                <div class="progress-shell" data-task-progress-shell="1" role="progressbar" aria-label="任务进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressWidth}">
                  <div class="progress-bar" data-task-progress-bar="1" style="width:${progressWidth}%;"></div>
                </div>
                <div class="progress-info">
                  <span data-task-progress-text="1">进度：${progress}%</span>
                  <span class="muted">排队 · 生成 · 完成</span>
                </div>
                <div class="task-steps">
                  <div class="task-step ${stepIdx >= 1 ? stepClass : ''}"></div>
                  <div class="task-step ${stepIdx >= 2 ? stepClass : ''}"></div>
                  <div class="task-step ${stepIdx >= 3 ? stepClass : ''}"></div>
                </div>
              </div>
            </div>
            <div class="task-actions">
              ${t.url ? `<button class="link-btn" data-url="${escapeHtml(t.url)}" data-type="${escapeAttr(t.type || 'video')}">预览</button>` : ''}
              ${
                t.status === 'running' && t.wmCanCancel && t.remoteTaskId
                  ? `<button class="link-btn" data-cancel-wm="${t.id}" ${t.wmCancelling ? 'disabled' : ''}>${
                      t.wmCancelling ? '取消中...' : '取消去水印等待'
                    }</button>`
                  : ''
              }
              ${canEditStoryboardPrompt ? `<button class="link-btn" data-edit-storyboard="${t.id}">修改分镜提示词</button>` : ''}
              ${
                t.status === 'retrying' &&
                t.retryMode === 'submit' &&
                (typeof t.retryCount === 'number' ? t.retryCount : parseInt(String(t.retryCount || '0'), 10) || 0) >= 3
                  ? `<button class="link-btn" data-abort-retry="${t.id}">中断重试</button>`
                  : ''
              }
              ${t.timedOut || t.status === 'error' || (!t.url && t.status === 'done') ? `<button class="link-btn" data-retry="${t.id}">重试</button>` : ''}
              ${t.status === 'stalled' ? `<button class="link-btn" data-continue="${t.id}">继续</button>` : ''}
              ${t.promptUser ? `<button class="link-btn" data-reuse="${t.id}">复用提示</button>` : ''}
              <button class="link-btn" data-log="${t.id}">查看日志</button>
            </div>
          </div>
        `;
      })
      .join('');
    taskList.innerHTML = groupBar + (html || '<div class="muted">暂无任务</div>');

    const flashCard = (btn) => {
      const card = btn.closest('.task-card');
      if (!card) return;
      card.classList.add('flash', 'flash-bg');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => card.classList.remove('flash', 'flash-bg'), 800);
    };
    const smoothFocus = (el) => {
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el.focus) el.focus({ preventScroll: true });
      el.classList.add('flash-bg');
      setTimeout(() => el.classList.remove('flash-bg'), 600);
    };
    const flashPreview = (url, info = null) => {
      setRightTab('preview');
      try {
        // 若当前过滤会把目标结果隐藏，则自动切换到可见的过滤条件（避免“点了查看但预览空白”）
        const tid = info && typeof info.taskId === 'number' ? info.taskId : null;
        const hintType = info && info.type ? String(info.type) : '';
        const t = tid ? tasks.find((x) => x.id === tid) : tasks.find((x) => x && x.url === url);
        const desired =
          t && ((t.tag || '') === 'storyboard' || t.storyboard)
            ? 'storyboard'
            : String((t && t.type) || hintType || '').toLowerCase() === 'image'
              ? 'image'
              : 'video';
        if (t && !taskMatchesPreviewFilter(t, previewFilter)) {
          setPreviewFilter(desired, { toast: true });
        } else {
          // 兜底：确保 DOM 已按当前过滤重建
          renderPreviews();
        }
      } catch (_) {
        renderPreviews();
      }

      requestAnimationFrame(() => {
        const cards = Array.from(previewGrid.querySelectorAll('.preview-card'));
        const target = cards.find((c) => {
          const media = c.querySelector('video,img');
          return media && media.getAttribute('src') === url;
        });
        const el = target || previewGrid;
        cards.forEach((c) => c.classList.remove('spotlight'));
        el.classList.add('spotlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.classList.remove('spotlight'), 1300);
      });
    };

    taskList.querySelectorAll('.link-btn[data-url]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        const type = btn.getAttribute('data-type');
        const card = btn.closest('.task-card');
        const tid = card ? parseInt(card.getAttribute('data-id'), 10) : null;
        flashPreview(url, { taskId: !isNaN(tid) ? tid : null, type });
        flashCard(btn);
      });
    });
    taskList.querySelectorAll('[data-reuse]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-reuse'), 10);
        const t = tasks.find((x) => x.id === id);
        if (t && t.promptUser) {
          promptBox.value = t.promptUser;
          analyzePromptHints();
          showToast('提示已填充');
          smoothFocus(promptBox);
          flashCard(btn);
        }
      });
    });
    taskList.querySelectorAll('[data-edit-storyboard]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-edit-storyboard'), 10);
        if (!id) return;
        openEditStoryboardModal(id);
        flashCard(btn);
      });
    });
    taskList.querySelectorAll('[data-abort-retry]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-abort-retry'), 10);
        const ctl = taskRetryControls.get(id);
        if (ctl) {
          ctl.cancelled = true;
          try {
            if (typeof ctl.abortFetch === 'function') ctl.abortFetch();
          } catch (_) {
            /* ignore */
          }
        }
        updateTask(id, { status: 'error', message: '已中断自动重试（可点击“重试”再次发起）' });
        showToast('已中断自动重试', 'warn', { title: '已中断' });
        flashCard(btn);
      });
    });
    taskList.querySelectorAll('[data-retry]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.getAttribute('data-retry'), 10);
        const t = tasks.find((x) => x.id === id);
        const apiKey = $('apiKey').value.trim();
        const baseUrl = getBaseUrl();
        if (!apiKey || !baseUrl) {
          showToast('请先填写 API Key 和服务器地址');
          return;
        }
        if (!t) {
          showToast('未找到该任务，无法重试', 'error', { title: '重试失败', duration: 2600 });
          return;
        }
        const job = {
          taskId: id,
          promptSend: t.promptSend || '',
          promptUser: t.promptUser || '',
          // 允许“空提示词 + 仅素材”的任务重试：素材仅保留在内存（刷新后不保证存在）
          file: t._inputFile || null,
          fileDataUrl: t._inputFileDataUrl || null,
          model: t.model || $('model').value,
          storyboard: t.storyboard || null
        };
        if (!job.promptSend && !job.file && !job.fileDataUrl) {
          showToast('该任务没有可复用的提示词/素材，仍将尝试重试（可能失败）', 'warn', {
            title: '空输入重试',
            duration: 4200
          });
        } else if (!job.promptSend && (job.file || job.fileDataUrl)) {
          showToast('空提示词重试：将只带素材提交（允许）', 'info', { title: '正在重试', duration: 2200 });
        } else {
          showToast('正在重试该任务', 'info');
        }
        await runJobs(
          [job],
          apiKey,
          baseUrl,
          1
        );
        flashCard(btn);
      });
    });
    taskList.querySelectorAll('[data-continue]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.getAttribute('data-continue'), 10);
        const t = tasks.find((x) => x.id === id);
        const apiKey = $('apiKey').value.trim();
        const baseUrl = getBaseUrl();
        if (!apiKey || !baseUrl) {
          showToast('请先填写 API Key 和服务器地址');
          return;
        }
        if (!t) {
          showToast('未找到该任务，无法继续', 'error', { title: '继续失败', duration: 2600 });
          return;
        }
        const job = {
          taskId: id,
          promptSend: t.promptSend || '',
          promptUser: t.promptUser || '',
          file: t._inputFile || null,
          fileDataUrl: t._inputFileDataUrl || null,
          model: t.model || $('model').value,
          storyboard: t.storyboard || null
        };
        if (!job.promptSend && !job.file && !job.fileDataUrl) {
          showToast('该任务没有可复用的提示词/素材，仍将尝试继续（可能失败）', 'warn', {
            title: '空输入继续',
            duration: 4200
          });
        } else if (!job.promptSend && (job.file || job.fileDataUrl)) {
          showToast('空提示词继续：将只带素材提交（允许）', 'info', { title: '正在继续', duration: 2200 });
        } else {
          showToast('正在继续该任务', 'info');
        }
        await runJobs(
          [job],
          apiKey,
          baseUrl,
          1
        );
        flashCard(btn);
      });
    });
    taskList.querySelectorAll('[data-log]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-log'), 10);
        const t = tasks.find((x) => x.id === id);
        if (t) {
          currentLogTaskId = t.id;
          renderTaskLogList();
          renderTaskLogContent();
          setRightTab('log');
          smoothFocus(logTaskPanel || out);
        } else {
          showToast('未找到该任务日志');
        }
        flashCard(btn);
      });
    });
    taskList.querySelectorAll('[data-cancel-wm]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.getAttribute('data-cancel-wm'), 10);
        const t = tasks.find((x) => x.id === id);
        if (!t || !t.remoteTaskId) {
          showToast('缺少 task_id，无法取消去水印等待');
          return;
        }
        const apiKey = $('apiKey').value.trim();
        const baseUrl = getBaseUrl();
        if (!apiKey || !baseUrl) {
          showToast('请先填写 API Key 和服务器地址');
          return;
        }
        if (t.wmCancelling) return;

        updateTask(id, { wmCancelling: true });
        try {
          const resp = await fetch(
            `${baseUrl}/v1/tasks/${encodeURIComponent(t.remoteTaskId)}/watermark/cancel`,
            {
              method: 'POST',
              headers: {
                Authorization: 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
              }
            }
          );
          if (!resp.ok) {
            throw new Error('HTTP ' + resp.status);
          }
          showToast('已发送取消去水印请求', 'success');
        } catch (e) {
          updateTask(id, { wmCancelling: false });
          showToast(`取消失败: ${e?.message || String(e)}`, 'error');
        }
        flashCard(btn);
      });
    });
    taskList.querySelectorAll('[data-expand]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-expand'), 10);
        updateTask(id, { collapsed: false });
      });
    });
    taskList.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-filter') || '';
        statusFilter = statusFilter === target ? '' : target;
        renderTasks();
      });
    });
    taskList.querySelectorAll('[data-tag]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tag') || '';
        tagFilter = tagFilter === target ? '' : target;
        renderTasks();
      });
    });

    setTaskCount();
    updateTaskBubble();
    // 日志面板只有在用户正在查看时才更新，避免流式更新导致每个 chunk 都重绘日志列表
    if (currentRightTab === 'log') renderLogPanel();
    // 任务状态同步给管理台（任务球/抽屉），用节流发送避免流式每个 chunk 都跨 iframe 重绘
    schedulePostTaskState({ immediate: true });
  };

  const renderPreviews = () => {
    if (!previewGrid) return;
    const fullList = tasks.filter((t) => t && t.url && isValidMediaUrl(t.url));
    const list = fullList.filter((t) => taskMatchesPreviewFilter(t, previewFilter));
    previewGrid.innerHTML = '';
    // 防止 URL 去重集合无限增长（任务多、URL 长时会占内存）
    try {
      const limit = 1200;
      while (previewKnown.size > limit) {
        const first = previewKnown.values().next().value;
        previewKnown.delete(first);
      }
    } catch (_) {
      /* ignore */
    }

    if (previewCount) {
      const nextText = !fullList.length
        ? ''
        : `显示 ${list.length}/${fullList.length}${previewFilter === 'all' ? '' : ` · ${previewFilterLabel(previewFilter)}`}`;
      const prevText = previewCountLastText || (previewCount.textContent || '');
      if (prevText !== nextText) {
        previewCount.textContent = nextText;
        previewCountLastText = nextText;
        try {
          const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (reduce) throw new Error('reduced-motion');
          if (nextText) {
            // 轻防抖：避免流式频繁重绘导致“闪烁噪声”
            if (previewCountFlashTimer) clearTimeout(previewCountFlashTimer);
            previewCount.classList.remove('count-flash');
            void previewCount.offsetWidth;
            previewCount.classList.add('count-flash');
            previewCountFlashTimer = setTimeout(() => {
              try {
                previewCount.classList.remove('count-flash');
              } catch (_) {}
              previewCountFlashTimer = null;
            }, 1900);
          }
        } catch (_) {
          /* ignore */
        }
      }
    }

    if (fullList.length === 0) {
      // 预览为空：清空 URL 去重集合即可；未读红点由“已看过的任务 id 集合”控制
      previewGrid.innerHTML = '<div class="muted" style="padding:12px;">暂无预览结果。生成完成后会在这里出现。</div>';
      previewsHydrated = true;
      updateUnreadDots();
      return;
    }

    if (list.length === 0) {
      previewGrid.innerHTML =
        '<div class="muted" style="padding:12px;">当前过滤条件下暂无结果。可切换到“全部”查看。</div>';
      previewsHydrated = true;
      updateUnreadDots();
      return;
    }

    // Tasks are stored newest-first (unshift). We render oldest-first and prepend each card,
    // so the final DOM order stays newest-first.
    list
      .slice()
      .reverse()
      .forEach((t) => {
        const metaText = t.meta ? [t.meta.resolution, t.meta.duration, t.meta.info].filter(Boolean).join(' · ') : '';
        addPreviewCard(t.url, t.type, false, metaText || null, t.id);
      });

    previewsHydrated = true;
    updateUnreadDots();
  };

  const addPreviewCard = (url, type = 'video', push = true, meta = null, taskId = null) => {
    if (!url || !isValidMediaUrl(url)) return false;
    const exists = Array.from(previewGrid.querySelectorAll('.preview-card')).some((card) => {
      const el = card.querySelector('video,img');
      const src = el ? el.getAttribute('src') : '';
      return src === url;
    });
    if (exists) return false;
    const isNew = !previewKnown.has(url);
    previewKnown.add(url);
    const card = document.createElement('div');
    card.className = 'preview-card';
    try {
      // Set 有插入顺序：只保留最近一段时间的 URL，避免无上限增长
      const limit = 1200;
      while (previewKnown.size > limit) {
        const first = previewKnown.values().next().value;
        previewKnown.delete(first);
      }
    } catch (_) {
      /* ignore */
    }
    if (previewsHydrated && isNew) {
      card.classList.add('preview-new');
      setTimeout(() => {
        try {
          card.classList.remove('preview-new');
        } catch (_) {}
      }, 3600);
    }
    // Escape URLs for HTML attributes/text (avoid `&bar` style entity decoding).
    const safeUrlAttr = escapeHtml(url);
    const safeUrlText = safeUrlAttr;
    if (type === 'image') {
      card.innerHTML = `<img src="${safeUrlAttr}" alt="preview">`;
    } else {
      card.innerHTML = `<video src="${safeUrlAttr}" autoplay muted loop playsinline></video>`;
    }
    if (taskId) {
      const wrap = document.createElement('div');
      wrap.style.position = 'absolute';
      wrap.style.top = '10px';
      wrap.style.left = '10px';
      wrap.style.zIndex = '2';
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '6px';

      const badge = document.createElement('div');
      badge.className = 'task-id-pill'; // 统一编号视觉
      badge.textContent = `任务 ${taskId}`;
      badge.style.cursor = 'pointer';
      badge.title = '点击定位到任务卡片';
      wrap.appendChild(badge);

      const t = tasks.find((x) => x.id === taskId);
      const sbLabel = t && t.storyboard && t.storyboard.label ? String(t.storyboard.label) : '';
      if (sbLabel) {
        const sb = document.createElement('div');
        sb.className = 'task-tag-chip storyboard';
        sb.textContent = sbLabel;
        wrap.appendChild(sb);
      }
      const wmStage = t && t.wmStage ? String(t.wmStage) : '';
      const wmAttempt =
        t && typeof t.wmAttempt === 'number' ? t.wmAttempt : t ? parseInt(String(t.wmAttempt || '0'), 10) || 0 : 0;
      if (wmStage) {
        const wm = document.createElement('div');
        wm.className = 'task-tag-chip watermark';
        wm.textContent =
          wmStage === 'cancelled'
            ? '已取消去水印'
            : wmStage === 'ready'
              ? '无水印'
              : `去水印中${wmAttempt > 0 ? ` · ${wmAttempt}` : ''}`;
        wrap.appendChild(wm);
      }
      card.style.position = 'relative';
      card.appendChild(wrap);

      // Clicking the task badge focuses the corresponding task card.
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        setRightTab('tasks');
        requestAnimationFrame(() => {
          const el = taskList?.querySelector(`.task-card[data-id="${taskId}"]`);
          if (!el) return;
          el.classList.add('spotlight');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => el.classList.remove('spotlight'), 1300);
        });
      });
    }
    const info = document.createElement('div');
    info.className = 'preview-info';
    const downloadHrefRaw = normalizeTmpDownloadUrl(url);
    const downloadHref = escapeHtml(downloadHrefRaw);
    let downloadName = '';
    try {
      const t = taskId ? tasks.find((x) => x.id === taskId) : null;
      downloadName = buildDownloadFilename(t, downloadHrefRaw, type, 1);
    } catch (_) {
      downloadName = '';
    }
    info.innerHTML = `
      <span class="preview-url muted" title="${safeUrlAttr}">${safeUrlText}</span>
      ${meta ? `<span class="chip">${escapeHtml(meta)}</span>` : ''}
      <div class="preview-actions">
        <button class="link-btn" data-open="1">查看</button>
        ${taskId ? `<button class="link-btn" data-focus-task="${taskId}">定位任务</button>` : ''}
        <a class="link-btn" href="${downloadHref}" download="${escapeHtml(downloadName || '')}" rel="noreferrer" title="${escapeHtml(
          downloadName || '下载'
        )}">下载</a>
        <button class="link-btn" data-copy="${safeUrlAttr}">复制链接</button>
      </div>
    `;
    card.appendChild(info);
    previewGrid.prepend(card);

    // 如果用户正在看“预览”页，新产出的预览默认视为已读（避免离开后红点又冒出来）
    if (taskId && currentRightTab === 'preview') {
      markPreviewSeen(taskId);
    }
    updateUnreadDots();

    // 隐藏原生控件后仍支持点击播放/暂停
    if (type !== 'image') {
      const v = card.querySelector('video');
      if (v) {
        v.controls = false;
        v.addEventListener('click', () => {
          if (v.paused) v.play();
          else v.pause();
        });
      }
    }

    card.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(
          () => showToast('已复制链接'),
          () => showToast('复制失败')
        );
      });
    });

    card.querySelectorAll('[data-focus-task]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tid = parseInt(btn.getAttribute('data-focus-task') || '0', 10);
        if (!tid) return;
        setRightTab('tasks');
        requestAnimationFrame(() => {
          const el = taskList?.querySelector(`.task-card[data-id="${tid}"]`);
          if (!el) return;
          el.classList.add('spotlight');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => el.classList.remove('spotlight'), 1300);
        });
      });
    });

    card.querySelectorAll('[data-open]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openPreviewModal(url, type, taskId);
      });
    });

    if (push) {
      // 预览仅用于展示，不写回任务
    }
    return isNew;
  };

  const syncRoleCardToLibrary = (card) => {
    if (!card) return;
    const username = card.username || card.display_name || '';
    if (!username) return;
    const exists = roles.some((r) => (r.username || r.display_name) === username);
    if (exists) return;
    roles.unshift({
      username,
      display_name: card.display_name || username,
      description: card.bio || card.instruction_set || card.description || '',
      avatar_path: card.avatar || card.avatar_url || ''
    });
    renderRoles();
  };

  const persistTasks = () => {
    const compact = tasks
      .slice(0, 20)
      .map(
        ({
          id,
          status,
          promptSnippet,
          promptUser,
          promptSend,
          url,
          type,
          message,
          meta,
          logTail,
          logFull,
          progress,
          collapsed,
          tag,
          storyboard
        }) => ({
          id,
          status,
          promptSnippet,
          promptUser,
          promptSend,
          url,
          type,
          message,
          meta,
          logTail,
          logFull: (logFull || '').slice(-LOG_MAX_CHARS),
          progress,
          collapsed: !!collapsed,
          tag: tag || '',
          storyboard: storyboard || null
        })
      );
    localStorage.setItem(taskStorageKey, JSON.stringify(compact));
  };

  const loadTasksFromStorage = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(taskStorageKey) || '[]');
      if (Array.isArray(saved)) {
        tasks = saved.map((t) => {
          const base = {
            ...t,
            promptUser: t.promptUser ?? t.promptFull ?? '',
            promptSend: t.promptSend ?? t.promptFull ?? '',
            promptFull: undefined,
            logFull: t.logFull || '',
            collapsed: !!t.collapsed,
            tag: t.tag || '',
            storyboard: t.storyboard || null
          };
          if (base.status === 'running' || base.status === 'queue') {
            return { ...base, status: 'stalled', message: '刷新后任务可能中断，请点击继续或重试', progress: base.progress ?? 0 };
          }
          return base;
        });
        if (tasks.length) {
          taskIdCounter = Math.max(...tasks.map((t) => t.id)) + 1;
          if (currentLogTaskId === null) currentLogTaskId = tasks[0].id;
        }
      }
    } catch (_) {
      tasks = [];
    }
  };

  const persistRoles = () => {
    try {
      localStorage.setItem(roleStorageKeyMain, JSON.stringify(attachedRoles));
    } catch (_) {
      /* ignore */
    }
  };

  const persistRolesMulti = () => {
    try {
      localStorage.setItem(roleStorageKeyMulti, JSON.stringify(attachedRolesMulti));
    } catch (_) {
      /* ignore */
    }
  };

  const persistRolesStoryboard = () => {
    try {
      localStorage.setItem(roleStorageKeyStoryboard, JSON.stringify(attachedRolesStoryboard));
    } catch (_) {
      /* ignore */
    }
  };

  const loadRolesFromStorage = () => {
    // 主提示（单次/同提示）全局挂载：兼容旧 key，避免升级后丢失
    try {
      const rawMain = localStorage.getItem(roleStorageKeyMain);
      const rawLegacy = localStorage.getItem(roleStorageKeyLegacy);
      const parsed = JSON.parse((rawMain || rawLegacy || '[]').toString());
      attachedRoles = Array.isArray(parsed) ? parsed : [];
      // 首次迁移：把 legacy 写回 main，后续就只读 main
      if (!rawMain && rawLegacy) {
        try {
          localStorage.setItem(roleStorageKeyMain, JSON.stringify(attachedRoles));
        } catch (_) {
          /* ignore */
        }
      }
    } catch (_) {
      attachedRoles = [];
    }

    // 多提示/分镜：各自独立的“本模式全局角色”
    try {
      const parsed = JSON.parse((localStorage.getItem(roleStorageKeyMulti) || '[]').toString());
      attachedRolesMulti = Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      attachedRolesMulti = [];
    }
    try {
      const parsed = JSON.parse((localStorage.getItem(roleStorageKeyStoryboard) || '[]').toString());
      attachedRolesStoryboard = Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      attachedRolesStoryboard = [];
    }
  };

  const addTask = (promptSnippet, promptUser, promptSend, extra = null) => {
    const modelId = extra && extra.model ? String(extra.model) : '';
    const modelInfo = parseModelId(modelId);
    const t = {
      id: taskIdCounter++,
      status: 'queue',
      model: modelId,
      promptSnippet,
      promptUser: promptUser || '',
      promptSend: promptSend || '',
      url: null,
      // 预设 mediaType：用于预览区正确选择 img/video 组件（避免“生成图片但套用视频逻辑”）
      // 后续会在流式解析出真实 URL 后再次校正。
      type: modelInfo.isImage ? 'image' : modelInfo.isVideo ? 'video' : 'video',
      meta: null,
      logTail: '',
      logFull: '',
      // Retry UX (submit retry / manual retry). Kept lightweight and persisted.
      retryMode: '',
      retryCount: 0,
      // Used to decide whether to show special “edit storyboard prompt” button, etc.
      errorKind: '',
      // Sora task_id (from backend) - used for watermark-free cancel endpoint.
      remoteTaskId: null,
      // Watermark-free waiting UI state (filled from streaming delta.wm).
      wmStage: '',
      wmAttempt: 0,
      wmCanCancel: false,
      wmCancelling: false,
      // 任务标签/分组：用于“分镜”筛选与编号展示
      tag: extra && extra.storyboard ? 'storyboard' : '',
      storyboard: extra && extra.storyboard ? extra.storyboard : null
    };
    tasks.unshift(t);
    // 流式/并发下 addTask 也可能很频繁：用节流渲染与节流持久化避免卡顿
    scheduleRender({ tasks: true, previews: false });
    // 占位卡创建属于“对象恒常性”关键节点：尽量立即落盘，避免用户刷新后丢失
    schedulePersistTasks({ immediate: true });
    if (currentRightTab !== 'tasks') {
      unread.tasks = true;
    }
    updateUnreadDots();
    return t.id;
  };

  const collapseTimers = new Map();
  // 任务级“自动重试/中断重试”控制柄（避免 UI 与运行时脱钩）
  // Map<taskId, { cancelled: boolean, abortFetch: null | (() => void) }>
  const taskRetryControls = new Map();

  // ===== 渲染/持久化节流（关键：解决流式每 chunk 全量重绘导致的卡顿） =====
  let renderQueued = false;
  let needRenderTasks = false;
  let needRenderPreviews = false;

  const scheduleRender = (opts = { tasks: true, previews: false }) => {
    if (opts && opts.tasks) needRenderTasks = true;
    if (opts && opts.previews) needRenderPreviews = true;
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      const doTasks = needRenderTasks;
      const doPreviews = needRenderPreviews;
      needRenderTasks = false;
      needRenderPreviews = false;
      if (doTasks) renderTasks();
      if (doPreviews) renderPreviews();
      updateUnreadDots();
    });
  };

  let persistTasksTimer = null;
  const schedulePersistTasks = (opts = { immediate: false }) => {
    if (opts && opts.immediate) {
      if (persistTasksTimer) clearTimeout(persistTasksTimer);
      persistTasksTimer = null;
      persistTasks();
      return;
    }
    if (persistTasksTimer) return;
    // 轻微延迟把多次 updateTask 合并成一次 localStorage 写入
    persistTasksTimer = setTimeout(() => {
      persistTasksTimer = null;
      persistTasks();
    }, 400);
  };

  // ===== 任务卡“增量 DOM 更新”（关键：解决流式每个 chunk 全量重绘导致的卡顿） =====
  let taskDomSyncQueued = false;
  const taskDomSyncMap = new Map(); // Map<taskId, taskSnapshot>

  const syncTaskCardDom = (t) => {
    if (!taskList || !t) return;
    const id = parseInt(String(t.id || '0'), 10) || 0;
    if (!id) return;
    const card = taskList.querySelector(`.task-card[data-id="${id}"]`);
    if (!card) return;

    // 进度条（仅更新数值/宽度，不重建整卡）
    const progress = Math.max(0, Math.min(100, parseInt(String(t.progress ?? (t.status === 'done' ? 100 : 0)), 10) || 0));
    const bar = card.querySelector('[data-task-progress-bar="1"]');
    if (bar) bar.style.width = `${progress}%`;
    const shell = card.querySelector('[data-task-progress-shell="1"]');
    if (shell) shell.setAttribute('aria-valuenow', String(progress));
    const pText = card.querySelector('[data-task-progress-text="1"]');
    if (pText) pText.textContent = `进度：${progress}%`;

    // 任务消息（运行中/重试中会变化很频繁，改为只更新这一行）
    const msgEl = card.querySelector('[data-task-msg="1"]');
    if (msgEl) {
      const msg = String(t.message || '');
      if (msg) {
        msgEl.textContent = msg;
        msgEl.style.display = '';
        msgEl.style.color = t.status === 'retrying' ? '#b45309' : '#f87171';
      } else {
        msgEl.textContent = '';
        msgEl.style.display = 'none';
      }
    }
  };

  const scheduleTaskCardDomSync = (taskId, taskSnapshot) => {
    if (!taskList) return;
    const id = parseInt(String(taskId || '0'), 10) || 0;
    if (!id) return;
    taskDomSyncMap.set(id, taskSnapshot);
    if (taskDomSyncQueued) return;
    taskDomSyncQueued = true;
    requestAnimationFrame(() => {
      taskDomSyncQueued = false;
      taskDomSyncMap.forEach((t) => {
        try {
          syncTaskCardDom(t);
        } catch (_) {
          /* ignore */
        }
      });
      taskDomSyncMap.clear();
    });
  };

  // 日志 Tab：仅当用户正在查看时才更新，并做 rAF 合并，避免 logFull 每条都重绘
  let logPanelSyncQueued = false;
  const scheduleLogPanelSync = () => {
    if (logPanelSyncQueued) return;
    logPanelSyncQueued = true;
    requestAnimationFrame(() => {
      logPanelSyncQueued = false;
      try {
        if (currentRightTab === 'log') renderLogPanel();
      } catch (_) {
        /* ignore */
      }
    });
  };

  const updateTask = (id, patch) => {
    const idx = tasks.findIndex((t) => t && t.id === id);
    if (idx < 0) return;
    const base = tasks[idx];
    const merged = { ...base, ...patch };
    // 若后续补打的 message 表明角色卡成功，则校正状态
    if (patch.message && /角色卡创建成功/.test(patch.message)) {
      merged.status = 'done';
      merged.type = merged.type || 'character';
    }
    // 合并日志：保留完整日志并截断
    if (patch.logTail !== undefined) {
      merged.logTail = patch.logTail;
    }
    if (patch.logFull !== undefined) {
      merged.logFull = (patch.logFull || '').slice(-LOG_STORE_LIMIT);
    }
    if (patch.timedOut !== undefined) {
      merged.timedOut = patch.timedOut;
    }
    tasks[idx] = merged;
    const changed = merged;
    if (patch.status === 'done' && changed && !changed.collapsed) {
      if (!collapseTimers.has(id)) {
        const timer = setTimeout(() => {
          tasks = tasks.map((t) => (t.id === id ? { ...t, collapsed: true } : t));
          collapseTimers.delete(id);
          scheduleRender({ tasks: true, previews: false });
          schedulePersistTasks();
        }, 3000);
        collapseTimers.set(id, timer);
      }
    }
    // 任务列表基本每次都要更新（进度/状态/消息），但预览墙只在 url/meta/tag 等关键字段变化时更新
    const affectsPreview =
      patch.url !== undefined ||
      patch.type !== undefined ||
      patch.meta !== undefined ||
      patch.wmStage !== undefined ||
      patch.wmAttempt !== undefined ||
      patch.storyboard !== undefined ||
      patch.tag !== undefined;

    // “全量重绘任务列表”很贵：流式输出时只做“增量 DOM 更新”，把全量 render 留给结构性变化
    const patchKeys = patch && typeof patch === 'object' ? Object.keys(patch) : [];
    const onlyLogPatch =
      patchKeys.length > 0 && patchKeys.every((k) => k === 'logFull' || k === 'logTail');
    const heavyKeys = new Set([
      'status',
      'url',
      'type',
      'meta',
      'tag',
      'storyboard',
      'collapsed',
      'retryMode',
      'retryCount',
      'timedOut',
      'wmStage',
      'wmAttempt',
      'wmCanCancel',
      'wmCancelling',
      'remoteTaskId'
    ]);
    let needFullTasksRender = patchKeys.some((k) => heavyKeys.has(k));
    // 兜底：某些情况下会通过 message 修正 status（例如“角色卡创建成功”）
    if ((merged && merged.status) !== (base && base.status)) needFullTasksRender = true;
    if ((merged && !!merged.timedOut) !== (base && !!base.timedOut)) needFullTasksRender = true;

    if (needFullTasksRender) {
      scheduleRender({ tasks: true, previews: affectsPreview });
      schedulePostTaskState({ immediate: true });
    } else {
      // 增量更新：只更新该任务卡的进度/消息（不卡 UI、不重绑事件）
      const needDom = patch.progress !== undefined || patch.message !== undefined;
      if (needDom) scheduleTaskCardDomSync(id, merged);
      if (affectsPreview) scheduleRender({ tasks: false, previews: true });
      // 日志 Tab：用户正在查看时才刷新（logFull 每条都更新会非常卡）
      if (
        currentRightTab === 'log' &&
        (patch.logFull !== undefined || patch.logTail !== undefined || patch.message !== undefined)
      ) {
        scheduleLogPanelSync();
      }
      // 给管理台任务抽屉同步：logFull/logTail 不需要（抽屉不展示日志），避免无意义跨 iframe 重绘
      if (!onlyLogPatch) schedulePostTaskState({ immediate: false });
    }
    // 同步内存日志缓存，便于复制与展示
    if (patch.logFull !== undefined || patch.logTail !== undefined) {
      const logText =
        (patch.logFull || patch.logTail || taskLogBuffer[id] || '').slice(-LOG_STORE_LIMIT);
      taskLogBuffer[id] = logText;
    }
    schedulePersistTasks();
  };

  const updateTaskBubble = () => {
    const running = tasks.filter((t) => t.status === 'running' || t.status === 'retrying' || t.status === 'queue').length;
    const total = tasks.length;
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'task_count', running, total }, '*');
      }
    } catch (_) {}
  };

  // 任务列表状态（给管理台任务抽屉用）：节流发送，避免流式每个 chunk 都触发父页面重渲染
  let postTaskStateTimer = null;
  const postTaskStateNow = () => {
    try {
      if (!(window.parent && window.parent !== window)) return;
      const summary = tasks.map((t) => ({
        id: t.id,
        status: t.status,
        prompt: t.promptSnippet,
        url: t.url,
        meta: t.meta,
        message: t.message,
        progress: t.progress ?? 0,
        tag: t.tag || '',
        storyboard: t.storyboard || null
      }));
      window.parent.postMessage({ type: 'task_state', tasks: summary }, '*');
    } catch (_) {
      /* ignore */
    }
  };
  const schedulePostTaskState = (opts = { immediate: false }) => {
    const immediate = !!(opts && opts.immediate);
    if (immediate) {
      if (postTaskStateTimer) clearTimeout(postTaskStateTimer);
      postTaskStateTimer = null;
      postTaskStateNow();
      return;
    }
    if (postTaskStateTimer) return;
    postTaskStateTimer = setTimeout(() => {
      postTaskStateTimer = null;
      postTaskStateNow();
    }, 450);
  };

  // 右侧 tab 切换
  let currentRightTab = localStorage.getItem(RIGHT_TAB_KEY) || 'tasks';
  const unread = { tasks: false, preview: false, log: false };
  let onlyRunning = false;
  let densePreview = localStorage.getItem(PREVIEW_DENSE_KEY) === '1';
  let statusFilter = '';
  // 预览未读：用“已看过的任务 id”做集合判定，避免 URL 变化/重渲染导致红点反复出现
  let previewSeenTaskIds = new Set();
  let logVersion = 0;
  let logSeenVersion = 0;
  const previewKnown = new Set(); // 仅用于避免同一 URL 重复加卡
  let previewsHydrated = false;
  let previewCountLastText = '';
  let previewCountFlashTimer = null;
  let currentLogTaskId = null;
  let taskLogBuffer = {};
  const setRightTab = (tab) => {
    currentRightTab = tab;
    localStorage.setItem(RIGHT_TAB_KEY, tab);
    rightTabButtons.forEach((btn) => btn.classList.toggle('active', btn.getAttribute('data-tab') === tab));
    rightTabButtons.forEach((btn) => btn.classList.toggle('has-unread', unread[btn.getAttribute('data-tab')] && tab !== btn.getAttribute('data-tab')));
    tabPanelTasks.classList.toggle('active', tab === 'tasks');
    tabPanelPreview.classList.toggle('active', tab === 'preview');
    tabPanelLog.classList.toggle('active', tab === 'log');
    if (tab === 'tasks') unread.tasks = false;
    if (tab === 'preview') markAllPreviewsSeen();
    if (tab === 'log') {
      logSeenVersion = logVersion;
      renderTaskLogList();
      renderTaskLogContent();
    }
    unread[tab] = false;
    updateUnreadDots();
  };

  // 核心：执行一组任务（支持并发）
  const runJobs = async (jobs, apiKey, baseUrl, concurrency = 1) => {
    if (!jobs || !jobs.length) return;
    const poolSize = Math.min(concurrency, jobs.length);
    let cursor = 0;

    const runJob = async (job) => {
      const promptSend = job.promptSend ?? job.prompt ?? '';
      const promptUser = job.promptUser ?? job.prompt ?? '';

      const promptSnippet = promptUser.slice(0, 80) || (job.file ? job.file.name : '(空提示)');
      const extra = { storyboard: job.storyboard || null, model: job.model };

      // 任务热启动：先创建占位任务，避免并发时日志串号 & 增强“对象恒常性”
      // 但“重试/继续”要求不改变任务卡位置：允许复用现有 taskId，原地变为“重试中/生成中”。
      let taskId =
        typeof job.taskId === 'number' ? job.taskId : parseInt(String(job.taskId || ''), 10) || null;
      if (taskId && !tasks.find((t) => t && t.id === taskId)) {
        taskId = null;
      }

      if (!taskId) {
        taskId = addTask(promptSnippet, promptUser, promptSend, extra);
      } else {
        // 若同一任务正在跑（比如用户连续点“重试”），先中断旧的，再启动新的。
        const prev = taskRetryControls.get(taskId);
        if (prev) {
          prev.cancelled = true;
          try {
            if (typeof prev.abortFetch === 'function') prev.abortFetch();
          } catch (_) {}
        }
        taskLogBuffer[taskId] = '';
        updateTask(taskId, {
          status: 'queue',
          progress: 0,
          timedOut: false,
          message: '准备中…',
          model: job.model,
          // 复用 taskId 时同步刷新媒体类型：避免上一轮是视频，本轮切到图片后预览仍按视频渲染
          type: parseModelId(job.model).isImage ? 'image' : 'video',
          promptSnippet,
          promptUser,
          promptSend,
          url: null,
          meta: null,
          logTail: '',
          logFull: '',
          retryMode: 'manual',
          retryCount: 0,
          errorKind: '',
          remoteTaskId: null,
          wmStage: '',
          wmAttempt: 0,
          wmCanCancel: false,
          wmCancelling: false
        });
        if (extra && extra.storyboard) {
          updateTask(taskId, { tag: 'storyboard', storyboard: extra.storyboard });
        }
      }

      // 占位态：让用户立刻看到“任务已入队”，避免误以为只生成了分镜 1。
      updateTask(taskId, { status: 'queue', model: job.model, errorKind: '', progress: 0, timedOut: false, message: '准备中…' });

      // 记录本次任务的输入素材（用于“空提示也能重试/继续”）。
      // 注意：这里只保留在内存中，避免把大文件 dataURL 写进 localStorage（防卡顿/超额）。
      try {
        const tRef = tasks.find((x) => x && x.id === taskId);
        if (tRef) {
          if (job.file) {
            tRef._inputFile = job.file;
            tRef._inputFileName = job.file.name || '';
            if (tRef._inputFileDataUrl) tRef._inputFileDataUrl = null;
          } else if (job.fileDataUrl) {
            tRef._inputFile = null;
            tRef._inputFileName = '';
            tRef._inputFileDataUrl = job.fileDataUrl;
          }
          tRef._inputHasFile = !!(job.file || job.fileDataUrl);
        }
      } catch (_) {
        /* ignore */
      }

      const contentArr = [];
      if (promptSend) contentArr.push({ type: 'text', text: promptSend });

      // 读文件（可能比较慢）
      try {
        if (job.file) {
          logTask(taskId, `读取文件: ${job.file.name}`);
          const dataUrl = await fileToDataUrl(job.file);
          if ((job.file.type || '').startsWith('video')) {
            contentArr.push({ type: 'video_url', video_url: { url: dataUrl } });
          } else {
            contentArr.push({ type: 'image_url', image_url: { url: dataUrl } });
          }
        } else if (job.fileDataUrl) {
          const url = job.fileDataUrl;
          const isVideo = url.startsWith('data:video') || /\.(mp4|mov|m4v|webm)$/i.test(url);
          if (isVideo) {
            contentArr.push({ type: 'video_url', video_url: { url } });
          } else {
            contentArr.push({ type: 'image_url', image_url: { url } });
          }
        }
      } catch (_) {
        updateTask(taskId, { status: 'error', message: '读取文件失败（请重试或更换文件）', progress: 0 });
        showToast('读取文件失败（请重试或更换文件）', 'error', { title: '文件读取失败', duration: 4200 });
        return;
      }

      const body = {
        model: job.model,
        stream: true,
        messages: [
          {
            role: 'user',
            content: contentArr.length ? contentArr : promptSend
          }
        ]
      };

      // 手动“重试/继续”必须原地变为“重试中”标签（不再保留失败标签）
      if (job.taskId) {
        updateTask(taskId, { status: 'retrying', retryMode: 'manual', retryCount: 0, progress: 0, message: '' });
      } else {
        updateTask(taskId, { status: 'running', retryMode: '', retryCount: 0, progress: 0, message: '' });
      }

      const url = `${baseUrl}/v1/chat/completions`;
      const isRetryable = (errMsg) =>
        /timeout|timed out|HTTP\s*5\d\d|503|502|504|bad gateway|gateway time-out|ENETUNREACH|ECONNRESET|ECONNABORTED|ETIMEDOUT|Failed to connect|network|cloudflare|curl|connection closed|closed abruptly/i.test(
          errMsg || ''
        );

      const retryCtl = { cancelled: false, abortFetch: null };
      taskRetryControls.set(taskId, retryCtl);

      try {
      // 提交上游阶段：不轻易判失败（自动重试，3 次后提供"中断重试"按钮）
      const MAX_RETRY = 9999;
      for (let attempt = 1; attempt <= MAX_RETRY + 1; attempt++) {
        let lastChunk = '';
        let contentAccumulated = '';  // 累积所有 content 字段
        let characterCreated = false;
        let characterCardInfo = null;
        let hadError = false;
        let finished = false;
        let logBufferAttempt = '';
        let watermarkWaitSeen = false; // once seen, disable the 10-min hard timeout and rely on explicit cancel
        let progressMarkerSeen = false; // once seen, do NOT auto-resubmit (avoid duplicates)
        const controller = new AbortController();
        retryCtl.abortFetch = () => controller.abort();
        const HARD_TIMEOUT = 600000; // 10 分钟总超时
        let hardTimer = null;
        const clearTimers = () => {
          if (hardTimer) clearTimeout(hardTimer);
        };

        try {
          if (retryCtl.cancelled) {
            updateTask(taskId, { status: 'error', message: '已中断自动重试（可点击“重试”再次发起）' });
            return;
          }
          // attempt=1：正常生成（或手动重试的首次尝试）
          // attempt>1：仅用于“提交上游失败”类可重试错误的自动重试
          if (attempt > 1) {
            updateTask(taskId, {
              status: 'retrying',
              retryMode: 'submit',
              retryCount: attempt - 1,
              timedOut: false,
              progress: 0
            });
          } else if (job.taskId) {
            updateTask(taskId, { status: 'retrying', retryMode: 'manual', retryCount: 0, timedOut: false, progress: 0 });
          } else {
            updateTask(taskId, { status: 'running', timedOut: false, progress: 0 });
          }

          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + apiKey,
              'Content-Type': 'application/json',
              Accept: 'text/event-stream'
            },
            body: JSON.stringify(body),
            signal: controller.signal
          });

          if (!resp.ok || !resp.body) {
            throw new Error('HTTP ' + resp.status);
          }

          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let mediaUrl = null;
          // 默认按模型推断：避免 URL 无扩展名时误判（图片任务却用 video 预览）
          let mediaType = parseModelId(job.model).isImage ? 'image' : 'video';
          let mediaMeta = null;

          hardTimer = setTimeout(() => controller.abort(), HARD_TIMEOUT);

          logTask(taskId, '连接成功，开始接收流...');
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            lastChunk = chunk || lastChunk;
            chunk.split(/\n\n/).forEach((line) => {
              if (!line.startsWith('data:')) return;
              const data = line.replace(/^data:\s*/, '');
              if (data === '[DONE]') {
                logTask(taskId, '[DONE]');
                finished = true;
                return;
              }
              logTask(taskId, data);
              logBufferAttempt = (logBufferAttempt + data + '\n').slice(-LOG_STORE_LIMIT);
              try {
                const obj = JSON.parse(data);
                const choice = (obj.choices && obj.choices[0]) || {};
                const delta = choice.delta || {};
                if (obj.error) {
                  const pretty = humanizeUpstreamError(obj.error);
                  const errMsg = pretty.message || obj.error.message || obj.error.code || '生成失败';
                  // 仅“提交上游失败/网络瞬断（未进入进度阶段）”自动重试；避免已提交后重复下单
                  if (isRetryable(errMsg) && !progressMarkerSeen && !watermarkWaitSeen) {
                    const retryErr = new Error(errMsg);
                    retryErr.__submitRetryable = true;
                    throw retryErr;
                  }
                  // 内容审查命中：不要自动重试，直接给“可修改分镜提示词”的兜底入口
                  if (isContentPolicyViolation(errMsg)) {
                    hadError = true;
                    const isSb = !!(job.storyboard && job.storyboard.label);
                    const msg = isSb ? '内容审查未通过（可修改分镜提示词后重试）' : '内容审查未通过（请调整提示词后重试）';
                    updateTask(taskId, {
                      status: 'error',
                      errorKind: 'policy',
                      message: msg,
                      logTail: lastChunk,
                      logFull: logBufferAttempt,
                      progress: 0
                    });
                    showToast(msg, 'warn', { title: '内容审查未通过', duration: 5200 });
                    return;
                  }
                  hadError = true;
                  updateTask(taskId, { status: 'error', message: errMsg, logTail: lastChunk, logFull: logBufferAttempt });
                  showToast(errMsg || '生成失败', pretty.type === 'warn' ? 'warn' : 'error', {
                    title: pretty.title || '生成失败',
                    duration: 4200
                  });
                  return;
                }
                const rc = delta.reasoning_content || (choice.message && choice.message.content) || '';

                // Watermark-free waiting (structured, from backend delta.wm)
                if (delta && delta.wm && typeof delta.wm === 'object') {
                  const wm = delta.wm || {};
                  const stage = wm.stage ? String(wm.stage) : '';
                  const attempt =
                    typeof wm.attempt === 'number' ? wm.attempt : parseInt(String(wm.attempt || '0'), 10) || 0;
                  const canCancel = !!wm.can_cancel;
                  const remoteTaskId = wm.task_id ? String(wm.task_id) : '';
                  const patch = { wmStage: stage, wmAttempt: attempt, wmCanCancel: canCancel };
                  if (remoteTaskId) patch.remoteTaskId = remoteTaskId;
                  updateTask(taskId, patch);

                  // Once we enter watermark-free waiting, do not enforce the 10-min hard timeout.
                  if (!watermarkWaitSeen) {
                    watermarkWaitSeen = true;
                    if (hardTimer) {
                      clearTimeout(hardTimer);
                      hardTimer = null;
                    }
                  }
                }

                // 解析 delta.content 里嵌入的 JSON（character_card）
                const rawContent =
                  delta.content ||
                  (choice.message && choice.message.content) ||
                  obj.content ||
                  '';
                const finishReason = choice.finish_reason || choice.native_finish_reason || delta.finish_reason;
                const deltaContent = typeof delta.content === 'string' ? delta.content : '';
                const deltaReasoning = typeof delta.reasoning_content === 'string' ? delta.reasoning_content : '';

                // 累积 content 字段
                if (deltaContent) {
                  contentAccumulated += deltaContent;
                }

                // 内容审查：Sora 可能以 reasoning/content 形式返回（不一定走 obj.error）
                const policyText = [deltaReasoning, deltaContent, rc, rawContent].filter(Boolean).join('\n');
                if (!hadError && isContentPolicyViolation(policyText)) {
                  hadError = true;
                  const isSb = !!(job.storyboard && job.storyboard.label);
                  const msg = isSb ? '内容审查未通过（可修改分镜提示词后重试）' : '内容审查未通过（请调整提示词后重试）';
                  updateTask(taskId, {
                    status: 'error',
                    errorKind: 'policy',
                    message: msg,
                    logTail: lastChunk,
                    logFull: logBufferAttempt,
                    progress: 0
                  });
                  showToast(msg, 'warn', { title: '内容审查未通过', duration: 5200 });
                  return;
                }
                const characterFailHit =
                  /角色卡创建失败|Character creation failed/i.test(deltaContent) ||
                  /角色卡创建失败|Character creation failed/i.test(deltaReasoning) ||
                  /角色卡创建失败|Character creation failed/i.test(rawContent || '') ||
                  (/character_card/i.test(rawContent || '') && finishReason === 'STOP' && !characterCreated && !mediaUrl);
                if (!hadError && characterFailHit) {
                  const msg =
                    (deltaContent || deltaReasoning || rawContent || '角色卡创建失败')
                    .replace(/^❌\s*/, '')
                    .trim();
                  hadError = true;
                  updateTask(taskId, {
                    status: 'error',
                    type: 'character',
                    message: msg,
                    logTail: lastChunk,
                    logFull: logBufferAttempt,
                    progress: 0
                  });
                  return;
                }
                let innerObj = null;
                if (typeof rawContent === 'string' && rawContent.trim().startsWith('{')) {
                  try {
                    innerObj = JSON.parse(rawContent);
                  } catch (_) {
                    innerObj = null;
                  }
                }

                if (typeof rc === 'string' && /(blocked|guardrail|违规|不支持|限制)/i.test(rc)) {
                  hadError = true;
                  const pretty = humanizeUpstreamError(rc);
                  updateTask(taskId, {
                    status: 'error',
                    message: pretty.message || rc.trim(),
                    logTail: lastChunk,
                    logFull: logBufferAttempt
                  });
                  showToast(pretty.message || rc.trim(), pretty.type === 'warn' ? 'warn' : 'error', {
                    title: pretty.title || '生成失败',
                    duration: 4200
                  });
                  return;
                }
                // 角色卡事件：直接标记为角色卡成功
                const cardPayload = obj.event === 'character_card' || obj.card ? obj : innerObj && innerObj.event === 'character_card' ? innerObj : null;
                if (!cardPayload && typeof data === 'string' && data.includes('"character_card"')) {
                  try {
                    const temp = JSON.parse(data);
                    if (temp && (temp.event === 'character_card' || temp.card)) {
                      cardPayload = temp;
                    }
                  } catch (_) {}
                }
                if (cardPayload && (cardPayload.event === 'character_card' || cardPayload.card)) {
                  const card = cardPayload.card || {};
                  characterCreated = true;
                  characterCardInfo = card;
                  syncRoleCardToLibrary(card);
                  showToast(`角色卡创建成功：@${card.username || card.display_name || '角色'}`);
                  updateTask(taskId, {
                    status: 'done',
                    type: 'character',
                    message: `角色卡创建成功：@${card.username || '角色'}`,
                    meta: { display: card.display_name || card.username || '' },
                    logTail: lastChunk,
                    logFull: logBufferAttempt
                  });
                  return;
                }
                // 进度：结构化字段或 reasoning_content 中的百分比
                const currentProgress =
                  tasks.find((t) => t.id === taskId && !isNaN(parseFloat(t.progress)))?.progress ?? 0;
                let progressVal = null;
                const pctMatch = data.match(/(\d{1,3})%/);
                if (pctMatch) progressMarkerSeen = true;
                if (obj.progress !== undefined && !isNaN(parseFloat(obj.progress))) {
                  progressVal = parseFloat(obj.progress);
                  progressMarkerSeen = true;
                }
                if (obj.delta && typeof obj.delta.reasoning_content === 'string') {
                  const m = obj.delta.reasoning_content.match(/(\d{1,3})%/);
                  if (m) progressVal = Math.max(progressVal ?? 0, parseFloat(m[1]));
                  if (m) progressMarkerSeen = true;
                }
                if (!progressVal && pctMatch) {
                  progressVal = Math.min(100, parseFloat(pctMatch[1]));
                }
                if (!isNaN(progressVal)) {
                  const merged = Math.max(currentProgress, progressVal);
                  updateTask(taskId, { progress: merged });
                }

                // 结构化字段优先
                const output0 = (obj.output && obj.output[0]) || null;
                const deltaOut0 = (delta.output && delta.output[0]) || null;
                // 上游有时会给出明确 type（image/video），即使 URL 没有扩展名也应信任它。
                const declaredTypeRaw = (output0 && output0.type) || (deltaOut0 && deltaOut0.type) || obj.type || '';
                const declaredType = String(declaredTypeRaw || '').toLowerCase();
                const declaredHint = declaredType === 'image' || declaredType === 'video' ? declaredType : '';
                const typeHintFromFields =
                  declaredHint ||
                  (obj.image_url && obj.image_url.url ? 'image' : '') ||
                  (obj.video_url && obj.video_url.url ? 'video' : '') ||
                  (output0 && output0.image_url ? 'image' : '') ||
                  (output0 && output0.video_url ? 'video' : '') ||
                  (deltaOut0 && deltaOut0.image_url ? 'image' : '') ||
                  (deltaOut0 && deltaOut0.video_url ? 'video' : '') ||
                  '';
                const candidates = [
                  obj.url,
                  obj.video_url && obj.video_url.url,
                  obj.image_url && obj.image_url.url,
                  output0 && (output0.url || output0.video_url || output0.image_url),
                  deltaOut0 && (deltaOut0.url || deltaOut0.video_url || deltaOut0.image_url)
                ].filter(Boolean);

                // Capture remote task_id from delta.output if present (used by watermark cancel button)
                if (delta.output && delta.output[0] && delta.output[0].task_id) {
                  updateTask(taskId, { remoteTaskId: String(delta.output[0].task_id) });
                  progressMarkerSeen = true;
                }

                let extractedUrl = candidates[0];

                // content/markdown 中的 <video src> 或直接的媒体链接
                if (!extractedUrl && obj.content) {
                  const htmlMatch = obj.content.match(/<video[^>]+src=['"]([^'"]+)['"]/i);
                  if (htmlMatch) extractedUrl = htmlMatch[1];
                  const mdMatch = obj.content.match(/https?:[^\s)"'<>]+\.(mp4|mov|m4v|webm|png|jpg|jpeg|webp)/i);
                  if (!extractedUrl && mdMatch) extractedUrl = mdMatch[0];
                }
                // 从最新 chunk 中兜底提取媒体链接
                if (!extractedUrl) {
                  const urlMatch = lastChunk.match(/https?:[^\s)"'<>]+\.(mp4|mov|m4v|webm|png|jpg|jpeg|webp)/i);
                  if (urlMatch) extractedUrl = urlMatch[0];
                }

                if (extractedUrl) {
                  mediaUrl = extractedUrl;
                }
                if (mediaUrl) {
                  const u = mediaUrl.toString();
                  const extHint = /\.(png|jpg|jpeg|webp)$/i.test(u) ? 'image' : /\.(mp4|mov|m4v|webm)$/i.test(u) ? 'video' : '';
                  const modelHint = parseModelId(job.model).isImage ? 'image' : 'video';
                  mediaType = typeHintFromFields || extHint || modelHint;
                  const reso =
                    obj.resolution ||
                    (obj.meta && obj.meta.resolution) ||
                    (obj.width && obj.height ? `${obj.width}x${obj.height}` : null);
                  const dur = obj.duration || (obj.meta && obj.meta.duration) || (obj.length && `${obj.length}s`);
                  mediaMeta = [reso, dur].filter(Boolean).join(' · ');
                  updateTask(taskId, {
                    url: mediaUrl,
                    type: mediaType,
                    meta: { resolution: reso || '', duration: dur || '' },
                    logTail: lastChunk,
                    logFull: logBufferAttempt,
                    progress: 100
                  });
                } else {
                  updateTask(taskId, { logTail: lastChunk, logFull: logBufferAttempt });
                }

                // choices.delta/content 兜底提取任意 http(s) 链接
                if (!mediaUrl) {
                  const choice = (obj.choices && obj.choices[0]) || {};
                  const delta = choice.delta || {};
                  const msg = choice.message || {};
                  const contentField = delta.content ?? msg.content ?? obj.content;
                  const outputField = delta.output ?? msg.output ?? obj.output;
                  const tryExtract = (text) => {
                    if (!text) return null;
                    const htmlMatch = text.match(/<video[^>]+src=['"]([^'"]+)['"]/i);
                    if (htmlMatch) return htmlMatch[1];
                    const anyMatch = text.match(/https?:[^\s)"'<>]+/i);
                    return anyMatch ? anyMatch[0] : null;
                  };
                  let extracted = tryExtract(contentField) || tryExtract(lastChunk);
                  if (!extracted && outputField && outputField[0]) {
                    extracted = outputField[0].url || outputField[0].video_url || outputField[0].image_url || null;
                  }
                  if (extracted) {
                    mediaUrl = extracted;
                    const u = mediaUrl.toString();
                    const extHint = /\.(png|jpg|jpeg|webp)$/i.test(u) ? 'image' : /\.(mp4|mov|m4v|webm)$/i.test(u) ? 'video' : '';
                    const modelHint = parseModelId(job.model).isImage ? 'image' : 'video';
                    mediaType = extHint || modelHint;
                    updateTask(taskId, { url: mediaUrl, type: mediaType, logTail: lastChunk, logFull: logBufferAttempt, progress: 100 });
                  }
                }
              } catch (e) {
                if (e && e.__submitRetryable) throw e;
                updateTask(taskId, { logTail: lastChunk, logFull: logBufferAttempt });
              }
            });
            if (hadError || finished) break;
          }

          clearTimers();
          // 结束后兜底：从 lastChunk 任意链接
          if (!mediaUrl) {
            const tailMatch = lastChunk.match(/https?:[^\s)"'<>]+/i);
            if (tailMatch) {
              mediaUrl = tailMatch[0];
              const u = String(mediaUrl || '');
              const extHint = /\.(png|jpg|jpeg|webp)$/i.test(u) ? 'image' : /\.(mp4|mov|m4v|webm)$/i.test(u) ? 'video' : '';
              const modelHint = parseModelId(job.model).isImage ? 'image' : 'video';
              mediaType = extHint || modelHint;
            }
          }

          if (hadError) {
            return;
          }

          // 白名单过滤
          if (mediaUrl && !isValidMediaUrl(mediaUrl)) {
            mediaUrl = null;
          }

          if (mediaUrl) {
            updateTask(taskId, {
              status: 'done',
              url: mediaUrl,
              type: mediaType,
              meta: mediaMeta ? { info: mediaMeta } : null,
              logTail: lastChunk,
              logFull: logBufferAttempt || lastChunk,
              progress: 100
            });
          } else {
            // 检查是否是角色卡创建任务
            const isCharacterTask = job.isCharacterCreation === true;
            const hasCharacterSuccessMsg = /角色创建成功|角色卡创建成功|角色名@/.test(contentAccumulated || lastChunk || '');

            if (characterCreated || characterCardInfo || (isCharacterTask && hasCharacterSuccessMsg)) {
              // 从消息中提取角色名
              let username = characterCardInfo?.username || '';
              if (!username && hasCharacterSuccessMsg) {
                const match = (contentAccumulated || lastChunk || '').match(/角色名@(\w+)/);
                if (match) username = match[1];
              }

              updateTask(taskId, {
                status: 'done',
                type: 'character',
                message: username ? `角色卡创建成功：@${username}` : '角色卡创建成功',
                meta: { display: characterCardInfo?.display_name || username || '' },
                logTail: lastChunk,
                logFull: logBufferAttempt || lastChunk,
                progress: 100
              });

              // 保存角色卡到localStorage
              try {
                const stored = localStorage.getItem('character_cards');
                const cards = stored ? JSON.parse(stored) : [];

                // 创建新的角色卡对象
                const newCard = {
                  id: Date.now(), // 使用时间戳作为ID
                  username: username || 'unknown',
                  display_name: characterCardInfo?.display_name || username || '',
                  description: characterCardInfo?.description || '',
                  avatar_path: characterCardInfo?.avatar_path || '',
                  created_at: new Date().toISOString()
                };

                // 添加到列表开头（最新的在前面）
                cards.unshift(newCard);

                // 保存回localStorage
                localStorage.setItem('character_cards', JSON.stringify(cards));
              } catch (e) {
                console.error('保存角色卡失败:', e);
              }

              // 刷新角色卡列表
              if (typeof loadRoles === 'function') {
                loadRoles();
              }
            } else {
              const maybePolicy = isContentPolicyViolation(`${logBufferAttempt || ''}\n${lastChunk || ''}`);
              const isSb = !!(job.storyboard && job.storyboard.label);
              const msg = maybePolicy
                ? isSb
                  ? '内容审查未通过（可修改分镜提示词后重试）'
                  : '内容审查未通过（请调整提示词后重试）'
                : '未返回媒体链接，可能被内容安全拦截或提示无效';
              updateTask(taskId, {
                status: 'error',
                errorKind: maybePolicy ? 'policy' : '',
                message: msg,
                logTail: lastChunk,
                logFull: logBufferAttempt || lastChunk,
                progress: 0
            });
          }
          }
          return; // success
        } catch (e) {
          clearTimers();
          const msg = e?.message || String(e);
          if (retryCtl.cancelled) {
            updateTask(taskId, { status: 'error', message: '已中断自动重试（可点击“重试”再次发起）' });
            return;
          }

          // 仅“提交上游失败/网络瞬断（未进入进度阶段）”自动重试；避免已提交后重复下单
          const retryableSubmit = isRetryable(msg) && !progressMarkerSeen && !watermarkWaitSeen && attempt <= MAX_RETRY;
          if (retryableSubmit) {
            const retryCount = attempt; // 第 1 次失败 -> 重试 1；第 2 次失败 -> 重试 2 ...
            const delay = Math.min(1500 * Math.pow(2, Math.min(retryCount - 1, 5)), 15000);
            const brief = String(msg || '未知错误').replace(/\s+/g, ' ').slice(0, 120);
            updateTask(taskId, {
              status: 'retrying',
              retryMode: 'submit',
              retryCount,
              timedOut: false,
              message: `上传失败，正在自动重试（${retryCount}）：${brief}`,
              progress: 0
            });
            logTask(taskId, `上传失败：${brief}；${delay}ms 后自动重试（${retryCount}）`);
            const ok = await sleepCancellable(delay, () => retryCtl.cancelled);
            if (!ok) {
              updateTask(taskId, { status: 'error', message: '已中断自动重试（可点击“重试”再次发起）' });
              return;
            }
            continue;
          }
          const timeout =
            /Failed to connect|timed out|Timeout|ETIMEDOUT|ENETUNREACH|ECONNABORTED|AbortError|aborted/i.test(msg);
          const message = timeout ? '请求等待超时，可能上游仍在处理，请稍后重试' : msg;
          log('错误: ' + message);
          updateTask(taskId, {
            status: 'error',
            timedOut: timeout,
            message,
            logTail: '',
            logFull: logBufferAttempt || msg,
            progress: 0
          });
          showToast(message, timeout ? 'warn' : 'error', {
            title: timeout ? '超时' : '请求失败',
            duration: 4200
          });
          return;
        }
      }
      } finally {
        retryCtl.abortFetch = null;
        taskRetryControls.delete(taskId);
      }
    };

    // 不做人为并发限制：当 poolSize 覆盖全部任务时，直接并发启动全部 job
    if (poolSize >= jobs.length) {
      await Promise.all(jobs.map((j) => runJob(j)));
      return;
    }

    const runners = Array.from({ length: poolSize }).map(async () => {
      while (cursor < jobs.length) {
        const idx = cursor++;
        await runJob(jobs[idx]);
      }
    });
    await Promise.all(runners);
  };

  const analyzePromptHints = () => {
    const txt = promptBox.value;
    const hints = [];
    const timeMatch = txt.match(/(\d+)\s?(s|sec|seconds|秒)/i);
    const timeVal = timeMatch ? parseInt(timeMatch[1], 10) : 0;
    if (timeVal > 0) hints.push(`时长 ${timeVal}s`);
    const resMatch = txt.match(/(\d{3,4})\s?[xX]\s?(\d{3,4})/);
    if (resMatch) hints.push(`分辨率 ${resMatch[1]}x${resMatch[2]}`);
    const fpsMatch = txt.match(/(\d+)\s?fps/i);
    if (fpsMatch) hints.push(`帧率 ${fpsMatch[1]}fps`);
    if (!hints.length) hints.push('提示：描述镜头、光线、主体、动作，越具体越好');
    $('promptHints').innerHTML = hints.map((h) => `<span class="chip">${h}</span>`).join('');
  };

  const getBaseUrl = () => $('baseUrl').value.trim().replace(/\/$/, '');

  const resetMainUpload = () => {
    if (fileInput) fileInput.value = '';
    setMainFiles([]);
    if (dropzone) dropzone.classList.remove('dragover');
    if (filePreviewBox) filePreviewBox.style.display = 'none';
    if (filePreviewMedia) filePreviewMedia.innerHTML = '';
    if (filePreviewName) filePreviewName.textContent = '未选择文件';
    if (filePreviewKind) filePreviewKind.textContent = '素材';
    if (filePreviewMeta) filePreviewMeta.textContent = '';
    renderChips(filePreviewHints, []);
    if (filePreviewList) {
      filePreviewList.style.display = 'none';
      filePreviewList.innerHTML = '';
    }
    if (btnUseRecommendedModel) btnUseRecommendedModel.style.display = 'none';
    if (btnClearFiles) btnClearFiles.style.display = 'none';
    setBannerText('');
    clearPreviewObjectUrl();
    syncMainUploadUI();
  };

  const resetMultiFiles = () => {
    multiPrompts = multiPrompts.map((p) => ({ ...p, fileDataUrl: null, fileName: '' }));
    renderMultiPrompts();
    clearStoryboardFiles();
    saveForm();
  };

  // 生成模式切换条：滑动高亮（减少 4 个选项“割裂感”）
  let modeBarSyncTimer = null;
  const syncBatchModeIndicator = () => {
    if (!batchModeBar) return;
    const checked = batchModeBar.querySelector('input[name="batchType"]:checked');
    if (!checked) return;
    const label = checked.nextElementSibling;
    if (!label || !label.getBoundingClientRect) return;

    // 用 offset* 更稳：不受滚动/缩放影响，且天然相对 offsetParent
    const x = label.offsetLeft || 0;
    const y = label.offsetTop || 0;
    const w = label.offsetWidth || 0;
    const h = label.offsetHeight || 0;
    if (!w || !h) return;

    batchModeBar.style.setProperty('--seg-x', `${x}px`);
    batchModeBar.style.setProperty('--seg-y', `${y}px`);
    batchModeBar.style.setProperty('--seg-w', `${w}px`);
    batchModeBar.style.setProperty('--seg-h', `${h}px`);
    batchModeBar.setAttribute('data-ready', '1');
  };
  const scheduleBatchModeIndicator = () => {
    if (!batchModeBar) return;
    if (modeBarSyncTimer) clearTimeout(modeBarSyncTimer);
    modeBarSyncTimer = setTimeout(() => {
      modeBarSyncTimer = null;
      requestAnimationFrame(syncBatchModeIndicator);
    }, 30);
  };

  const normalizeBatchType = (raw) => {
    const v = String(raw || '').trim();
    if (v === 'single' || v === 'same_prompt_files' || v === 'multi_prompt' || v === 'storyboard' || v === 'character') return v;
    return 'single';
  };
  const defaultBatchConcurrencyForType = (t) => (normalizeBatchType(t) === 'storyboard' ? 1 : 2);
  const rememberBatchConcurrencyForType = (t, val) => {
    const key = normalizeBatchType(t);
    const fallback = defaultBatchConcurrencyForType(key);
    const n = normalizeTimes(val, fallback);
    batchConcurrencyByType[key] = n;
    return n;
  };
  const getBatchConcurrencyForType = (t) => {
    const key = normalizeBatchType(t);
    const fallback = defaultBatchConcurrencyForType(key);
    if (batchConcurrencyByType && batchConcurrencyByType[key] !== undefined) {
      return normalizeTimes(batchConcurrencyByType[key], fallback);
    }
    return fallback;
  };

  const setBatchType = (val) => {
    // 先把“当前模式”的默认份数记住，再切换（避免污染其它模式默认值）
    const prevType = getBatchType();
    try {
      if (batchConcurrencyInput) rememberBatchConcurrencyForType(prevType, batchConcurrencyInput.value);
    } catch (_) {
      /* ignore */
    }
    batchModeBar.querySelectorAll('input[name="batchType"]').forEach((r) => {
      r.checked = r.value === val;
    });
    // 切换到新模式时，恢复该模式自己的默认份数：分镜默认=1，多提示默认=2，其它默认=2
    try {
      const next = getBatchConcurrencyForType(val);
      if (batchConcurrencyInput) batchConcurrencyInput.value = String(next);
      if (quickCountInput && document.activeElement !== quickCountInput) quickCountInput.value = String(next);
    } catch (_) {
      /* ignore */
    }
    toggleBatchTextarea();

    // 角色卡模式：隐藏提示词输入框
    const promptBlock = document.getElementById('promptBlock');
    if (promptBlock) {
      if (val === 'character') {
        promptBlock.style.display = 'none';
      } else {
        promptBlock.style.display = '';
      }
    }

    saveForm();
    scheduleBatchModeIndicator();
  };

  const getBatchType = () => {
    const checked = batchModeBar.querySelector('input[name="batchType"]:checked');
    return checked ? checked.value : 'single';
  };

  // ===== 单次 / 同提示批量：主上传区状态管理 =====
  const getMainFiles = () => Array.from((fileInput && fileInput.files ? fileInput.files : []) || []);

  const setMainFiles = (files) => {
    if (!fileInput) return;
    const list = Array.isArray(files) ? files.filter(Boolean) : [];
    try {
      const dt = new DataTransfer();
      list.forEach((f) => dt.items.add(f));
      applyingMainFiles = true;
      fileInput.files = dt.files;
    } catch (_) {
      // 某些环境不允许程序化设置 files；至少支持“清空”场景
      if (!list.length) fileInput.value = '';
    } finally {
      applyingMainFiles = false;
    }
  };

  const getGlobalRolesForBatchType = (bt) => {
    const t = bt || getBatchType();
    if (t === 'multi_prompt') return attachedRolesMulti;
    if (t === 'storyboard') return attachedRolesStoryboard;
    // 单次/同提示：主提示框下方的全局挂载
    return attachedRoles;
  };

  const buildRoleContextText = (roleList = null) => {
    const list = Array.isArray(roleList) ? roleList : getGlobalRolesForBatchType(getBatchType());
    if (!Array.isArray(list) || list.length === 0) return '';
    return list
      .map((r) => {
        const uname = r && (r.username || r.display) ? String(r.username || r.display) : '';
        return uname ? `@${uname}` : '';
      })
      .filter(Boolean)
      .join(' ');
  };

  const buildPromptForSend = (promptUserRaw) => {
    const roleContext = buildRoleContextText();
    const promptUser = String(promptUserRaw || '').trim();
    return [roleContext, promptUser].filter(Boolean).join('\n\n');
  };

  const ensureMainFilePickerMode = (t, opts = { quiet: false }) => {
    if (!fileInput) return;
    // 主上传区仅服务于「单次 / 同提示批量」；其它模式有自己的文件输入，不在这里做“裁剪/提示”
    if (t !== 'single' && t !== 'same_prompt_files') return;
    const wantMulti = t === 'same_prompt_files';
    try {
      fileInput.multiple = wantMulti;
    } catch (_) {
      /* ignore */
    }
    // 单次模式：强制只保留 1 个文件（避免“选了多个但只用第一个”的幽灵误解）
    const files = getMainFiles();
    if (!wantMulti && files.length > 1) {
      setMainFiles([files[0]]);
      if (!opts.quiet) {
        showToast('单次模式只会使用第 1 个文件，已自动保留第 1 个。需要多文件请切到“同提示批量”。', 'warn', {
          duration: 3600
        });
      }
    }
  };

  const syncDropzoneText = () => {
    if (!dropzone) return;
    const t = getBatchType();
    const files = getMainFiles();
    if (!files.length) {
      dropzone.textContent =
        t === 'single'
          ? '拖拽文件到这里，或点击选择（单次仅 1 个文件）'
          : '拖拽文件到这里，或点击选择（支持多文件）';
      return;
    }
    const first = files[0];
    if (files.length === 1) {
      dropzone.textContent = `已选择：${first.name}`;
      return;
    }
    dropzone.textContent = `已选择：${files.length} 个文件（第 1 个：${first.name}）`;
  };

  const renderMainFileList = () => {
    if (!filePreviewList) return;
    const t = getBatchType();
    const files = getMainFiles();

    if (btnClearFiles) btnClearFiles.style.display = files.length ? 'inline-flex' : 'none';

    // 仅在“同提示批量”下展示完整文件清单（单次会被强制为 1 个文件）
    if (t !== 'same_prompt_files' || !files.length) {
      filePreviewList.style.display = 'none';
      filePreviewList.innerHTML = '';
      return;
    }

    const kindShort = (f) => {
      const tp = String((f && f.type) || '');
      if (tp.startsWith('image')) return '图';
      if (tp.startsWith('video')) return '视频';
      return '文件';
    };

    filePreviewList.style.display = 'flex';
    filePreviewList.innerHTML = files
      .map(
        (f, idx) => `
        <span class="file-chip" title="${escapeAttr(f.name)}">
          <span class="kind">${kindShort(f)}</span>
          <span class="name">${escapeHtml(f.name)}</span>
          <button type="button" class="close" data-remove-main-file="${idx}" aria-label="移除该文件">×</button>
        </span>`
      )
      .join('');
  };

  const syncQuickModeBar = () => {
    if (!quickModeBar) return;
    const t = getBatchType();
    quickModeBar.querySelectorAll('[data-quick-mode]').forEach((btn) => {
      const val = btn.getAttribute('data-quick-mode');
      btn.classList.toggle('active', val === t);
    });
  };

  const syncSingleSamePlanUI = () => {
    const t = getBatchType();
    const files = getMainFiles();
    const apiKey = $('apiKey')?.value?.trim?.() || '';
    const promptUser = (promptBox?.value || '').trim();
    const promptForSend = buildPromptForSend(promptUser);

    const generationCountFallback = t === 'storyboard' ? 1 : 2;
    const perFileCount = t === 'single' ? 1 : normalizeTimes(batchConcurrencyInput?.value || String(generationCountFallback), generationCountFallback);

    // 快捷份数：仅同提示批量展示
    if (quickCountWrap) quickCountWrap.style.display = t === 'same_prompt_files' ? 'inline-flex' : 'none';
    if (quickCountInput && t === 'same_prompt_files' && document.activeElement !== quickCountInput) {
      quickCountInput.value = String(perFileCount);
    }

    // 预计任务数（仅单次/同提示批量展示；多提示/分镜有自己的编辑器逻辑）
    let planned = 0;
    let reason = '';
    if (t === 'single') {
      planned = promptForSend || files.length ? 1 : 0;
      if (!planned) reason = '请填写提示词或选择一个文件';
    } else if (t === 'same_prompt_files') {
      if (!promptForSend && !files.length) {
        planned = 0;
        reason = '需要提示词或至少 1 个文件';
      } else {
        planned = files.length ? files.length * perFileCount : perFileCount;
      }
    } else {
      // 其他模式：uploadCard 会被隐藏；这里保持最小副作用
      planned = 0;
    }

    // quickPlan：用 chip 输出“公式”，让用户一眼知道将发生什么
    if (quickPlan) {
      const chips = [];
      if (t === 'single') chips.push({ text: '单次', kind: 'info' });
      if (t === 'same_prompt_files') chips.push({ text: '同提示批量', kind: 'info' });
      if (files.length) chips.push({ text: `${files.length} 文件`, kind: 'info' });
      if (t === 'same_prompt_files') chips.push({ text: `每文件 ${perFileCount} 份`, kind: 'info' });

      if (!apiKey) {
        chips.push({ text: '未填写 API Key', kind: 'warn' });
      } else if (!planned) {
        chips.push({ text: reason || '未就绪', kind: 'warn' });
      } else {
        const kind = planned >= 30 ? 'warn' : 'ok';
        chips.push({ text: `预计 ${planned} 任务`, kind });
      }

      quickPlan.innerHTML = chips.map((c) => `<span class="chip ${c.kind}">${escapeHtml(c.text)}</span>`).join('');
    }

    // 主按钮：把“预计任务数”带到按钮文案里，减少误点
    if (btnSendPrimary) {
      const base = planned && t === 'same_prompt_files' ? `开始生成（${planned}）` : '开始生成';
      btnSendPrimary.textContent = base;
      const prevDisabled = !!btnSendPrimary.disabled;
      const nextDisabled = !apiKey || (t === 'single' || t === 'same_prompt_files' ? planned === 0 : false);
      btnSendPrimary.disabled = nextDisabled;
      btnSendPrimary.title = !apiKey ? '请先填写 API Key' : planned === 0 ? reason : '';
      if (prevDisabled && !nextDisabled) flashReadyButton(btnSendPrimary);
    }
  };

  // 多提示 / 分镜：把“将创建多少任务”显式体现在按钮上，避免用户以为会生成 12 条但实际只跑了 1 条
  const syncBatchEditorPlanUI = () => {
    if (!btnSend) return;
    const t = getBatchType();
    if (t !== 'multi_prompt' && t !== 'storyboard') {
      btnSend.textContent = '开始生成';
      btnSend.disabled = false;
      btnSend.title = '';
      return;
    }
    const apiKey = $('apiKey')?.value?.trim?.() || '';
    let planned = 0;
    if (t === 'multi_prompt') {
      const defaultCount = normalizeTimes(batchConcurrencyInput?.value || '2', 2);
      const rows = (Array.isArray(multiPrompts) ? multiPrompts : [])
        .map((p) => ({
          text: (p?.text || '').trim(),
          count: normalizeTimes(p?.count, defaultCount),
          fileDataUrl: p?.fileDataUrl || null
        }))
        .filter((p) => p.text || p.fileDataUrl);
      planned = rows.reduce((sum, p) => sum + normalizeTimes(p.count, defaultCount), 0);
    } else if (t === 'storyboard') {
      const rows = (Array.isArray(storyboardShots) ? storyboardShots : [])
        .map((s) => ({
          text: (s?.text || '').trim(),
          count: normalizeTimes(s?.count, 1),
          fileDataUrl: s?.fileDataUrl || null
        }))
        .filter((s) => s.text || s.fileDataUrl);
      planned = rows.reduce((sum, s) => sum + normalizeTimes(s.count, 1), 0);
    }
    btnSend.textContent = planned ? `开始生成（${planned}）` : '开始生成';
    const prevDisabled = !!btnSend.disabled;
    const nextDisabled = !apiKey || planned === 0;
    btnSend.disabled = nextDisabled;
    btnSend.title = !apiKey ? '请先填写 API Key' : planned === 0 ? '请至少填写一条提示（或选择文件）' : `将创建 ${planned} 条任务`;
    if (prevDisabled && !nextDisabled) flashReadyButton(btnSend);
  };
  let batchPlanSyncQueued = false;
  const scheduleBatchEditorPlanUI = () => {
    if (batchPlanSyncQueued) return;
    batchPlanSyncQueued = true;
    requestAnimationFrame(() => {
      batchPlanSyncQueued = false;
      try {
        syncBatchEditorPlanUI();
      } catch (_) {
        /* ignore */
      }
    });
  };
  const readyBtnTimer = new WeakMap();
  const flashReadyButton = (btn) => {
    if (!btn) return;
    try {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      const now = Date.now();
      const last = parseInt(btn.getAttribute('data-ready-ts') || '0', 10) || 0;
      // 轻防抖：避免短时间重复闪烁
      if (last && now - last < 700) return;
      btn.setAttribute('data-ready-ts', String(now));

      btn.classList.remove('btn-ready');
      // 强制 reflow，确保动画可重播
      void btn.offsetWidth;
      btn.classList.add('btn-ready');

      const prev = readyBtnTimer.get(btn);
      if (prev) clearTimeout(prev);
        readyBtnTimer.set(
          btn,
          setTimeout(() => {
            try {
              btn.classList.remove('btn-ready');
            } catch (_) {}
          }, 2950)
        );
      } catch (_) {
        /* ignore */
      }
    };

  const syncMainUploadUI = (opts = { quiet: true }) => {
    ensureMainFilePickerMode(getBatchType(), { quiet: !!(opts && opts.quiet) });
    syncDropzoneText();
    renderMainFileList();
    syncQuickModeBar();
    syncSingleSamePlanUI();
  };

  // 只刷新“多提示每行下方的角色 chips”，不重建 textarea（避免用户编辑时丢光标）
  const renderMultiPromptRoleChipsOnly = () => {
    if (!multiPromptList) return;
    const globals = Array.isArray(attachedRolesMulti) ? attachedRolesMulti : [];
    const globalUserSet = new Set(globals.map((r) => String(r?.username || '').trim()).filter(Boolean));

    multiPromptList.querySelectorAll('[data-row-roles]').forEach((container) => {
      const idx = parseInt(container.getAttribute('data-row-roles'), 10);
      const globalHtml = globals
        .map((r) => {
          const name = String(r?.display || r?.username || '').trim();
          if (!name) return '';
          return `<span class="chip info" title="全局角色（多提示模式）：会应用到每一行">@${escapeHtml(name)}</span>`;
        })
        .join('');
      const roles = multiPromptRoles[idx] || [];
      const localHtml =
        roles
          .map((r, i) => {
            const uname = String(r?.username || '').trim();
            if (uname && globalUserSet.has(uname)) return '';
            return `<span class="chip" data-row-role="${idx}:${i}" style="display:inline-flex;align-items:center;gap:6px;">
              ${r.avatar ? `<img src="${r.avatar}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;">` : ''}
              @${escapeHtml(r.display || r.username || '角色')}
              <button class="chip-close" type="button" aria-label="移除角色" title="移除" style="border:none;background:transparent;cursor:pointer;">×</button>
            </span>`;
          })
          .join('');
      container.innerHTML = (globalHtml + localHtml) || '';
    });

    multiPromptList.querySelectorAll('[data-row-role]').forEach((chip) => {
      chip.querySelector('.chip-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const [idx, ridx] = chip.getAttribute('data-row-role').split(':').map((x) => parseInt(x, 10));
        if (!isNaN(idx) && !isNaN(ridx) && multiPromptRoles[idx]) {
          multiPromptRoles[idx].splice(ridx, 1);
          renderMultiPromptRoleChipsOnly();
          saveForm();
          renderRoles();
        }
      });
    });
  };

  const renderMultiPrompts = () => {
    if (!multiPromptList) return;
    const fallbackCount = normalizeTimes(batchConcurrencyInput?.value || '2', 2);
    multiPromptList.innerHTML =
      multiPrompts
        .map((raw, idx) => {
          const p = {
            text: raw.text || '',
            count: normalizeTimes(raw.count, fallbackCount),
            fileDataUrl: raw.fileDataUrl || null,
            fileName: raw.fileName || ''
          };
          multiPrompts[idx] = p;
          return `
      <div class="multi-row" data-idx="${idx}">
        <div class="multi-row-top">
          <span class="sb-index-pill">提示 ${idx + 1}</span>
          <span class="muted">份数</span>
          <input class="input multi-prompt-count" data-idx="${idx}" type="number" min="1" max="9999" step="1" value="${p.count}" title="该提示生成份数">
           <label class="pill-btn multi-file-label">
             选择文件
             <input type="file" class="multi-prompt-file" data-idx="${idx}">
           </label>
           <span class="multi-file-name" data-file-label="${idx}">
             ${p.fileName ? escapeHtml(p.fileName) : '未选择'}
           </span>
           <button type="button" class="pill-btn multi-file-clear" data-idx="${idx}" ${p.fileName ? '' : 'disabled'} title="清除该提示的参考文件">清文件</button>
           <button type="button" class="pill-btn multi-remove multi-prompt-remove" data-idx="${idx}">删除</button>
         </div>
         <textarea class="input multi-prompt-input multi-prompt-textarea" data-idx="${idx}" placeholder="提示词 ${idx + 1}（可多行，建议描述镜头/主体/动作/风格）">${escapeHtml(
           p.text ?? ''
         )}</textarea>
        <div class="multi-row-roles" data-row-roles="${idx}"></div>
      </div>`;
        })
        .join('') || '<div class="muted">暂无提示，点击“新增提示”添加</div>';

    multiPromptList.querySelectorAll('.multi-prompt-input').forEach((inp) =>
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (multiPrompts[idx]) {
          multiPrompts[idx].text = e.target.value;
          saveForm();
          scheduleBatchEditorPlanUI();
        }
      })
    );
    // 支持把角色卡拖拽到多提示输入框，挂载到该行
    multiPromptList.querySelectorAll('.multi-prompt-input').forEach((inp) => {
      inp.addEventListener('dragover', (e) => e.preventDefault());
      inp.addEventListener('drop', (e) => {
        e.preventDefault();
        const text = e.dataTransfer.getData('text/plain');
        if (!text) return;
        try {
          const obj = JSON.parse(text);
          if (obj.display || obj.username) {
            const idx = parseInt(inp.getAttribute('data-idx'), 10);
            addRoleToRow(idx, {
              display: obj.display || obj.display_name || obj.username || '',
              username: obj.username || '',
              avatar: obj.avatar || obj.avatar_path || ''
            });
            showToast('已挂载到该提示');
            return;
          }
        } catch (_) {
          /* ignore */
        }
      });
    });
    multiPromptList.querySelectorAll('.multi-prompt-count').forEach((sel) =>
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (multiPrompts[idx]) {
          const fallback = normalizeTimes(multiPrompts[idx].count ?? batchConcurrencyInput?.value ?? 2, 2);
          const val = normalizeTimes(e.target.value, fallback);
          multiPrompts[idx].count = val;
          e.target.value = String(val);
          saveForm();
          syncGlobalCountHighlight();
          scheduleBatchEditorPlanUI();
        }
      })
    );
    multiPromptList.querySelectorAll('.multi-prompt-remove').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        multiPrompts.splice(idx, 1);
        // 删除后需要重排行角色索引，否则会“角色挂到别行”
        const nextMap = {};
        Object.keys(multiPromptRoles || {}).forEach((k) => {
          const i = parseInt(k, 10);
          if (isNaN(i)) return;
          if (i < idx) nextMap[i] = multiPromptRoles[i];
          else if (i > idx) nextMap[i - 1] = multiPromptRoles[i];
        });
        Object.keys(multiPromptRoles || {}).forEach((k) => delete multiPromptRoles[k]);
        Object.keys(nextMap).forEach((k) => (multiPromptRoles[k] = nextMap[k]));
        renderMultiPrompts();
        saveForm();
      })
    );
    multiPromptList.querySelectorAll('.multi-prompt-file').forEach((inp) =>
      inp.addEventListener('change', async (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const file = e.target.files?.[0];
        if (!file || !multiPrompts[idx]) return;
        const inputEl = e.target;
        try {
          const dataUrl = await fileToDataUrl(file);
          multiPrompts[idx].fileDataUrl = dataUrl;
          multiPrompts[idx].fileName = file.name;
          // 允许再次选择同一个文件也触发 change
          try {
            inputEl.value = '';
          } catch (_) {
            /* ignore */
          }
          renderMultiPrompts(); // 同步“清文件”按钮状态
          saveForm();
        } catch (err) {
          showToast('读取文件失败');
        }
      })
    );
    multiPromptList.querySelectorAll('.multi-file-clear').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (isNaN(idx) || !multiPrompts[idx]) return;
        multiPrompts[idx].fileDataUrl = null;
        multiPrompts[idx].fileName = '';
        renderMultiPrompts();
        saveForm();
        showToast('已清除该提示的文件', 'success');
      })
    );

    // 渲染每行挂载的角色 chips（全局 + 单行）
    renderMultiPromptRoleChipsOnly();

    syncBatchEditorPlanUI();
  };

  const addMultiPrompt = (text = '', count = 2) => {
    const fallback = normalizeTimes(batchConcurrencyInput?.value || '2', 2);
    multiPrompts.push({ text, count: normalizeTimes(count, fallback), fileDataUrl: null, fileName: '' });
    renderMultiPrompts();
    saveForm();
  };

  // =========================
  // 分镜（Storyboard）模式
  // =========================
  const clampInt = (val, { min = 1, max = 99, fallback = 1 } = {}) => {
    const n = parseInt(val, 10);
    if (isNaN(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  };

  // 生成份数/重复次数：不做人为档位限制，仅做最小值保护；上限设为很大避免误输入炸掉页面。
  const normalizeTimes = (val, fallback = 1) => clampInt(val, { min: 1, max: 9999, fallback });

  // 分镜：非阻塞“撤销”机制（替代 confirm 弹窗）
  // 只保留 1 步撤销：够用且不复杂，避免堆栈带来的内存与一致性问题
  let storyboardUndo = null; // { shots, shotCountValue, shotCountDirty, batchType, ts, reason }
  const cloneStoryboardRoles = (rolesArr) =>
    Array.isArray(rolesArr)
      ? rolesArr
          .map((r) => ({
            display: r?.display || r?.display_name || r?.username || '',
            username: r?.username || '',
            avatar: r?.avatar || r?.avatar_path || ''
          }))
          .filter((r) => r.display || r.username || r.avatar)
      : [];
  const cloneStoryboardShots = (arr) =>
    (Array.isArray(arr) ? arr : []).map((s) => ({
      text: typeof s?.text === 'string' ? s.text : '',
      count: normalizeTimes(s?.count ?? 1, 1),
      fileDataUrl: s?.fileDataUrl || null,
      fileName: s?.fileName || '',
      roles: cloneStoryboardRoles(s?.roles),
      useGlobalRoles: s && s.useGlobalRoles === false ? false : true
    }));
  const captureStoryboardUndo = (reason = '') => {
    storyboardUndo = {
      shots: cloneStoryboardShots(storyboardShots),
      shotCountValue: storyboardShotCount ? String(storyboardShotCount.value || '') : '',
      shotCountDirty: storyboardShotCount ? storyboardShotCount.getAttribute('data-dirty') || '' : '',
      batchType: getBatchType(),
      ts: Date.now(),
      reason: String(reason || '')
    };
  };
  const undoStoryboardOnce = () => {
    if (!storyboardUndo) {
      showToast('没有可撤销的分镜操作', 'warn', { title: '撤销' });
      return;
    }
    const snap = storyboardUndo;
    storyboardUndo = null;

    try {
      if (snap.batchType && snap.batchType !== getBatchType()) {
        setBatchType(snap.batchType);
      }
    } catch (_) {
      /* ignore */
    }

    storyboardShots = cloneStoryboardShots(snap.shots);
    if (storyboardShotCount) {
      if (snap.shotCountValue) storyboardShotCount.value = snap.shotCountValue;
      if (snap.shotCountDirty) storyboardShotCount.setAttribute('data-dirty', snap.shotCountDirty);
      else storyboardShotCount.removeAttribute('data-dirty');
    }
    renderStoryboardShots();
    syncStoryboardCountSelect();
    saveForm();
    showToast('已撤销上一步分镜操作', 'success', { title: '已撤销', duration: 2400 });
  };

  const getStoryboardShotLabel = (_runNo, idx1, total = null) =>
    total ? `分镜${idx1}/${total}` : `分镜${idx1}`;

  const syncStoryboardCountSelect = () => {
    if (!storyboardShotCount) return;
    if (document.activeElement === storyboardShotCount) return; // 不与用户输入抢焦点
    if (storyboardShotCount.getAttribute('data-dirty') === '1') return; // 用户还没点“应用”
    const n = storyboardShots.length || 0;
    if (n > 0) storyboardShotCount.value = String(n);
  };

  const setStoryboardShotUseGlobalRoles = (idx, useGlobal) => {
    if (idx === null || idx === undefined) return;
    const i = parseInt(String(idx), 10);
    if (isNaN(i) || i < 0 || !storyboardShots[i]) return;
    const cur = storyboardShots[i];
    storyboardShots[i] = { ...cur, useGlobalRoles: !!useGlobal };
  };

  const syncStoryboardScopeButton = () => {
    if (!btnStoryboardScopeRoles) return;
    const total = storyboardShots.length || 0;
    const excluded = storyboardShots.filter((s) => s && s.useGlobalRoles === false).length;
    btnStoryboardScopeRoles.disabled = total === 0;
    btnStoryboardScopeRoles.textContent = excluded > 0 ? `排除分镜 · ${excluded}` : '排除分镜';
    btnStoryboardScopeRoles.title =
      total === 0
        ? '暂无分镜：请先设置镜头数并“应用”'
        : excluded > 0
          ? `已排除 ${excluded}/${total} 镜（这些分镜不再受全局自动挂载控制）`
          : '将“全局角色”从某些分镜中排除（这些分镜后续不再受全局自动挂载控制）';
  };

  // 只刷新“分镜行下方的角色 chips”，不重建 textarea（避免用户编辑时丢光标）
  const renderStoryboardRoleChipsOnly = () => {
    if (!storyboardList) return;

    const globals = Array.isArray(attachedRolesStoryboard) ? attachedRolesStoryboard : [];
    const globalUserSetAll = new Set(globals.map((r) => String(r?.username || '').trim()).filter(Boolean));

    storyboardList.querySelectorAll('[data-sb-roles]').forEach((container) => {
      const idx = parseInt(container.getAttribute('data-sb-roles'), 10);
      if (isNaN(idx) || !storyboardShots[idx]) return;

      const shot = storyboardShots[idx] || {};
      const useGlobal = shot.useGlobalRoles !== false;
      const globalUserSet = useGlobal ? globalUserSetAll : new Set(); // 取消全局后：不要隐藏“与全局重复”的本地角色

      // 全局角色 chips：默认每镜都显示；若该镜被手动排除，则提供“恢复全局”
      let globalHtml = '';
      if (globals.length) {
        if (!useGlobal) {
          globalHtml = `
            <span class="chip warn" title="该分镜已手动排除：不再自动挂载全局角色">已取消全局角色</span>
            <button type="button" class="chip info" data-sb-global-on="${idx}" title="恢复该分镜使用全局角色" style="cursor:pointer;">恢复全局</button>
          `;
        } else {
          const chips = globals
            .map((r) => {
              const name = String(r?.display || r?.username || '').trim();
              if (!name) return '';
              return `<span class="chip info" title="全局角色（分镜模式）：会自动应用到每一镜">@${escapeHtml(name)}</span>`;
            })
            .join('');
          // “一键把该分镜从全局自动挂载里排除”
          const offBtn = `<button type="button" class="chip warn" data-sb-global-off="${idx}" title="取消该分镜使用全局角色（后续不再受全局自动挂载控制）" style="cursor:pointer;">× 取消全局</button>`;
          globalHtml = chips + offBtn;
        }
      }

      const roles =
        (storyboardShots[idx] && Array.isArray(storyboardShots[idx].roles) ? storyboardShots[idx].roles : []) || [];
      const localHtml =
        roles
          .map((r, i) => {
            const uname = String(r?.username || '').trim();
            if (uname && globalUserSet.has(uname)) return '';
            return `<span class="chip" data-sb-role="${idx}:${i}" style="display:inline-flex;align-items:center;gap:6px;">
              ${r.avatar ? `<img src="${r.avatar}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;">` : ''}
              @${escapeHtml(r.display || r.username || '角色')}
              <button class="chip-close" type="button" aria-label="移除角色" title="移除" style="border:none;background:transparent;cursor:pointer;">×</button>
            </span>`;
          })
          .join('');

      container.innerHTML = (globalHtml + localHtml) || '';
    });

    storyboardList.querySelectorAll('[data-sb-role]').forEach((chip) => {
      chip.querySelector('.chip-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const [idx, ridx] = chip
          .getAttribute('data-sb-role')
          .split(':')
          .map((x) => parseInt(x, 10));
        if (!isNaN(idx) && !isNaN(ridx) && storyboardShots[idx] && Array.isArray(storyboardShots[idx].roles)) {
          storyboardShots[idx].roles.splice(ridx, 1);
          renderStoryboardRoleChipsOnly();
          saveForm();
          renderRoles();
        }
      });
    });

    storyboardList.querySelectorAll('[data-sb-global-off]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-sb-global-off'), 10);
        if (isNaN(idx) || !storyboardShots[idx]) return;
        setStoryboardShotUseGlobalRoles(idx, false);
        renderStoryboardRoleChipsOnly();
        saveForm();
        showToast(`已将 分镜 ${idx + 1} 从全局角色中排除`, 'success', { duration: 2200 });
      });
    });

    storyboardList.querySelectorAll('[data-sb-global-on]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-sb-global-on'), 10);
        if (isNaN(idx) || !storyboardShots[idx]) return;
        setStoryboardShotUseGlobalRoles(idx, true);
        renderStoryboardRoleChipsOnly();
        saveForm();
        showToast(`已恢复 分镜 ${idx + 1} 使用全局角色`, 'success', { duration: 2200 });
      });
    });

    syncStoryboardScopeButton();
    // 兜底：角色切换/排除范围等操作会触发该函数，但可能没触发到“按钮状态计算”
    // 这里统一补一次，避免出现“分镜写了内容但提交按钮灰了”的交互断裂。
    scheduleBatchEditorPlanUI();
  };

  const showStoryboardGlobalScopeMenu = (anchorEl) => {
    if (!anchorEl) return;
    const total = storyboardShots.length || 0;
    if (!total) {
      showToast('暂无分镜：请先设置镜头数并“应用”', 'warn');
      return;
    }

    const rect = anchorEl.getBoundingClientRect ? anchorEl.getBoundingClientRect() : { left: 20, bottom: 20 };
    const menu = document.createElement('div');
    menu.className = 'role-target-menu';
    menu.style.position = 'fixed';
    menu.style.zIndex = 9999;
    menu.style.background = '#0f172a';
    menu.style.color = '#fff';
    menu.style.border = '1px solid #1e293b';
    menu.style.borderRadius = '12px';
    menu.style.padding = '10px';
    menu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
    menu.style.minWidth = '240px';
    menu.style.left = `${Math.max(10, rect.left)}px`;
    menu.style.top = `${Math.min(window.innerHeight - 20, rect.bottom + 8)}px`;

    const title = document.createElement('div');
    title.textContent = '全局角色 · 作用范围';
    title.style.fontWeight = '900';
    title.style.padding = '2px 6px 8px';
    menu.appendChild(title);

    const tip = document.createElement('div');
    tip.textContent = '被排除的分镜：不再自动挂载全局角色（后续全局变更也不会影响它）。';
    tip.style.fontSize = '12px';
    tip.style.opacity = '0.85';
    tip.style.padding = '0 6px 10px';
    menu.appendChild(tip);

    const makeBtn = (label, handler, opts = {}) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.width = '100%';
      b.style.textAlign = 'left';
      b.style.background = 'transparent';
      b.style.color = '#fff';
      b.style.border = 'none';
      b.style.padding = '7px 8px';
      b.style.cursor = 'pointer';
      b.style.borderRadius = '10px';
      if (opts.dim) b.style.opacity = '0.8';
      b.onmouseenter = () => (b.style.background = 'rgba(255,255,255,0.08)');
      b.onmouseleave = () => (b.style.background = 'transparent');
      b.onclick = () => handler && handler();
      return b;
    };

    const bar = document.createElement('div');
    bar.style.display = 'flex';
    bar.style.gap = '6px';
    bar.style.padding = '0 6px 8px';
    const mkMini = (label, handler) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.className = 'pill-btn';
      b.style.padding = '6px 10px';
      b.style.borderRadius = '10px';
      b.style.background = 'rgba(255,255,255,0.10)';
      b.style.borderColor = 'rgba(148,163,184,0.35)';
      b.style.color = '#fff';
      b.onclick = handler;
      return b;
    };
    bar.appendChild(
      mkMini('全部使用', () => {
        storyboardShots = storyboardShots.map((s) => ({ ...s, useGlobalRoles: true }));
        renderStoryboardRoleChipsOnly();
        saveForm();
      })
    );
    bar.appendChild(
      mkMini('全部排除', () => {
        storyboardShots = storyboardShots.map((s) => ({ ...s, useGlobalRoles: false }));
        renderStoryboardRoleChipsOnly();
        saveForm();
      })
    );
    menu.appendChild(bar);

    const listWrap = document.createElement('div');
    listWrap.style.maxHeight = '320px';
    listWrap.style.overflow = 'auto';
    listWrap.style.padding = '0 2px';

    const renderList = () => {
      listWrap.innerHTML = '';
      storyboardShots.forEach((s, idx) => {
        const on = s && s.useGlobalRoles !== false;
        const label = on ? `✓ 分镜 ${idx + 1}：使用全局角色` : `分镜 ${idx + 1}：已排除（不自动挂载）`;
        listWrap.appendChild(
          makeBtn(label, () => {
            setStoryboardShotUseGlobalRoles(idx, !on);
            renderStoryboardRoleChipsOnly();
            saveForm();
            renderList(); // 保持菜单打开，允许连续点多个
          })
        );
      });
    };
    renderList();
    menu.appendChild(listWrap);

    const foot = document.createElement('div');
    foot.style.padding = '10px 6px 2px';
    foot.appendChild(
      makeBtn('关闭', () => {
        try {
          document.body.removeChild(menu);
        } catch (_) {}
      }, { dim: true })
    );
    menu.appendChild(foot);

    document.body.appendChild(menu);

    // Clamp into viewport (avoid spilling out on the right/bottom).
    try {
      const box = menu.getBoundingClientRect();
      let left = box.left;
      let top = box.top;
      if (box.right > window.innerWidth - 10) left = Math.max(10, window.innerWidth - box.width - 10);
      if (box.bottom > window.innerHeight - 10) top = Math.max(10, window.innerHeight - box.height - 10);
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    } catch (_) {
      /* ignore */
    }

    const dismiss = (e) => {
      if (!menu.contains(e.target) && e.target !== anchorEl) {
        try {
          document.body.removeChild(menu);
        } catch (_) {}
        document.removeEventListener('mousedown', dismiss);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', dismiss), 0);
  };

  const renderStoryboardShots = () => {
    if (!storyboardList) return;

    storyboardList.innerHTML =
      storyboardShots
        .map((raw, idx) => {
          const s = {
            text: raw.text || '',
            count: normalizeTimes(raw.count, normalizeTimes(batchConcurrencyInput?.value || '1', 1)),
            fileDataUrl: raw.fileDataUrl || null,
            fileName: raw.fileName || '',
            roles: Array.isArray(raw.roles) ? raw.roles : [],
            // 缺省为 true；兼容导入模板字段 use_global_roles
            useGlobalRoles: raw.useGlobalRoles === false || raw.use_global_roles === false ? false : true
          };
          storyboardShots[idx] = s;

          return `
        <div class="multi-row sb-row" data-sb-idx="${idx}">
          <div class="multi-row-top">
            <span class="sb-index-pill">分镜 ${idx + 1}</span>
            <input class="input sb-shot-count" data-idx="${idx}" type="number" min="1" max="9999" step="1" value="${s.count}" title="该分镜生成份数（多生成几份方便挑）" style="width:78px;">
            <label class="pill-btn multi-file-label" title="可选：给该分镜附带一个参考文件（图片/视频）">
              选择文件
              <input type="file" class="sb-shot-file" data-idx="${idx}">
            </label>
            <span class="multi-file-name" data-sb-file-label="${idx}">
              ${s.fileName ? escapeHtml(s.fileName) : '未选择'}
            </span>
            <button type="button" class="pill-btn sb-file-clear" data-idx="${idx}" ${s.fileName ? '' : 'disabled'} title="清除该分镜的参考文件">清文件</button>
            <button type="button" class="pill-btn sb-move-up" data-idx="${idx}" title="上移">↑</button>
            <button type="button" class="pill-btn sb-move-down" data-idx="${idx}" title="下移">↓</button>
            <button type="button" class="pill-btn sb-copy-prev" data-idx="${idx}" title="把上一镜内容复制到这一镜（便于连续修改）">复制上一镜</button>
            <button type="button" class="pill-btn multi-remove sb-remove" data-idx="${idx}">删除</button>
          </div>
          <textarea class="input sb-prompt-textarea" data-idx="${idx}" placeholder="分镜 ${idx + 1}：写镜头/动作/台词/镜头语言...">${escapeHtml(
            s.text
          )}</textarea>
          <div class="multi-row-roles" data-sb-roles="${idx}"></div>
        </div>
        `;
        })
        .join('') || '<div class="muted">暂无分镜。可先选择“镜头数”并点击“应用”，或点击“新增分镜”。</div>';

    // 输入：文本
    storyboardList.querySelectorAll('.sb-prompt-textarea').forEach((ta) => {
      ta.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (!isNaN(idx) && storyboardShots[idx]) {
          storyboardShots[idx].text = e.target.value;
          saveForm();
          scheduleBatchEditorPlanUI();
        }
      });
      // 支持把角色卡拖拽到分镜文本框：给该镜追加角色
      ta.addEventListener('dragover', (e) => e.preventDefault());
      ta.addEventListener('drop', (e) => {
        e.preventDefault();
        const text = e.dataTransfer.getData('text/plain');
        if (!text) return;
        try {
          const obj = JSON.parse(text);
          if (obj.display || obj.username) {
            const idx = parseInt(ta.getAttribute('data-idx'), 10);
            addRoleToStoryboardShot(idx, {
              display: obj.display || obj.display_name || obj.username || '',
              username: obj.username || '',
              avatar: obj.avatar || obj.avatar_path || ''
            });
            showToast('已挂载到该分镜');
            return;
          }
        } catch (_) {
          /* ignore */
        }
      });
    });

    // 输入：份数
    storyboardList.querySelectorAll('.sb-shot-count').forEach((sel) =>
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const fallback = normalizeTimes(storyboardShots[idx]?.count ?? batchConcurrencyInput?.value ?? 1, 1);
        const val = normalizeTimes(e.target.value, fallback);
        if (!isNaN(idx) && storyboardShots[idx]) {
          storyboardShots[idx].count = val;
          e.target.value = String(val);
          saveForm();
          syncGlobalCountHighlight();
          scheduleBatchEditorPlanUI();
        }
      })
    );

    // 文件：每镜可选
    storyboardList.querySelectorAll('.sb-shot-file').forEach((inp) =>
      inp.addEventListener('change', async (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const file = e.target.files?.[0];
        if (!file || !storyboardShots[idx]) return;
        const inputEl = e.target;
        try {
          const dataUrl = await fileToDataUrl(file);
          storyboardShots[idx].fileDataUrl = dataUrl;
          storyboardShots[idx].fileName = file.name;
          // 允许再次选择同一个文件也触发 change
          try {
            inputEl.value = '';
          } catch (_) {
            /* ignore */
          }
          renderStoryboardShots(); // 同步“清文件”按钮状态
          saveForm();
        } catch (_) {
          showToast('读取文件失败', 'error');
        }
      })
    );
    storyboardList.querySelectorAll('.sb-file-clear').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (isNaN(idx) || !storyboardShots[idx]) return;
        storyboardShots[idx].fileDataUrl = null;
        storyboardShots[idx].fileName = '';
        renderStoryboardShots();
        saveForm();
        showToast('已清除该分镜的文件', 'success');
      })
    );

    // 删除/移动/复制
    storyboardList.querySelectorAll('.sb-remove').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (isNaN(idx)) return;
        storyboardShots.splice(idx, 1);
        renderStoryboardShots();
        syncStoryboardCountSelect();
        saveForm();
      })
    );
    storyboardList.querySelectorAll('.sb-move-up').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (isNaN(idx) || idx <= 0) return;
        const tmp = storyboardShots[idx - 1];
        storyboardShots[idx - 1] = storyboardShots[idx];
        storyboardShots[idx] = tmp;
        renderStoryboardShots();
        saveForm();
      })
    );
    storyboardList.querySelectorAll('.sb-move-down').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (isNaN(idx) || idx >= storyboardShots.length - 1) return;
        const tmp = storyboardShots[idx + 1];
        storyboardShots[idx + 1] = storyboardShots[idx];
        storyboardShots[idx] = tmp;
        renderStoryboardShots();
        saveForm();
      })
    );
    storyboardList.querySelectorAll('.sb-copy-prev').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (isNaN(idx) || idx <= 0 || !storyboardShots[idx] || !storyboardShots[idx - 1]) return;
        const prev = storyboardShots[idx - 1];
        const cur = storyboardShots[idx];
        if ((cur.text || '').trim() && !(prev.text || '').trim()) {
          showToast('上一镜为空，无法复制', 'warn');
          return;
        }
        const curHasAny =
          !!(cur.text || '').trim() || (Array.isArray(cur.roles) && cur.roles.length) || !!cur.fileDataUrl;
        captureStoryboardUndo(curHasAny ? '上一镜覆盖' : '上一镜复制');
        storyboardShots[idx] = {
          ...cur,
          text: prev.text || '',
          roles: Array.isArray(prev.roles) ? [...prev.roles] : []
        };
        renderStoryboardShots();
        saveForm();
        showToast(curHasAny ? '已用“上一镜”覆盖当前分镜（可撤销）' : '已复制上一镜内容（可撤销）', 'success', {
          title: '分镜已更新',
          duration: 5200,
          action: { text: '撤销', onClick: () => undoStoryboardOnce() }
        });
      })
    );

    // 渲染每镜挂载角色 chips（全局角色+单镜角色；支持“分镜级排除全局角色”）
    renderStoryboardRoleChipsOnly();

    syncStoryboardCountSelect();
    syncBatchEditorPlanUI();
  };

  const appendStoryboardShots = (howMany, opts = { text: '', count: null }) => {
    const n = Math.max(0, parseInt(String(howMany ?? 0), 10) || 0);
    if (!n) return;
    const fallbackCount = normalizeTimes(batchConcurrencyInput?.value ?? 1, 1);
    const c = normalizeTimes(opts && opts.count !== null && opts.count !== undefined ? opts.count : fallbackCount, 1);
    const text = opts && typeof opts.text === 'string' ? opts.text : '';
    for (let i = 0; i < n; i++) {
      storyboardShots.push({
        text: text || '',
        count: c,
        fileDataUrl: null,
        fileName: '',
        roles: [],
        useGlobalRoles: true
      });
    }
    renderStoryboardShots();
    syncStoryboardCountSelect();
    saveForm();
  };

  const addStoryboardShot = (text = '', count = null) => {
    appendStoryboardShots(1, { text, count });
  };

  const setStoryboardShotCount = (nextCount, opts = { confirmShrink: true }) => {
    const n = Math.max(1, parseInt(nextCount, 10) || 1);
    const cur = storyboardShots.length;
    if (n === cur) return;
    const willDelete = n < cur;
    if (willDelete && opts.confirmShrink) {
      captureStoryboardUndo(`镜头数 ${cur}→${n}`);
    }
    if (storyboardShotCount) storyboardShotCount.removeAttribute('data-dirty');
    if (n > cur) {
      appendStoryboardShots(n - cur, { text: '', count: normalizeTimes(batchConcurrencyInput?.value ?? 1, 1) });
      return;
    }
    storyboardShots = storyboardShots.slice(0, n);
    renderStoryboardShots();
    syncStoryboardCountSelect();
    if (storyboardShotCount) storyboardShotCount.removeAttribute('data-dirty');
    saveForm();
    if (willDelete && opts.confirmShrink) {
      showToast(`镜头数已从 ${cur} 调整为 ${n}（已移除后面 ${cur - n} 镜，可撤销）`, 'warn', {
        title: '镜头数已调整',
        duration: 5200,
        action: { text: '撤销', onClick: () => undoStoryboardOnce() }
      });
    }
  };

  const clearStoryboardFiles = () => {
    storyboardShots = storyboardShots.map((s) => ({ ...s, fileDataUrl: null, fileName: '' }));
    renderStoryboardShots();
    saveForm();
  };

  // 高级设置折叠：保证“多提示/分镜”时编辑器一定可见
  const setAdvancedOpen = (nextOpen, opts = { scroll: false }) => {
    advancedOpen = !!nextOpen;
    try {
      localStorage.setItem(ADV_OPEN_KEY, advancedOpen ? '1' : '0');
    } catch (_) {
      /* ignore */
    }
    if (advancedBox) advancedBox.style.display = advancedOpen ? 'block' : 'none';
    if (btnToggleAdvanced) btnToggleAdvanced.textContent = advancedOpen ? '收起高级设置' : '展开高级设置';
    if (opts && opts.scroll && advancedBox && advancedOpen) {
      try {
        advancedBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (_) {
        /* ignore */
      }
    }
  };

  const toggleBatchTextarea = () => {
    const t = getBatchType();
    const isMulti = t === 'multi_prompt';
    const isStoryboard = t === 'storyboard';
    const isBatchEditor = isMulti || isStoryboard;
    if (isBatchEditor) setAdvancedOpen(true);
    if (batchPromptList) batchPromptList.style.display = 'none';
    if (multiGlobalRolesBar) multiGlobalRolesBar.style.display = isMulti ? 'block' : 'none';
    if (multiPromptList) multiPromptList.style.display = isMulti ? 'flex' : 'none';
    if (storyboardBox) storyboardBox.style.display = isStoryboard ? 'block' : 'none';
    if (multiPromptActions) multiPromptActions.style.display = isBatchEditor ? 'block' : 'none';
    if (btnAddPrompt) btnAddPrompt.textContent = isStoryboard ? '新增分镜' : '新增提示';
    if (uploadCard) uploadCard.style.display = isBatchEditor ? 'none' : 'flex';
    if (dropzoneWrap) dropzoneWrap.style.display = isBatchEditor ? 'none' : 'block';
    const promptBlock = document.getElementById('promptBlock');
    if (promptBlock) promptBlock.style.display = isBatchEditor ? 'none' : 'block';

    const showConcurrency = t !== 'single';
    const defaultCountFallback = isStoryboard ? 1 : 2;
    if (batchConcurrencyInput) {
      batchConcurrencyInput.disabled = !showConcurrency;
      if (showConcurrency && document.activeElement !== batchConcurrencyInput) {
        const v = normalizeTimes(batchConcurrencyInput.value, defaultCountFallback);
        batchConcurrencyInput.value = String(v);
      }
    }
    if (btnApplyGlobalCountToAll) {
      btnApplyGlobalCountToAll.style.display = isBatchEditor ? 'inline-flex' : 'none';
    }
    if (globalCountLabel) {
      globalCountLabel.textContent = isBatchEditor ? '默认份数' : '生成份数';
    }
    if (batchMetaActions) {
      batchMetaActions.style.display = showConcurrency ? 'flex' : 'none';
      batchMetaActions.style.alignItems = 'center';
      batchMetaActions.style.gap = '8px';
    }

    if (isMulti && multiPrompts.length === 0) {
      addMultiPrompt(promptBox.value || '', normalizeTimes(batchConcurrencyInput?.value || '2', 2));
    }
    if (isStoryboard && storyboardShots.length === 0) {
      const n = clampInt(storyboardShotCount?.value || '8', { min: 1, max: 200, fallback: 8 });
      // 进入分镜：默认先铺好 N 个输入框，便于一次性写完
      appendStoryboardShots(Math.max(1, n), { text: '', count: normalizeTimes(batchConcurrencyInput?.value || '1', 1) });
    }
    // 重要：不再在“退出多提示/分镜”时自动回写主提示（避免用户感觉输入被偷偷改动）
    syncGlobalCountHighlight();
    syncMainUploadUI({ quiet: false });
    renderFilePreview();
    // 模式切换后，角色“已挂载”徽标/过滤与全局角色区需要同步到当前模式
    renderRoles();
    renderAttachedRoles();
    renderMultiAttachedRoles();
    renderStoryboardAttachedRoles();
    scheduleBatchModeIndicator();
    syncBatchEditorPlanUI();
  };

  const syncGlobalCountHighlight = () => {
    const t = getBatchType();
    if (!batchConcurrencyInput || (t !== 'multi_prompt' && t !== 'storyboard')) {
      batchConcurrencyInput?.classList.remove('select-mismatch');
      if (btnApplyGlobalCountToAll) btnApplyGlobalCountToAll.disabled = true;
      return;
    }
    const fallback = t === 'storyboard' ? 1 : 2;
    const globalVal = normalizeTimes(batchConcurrencyInput.value, fallback);
    if (document.activeElement !== batchConcurrencyInput) batchConcurrencyInput.value = String(globalVal);
    const mismatch =
      t === 'multi_prompt'
        ? multiPrompts.some((p) => (p.count || 0) !== globalVal)
        : storyboardShots.some((s) => (s.count || 0) !== globalVal);
    if (mismatch) batchConcurrencyInput.classList.add('select-mismatch');
    else batchConcurrencyInput.classList.remove('select-mismatch');
    if (btnApplyGlobalCountToAll) btnApplyGlobalCountToAll.disabled = !mismatch;
  };

  const saveForm = () => {
    // 始终把当前模式的默认份数写入“按模式映射”，避免切换后默认被污染
    try {
      if (batchConcurrencyInput) rememberBatchConcurrencyForType(getBatchType(), batchConcurrencyInput.value);
    } catch (_) {
      /* ignore */
    }
    const roleSlim = (r) => ({
      display: r.display || r.display_name || r.username || '',
      username: r.username || '',
      avatar: r.avatar || r.avatar_path || ''
    });
    const data = {
      apiKey: $('apiKey').value,
      baseUrl: $('baseUrl').value,
      model: $('model').value,
      prompt: promptBox.value,
      batchPrompts: batchPromptList ? batchPromptList.value : '',
      batchType: getBatchType(),
      batchConcurrency: batchConcurrencyInput.value,
      batchConcurrencyByType,
      multiPrompts: multiPrompts.map((p) => ({ text: p.text || '', count: p.count || 2 })),
      multiPromptRoles: multiPrompts.map((_, idx) => (multiPromptRoles[idx] || []).map(roleSlim)),
      storyboard: {
        title: storyboardTitle ? storyboardTitle.value : '',
        context: storyboardContext ? storyboardContext.value : '',
        sequential: storyboardSequential ? !!storyboardSequential.checked : true,
        shotCount: storyboardShotCount ? storyboardShotCount.value : '8',
        shots: storyboardShots.map((s) => ({
          text: s.text || '',
          count: s.count || 1,
          useGlobalRoles: s.useGlobalRoles !== false,
          roles: (Array.isArray(s.roles) ? s.roles : []).map(roleSlim)
        }))
      }
    };
    localStorage.setItem(formStorageKey, JSON.stringify(data));
    // 兜底：避免某些路径只保存了数据但没刷新按钮状态，导致“需要刷新页面按钮才可点”
    try {
      const bt = getBatchType();
      if (bt === 'multi_prompt' || bt === 'storyboard') scheduleBatchEditorPlanUI();
    } catch (_) {
      /* ignore */
    }
  };

  const loadForm = () => {
    try {
      const data = JSON.parse(localStorage.getItem(formStorageKey) || '{}');

      // 先还原“按模式默认份数映射”，因为 setBatchType() 会用它来决定进入分镜时的默认份数
      const hasByType = data.batchConcurrencyByType && typeof data.batchConcurrencyByType === 'object';
      batchConcurrencyByType = hasByType ? data.batchConcurrencyByType : {};
      // 兼容旧映射：历史版本可能把分镜默认份数存成 2（旧默认），这里统一回归为 1
      // - 若用户后来明确改成非 2（例如 3/5），则保留
      try {
        if (hasByType && batchConcurrencyByType && batchConcurrencyByType.storyboard !== undefined) {
          const sb = parseInt(String(batchConcurrencyByType.storyboard ?? ''), 10);
          if (!isNaN(sb) && sb === 2) batchConcurrencyByType.storyboard = 1;
        }
      } catch (_) {
        /* ignore */
      }
      const wantType = normalizeBatchType(data.batchType || getBatchType() || 'single');
      // 兼容旧存储：旧版只有 batchConcurrency 一个值，会导致分镜默认=2；现在迁移成：分镜默认=1
      if (!hasByType) {
        const legacy = data.batchConcurrency;
        if (wantType === 'storyboard') {
          const legacyN = parseInt(String(legacy ?? ''), 10);
          // 旧默认一般是 2：迁移时改为 1；若用户当时明确改成非 2，则尊重
          batchConcurrencyByType.storyboard = !isNaN(legacyN) && legacyN !== 2 ? legacyN : 1;
        } else if (legacy !== undefined && legacy !== null && legacy !== '') {
          batchConcurrencyByType[wantType] = legacy;
        }
      }
      if (data.apiKey) $('apiKey').value = data.apiKey;
      if (data.baseUrl) $('baseUrl').value = data.baseUrl;
      if (data.model) $('model').value = data.model;
      if (data.prompt) {
        promptBox.value = data.prompt;
      } else {
        const draft = localStorage.getItem(DRAFT_KEY) || '';
        if (draft) promptBox.value = draft;
      }
      if (batchPromptList && data.batchPrompts) batchPromptList.value = data.batchPrompts;
      if (data.batchType) setBatchType(data.batchType);
      // 同步一次当前模式的份数（避免旧字段/手动改输入导致不一致）
      try {
        const t = normalizeBatchType(data.batchType || getBatchType() || 'single');
        const next = rememberBatchConcurrencyForType(t, batchConcurrencyByType[t] ?? batchConcurrencyInput?.value);
        if (batchConcurrencyInput) batchConcurrencyInput.value = String(next);
        if (quickCountInput && document.activeElement !== quickCountInput) quickCountInput.value = String(next);
      } catch (_) {
        /* ignore */
      }
      if (Array.isArray(data.multiPrompts) && data.multiPrompts.length) {
        const fallback = normalizeTimes(batchConcurrencyInput?.value || '2', 2);
        multiPrompts = data.multiPrompts.map((p) => ({ text: p.text || '', count: normalizeTimes(p.count, fallback) }));
      } else if (batchPromptList && data.batchPrompts) {
        // 兼容旧存储：按行导入
        multiPrompts = data.batchPrompts
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((t) => ({ text: t, count: 2 }));
      }
      // 复原多提示的“行角色”
      try {
        if (Array.isArray(data.multiPromptRoles) && data.multiPromptRoles.length) {
          Object.keys(multiPromptRoles).forEach((k) => delete multiPromptRoles[k]);
          data.multiPromptRoles.forEach((arr, idx) => {
            if (Array.isArray(arr) && arr.length) {
              multiPromptRoles[idx] = arr
                .map((r) => ({
                  display: r.display || r.display_name || r.username || '',
                  username: r.username || '',
                  avatar: r.avatar || r.avatar_path || ''
                }))
                .filter((r) => r.display || r.username);
            }
          });
        }
      } catch (_) {
        /* ignore */
      }

      // 复原分镜（Storyboard）
      try {
        const sb = data.storyboard || {};
        if (storyboardTitle && typeof sb.title === 'string') storyboardTitle.value = sb.title;
        if (storyboardContext && typeof sb.context === 'string') storyboardContext.value = sb.context;
        if (storyboardSequential && typeof sb.sequential === 'boolean') storyboardSequential.checked = sb.sequential;
        if (storyboardShotCount && sb.shotCount) storyboardShotCount.value = String(sb.shotCount);
        if (Array.isArray(sb.shots) && sb.shots.length) {
          storyboardShots = sb.shots.map((s) => ({
            text: s.text || '',
            count: normalizeTimes(s.count, 1),
            fileDataUrl: null,
            fileName: '',
            useGlobalRoles: s.useGlobalRoles === false || s.use_global_roles === false ? false : true,
            roles: Array.isArray(s.roles)
              ? s.roles
                  .map((r) => ({
                    display: r.display || r.display_name || r.username || '',
                    username: r.username || '',
                    avatar: r.avatar || r.avatar_path || ''
                  }))
                  .filter((r) => r.display || r.username)
              : []
          }));
        }
      } catch (_) {
        /* ignore */
      }
      renderMultiPrompts();
      renderStoryboardShots();
      toggleBatchTextarea();
    } catch (_) {
      /* ignore */
    }
  };

  const scheduleDraftSave = () => {
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, promptBox.value || '');
      const hint = $('promptDraftHint');
      if (hint) {
        hint.style.display = 'block';
        setTimeout(() => (hint.style.display = 'none'), 2000);
      }
    }, 10000);
  };

  const handleSend = async () => {
    out.textContent = '';
    const apiKey = $('apiKey').value.trim();
    const model = $('model').value;
    const baseUrl = getBaseUrl();
    const prompt = promptBox.value.trim();
    const files = getMainFiles();
    const batchType = getBatchType();
    const generationCountFallback = batchType === 'storyboard' ? 1 : 2;
    const generationCount = normalizeTimes(batchConcurrencyInput?.value || String(generationCountFallback), generationCountFallback);
    const finalCount = batchType === 'single' ? 1 : generationCount;

    if (!apiKey) {
      showToast('请先填写 API Key', 'error', { title: '缺少 API Key', duration: 3200 });
      smoothFocus($('apiKey'));
      return;
    }
    if (!baseUrl) {
      showToast('请先填写服务器地址（Base URL）', 'error', { title: '缺少服务器地址', duration: 3200 });
      smoothFocus($('baseUrl'));
      return;
    }

    // 仅在发送时拼接角色描述，界面不展示
    const roleContext = buildRoleContextText();
    const promptForSend = [roleContext, prompt].filter(Boolean).join('\n\n');

    // ===== 发送前 UX 预检（自用优先：减少“选了素材但没生效”的误解） =====
    const modelInfo = parseModelId(model);
    const hasVideoFile = files.some((f) => (f.type || '').startsWith('video'));
    const hasImageFile = files.some((f) => (f.type || '').startsWith('image'));
    const mixedFiles = hasVideoFile && hasImageFile;

    // 混合文件：最容易导致“跑偏/忽略素材/批量难以预期”
    if ((batchType === 'single' || batchType === 'same_prompt_files') && files.length && mixedFiles) {
      showToast('检测到图片+视频混合选择：已继续生成，但更建议分开跑（更稳定）', 'warn', {
        title: '混合素材',
        duration: 4200
      });
    }

    // 图片模型 + 视频文件：视频不会被后端用于图片生成（容易误会）
    if ((batchType === 'single' || batchType === 'same_prompt_files') && files.length && modelInfo.isImage && hasVideoFile) {
      showToast('当前是图片模型，但你上传了视频：视频不会参与图片生成（已继续）', 'warn', {
        title: '模型/素材不匹配',
        duration: 4200
      });
    }

    // 视频模型 + 图片首帧 + 空提示：最典型“与图无关”触发条件
    if ((batchType === 'single' || batchType === 'same_prompt_files') && files.length && modelInfo.isVideo && hasImageFile && !promptForSend) {
      showToast('图片首帧但提示词为空：结果可能跑偏（已继续）', 'warn', { title: '空提示词', duration: 4200 });
    }

    const jobs = [];
    if (batchType === 'same_prompt_files') {
      if (!promptForSend && !files.length) {
        showToast('同提示批量：请填写提示词或至少选择一个文件', 'warn', { title: '无法生成', duration: 3600 });
        smoothFocus(promptBox);
        return;
      }
      if (files.length) {
        for (let i = 0; i < finalCount; i++) {
          files.forEach((f) => jobs.push({ promptSend: promptForSend, promptUser: prompt, file: f, model }));
        }
      } else {
        for (let i = 0; i < finalCount; i++) {
          jobs.push({ promptSend: promptForSend, promptUser: prompt, file: null, model });
        }
      }
    } else if (batchType === 'multi_prompt') {
      const defaultCount = generationCount;
      const validPrompts = multiPrompts
        .map((p, idx) => ({
          idx,
          text: (p.text || '').trim(),
          count: normalizeTimes(p.count, defaultCount),
          fileDataUrl: p.fileDataUrl || null,
          fileName: p.fileName || ''
        }))
        .filter((p) => p.text || p.fileDataUrl);
      if (!validPrompts.length) {
        showToast('多提示：请至少添加一条提示（或给某行选择文件）', 'warn', { title: '无法生成', duration: 3600 });
        return;
      }
      validPrompts.forEach((p) => {
        const rowRoles = (multiPromptRoles[p.idx] || [])
          .map((r) => (r.username ? `@${r.username}` : `@${r.display}`))
          .filter(Boolean)
          .join(' ');
        const finalPrompt = [roleContext, rowRoles, p.text].filter(Boolean).join('\n\n');
        const times = normalizeTimes(p.count, defaultCount);
        const promptUser = p.text || p.fileName || '(仅素材)';
        for (let i = 0; i < times; i++) {
          jobs.push({ promptSend: finalPrompt, promptUser, file: null, fileDataUrl: p.fileDataUrl, model });
        }
      });
    } else if (batchType === 'storyboard') {
      const sbTitleRaw = (storyboardTitle && storyboardTitle.value ? storyboardTitle.value.trim() : '') || '';
      const sbContext = (storyboardContext && storyboardContext.value ? storyboardContext.value.trim() : '') || '';
      const totalShots = storyboardShots.length || 0;
      if (!totalShots) {
        showToast('分镜为空：请先选择镜头数并“应用”，或点击“新增分镜”', 'warn', { title: '无法生成', duration: 3600 });
        return;
      }

      const emptyIdx = [];
      const list = storyboardShots
        .map((s, idx) => ({
          idx,
          idx1: idx + 1,
          text: (s.text || '').trim(),
          count: normalizeTimes(s.count, 1),
          fileDataUrl: s.fileDataUrl || null,
          roles: Array.isArray(s.roles) ? s.roles : [],
          useGlobalRoles: s && s.useGlobalRoles === false ? false : true
        }))
        .filter((x) => {
          const hasAny = !!x.text || !!x.fileDataUrl;
          if (!hasAny) emptyIdx.push(x.idx1);
          return hasAny;
        });

      if (!list.length) {
        showToast('分镜：请至少填写一条分镜提示（或给某一镜选择文件）', 'warn', { title: '无法生成', duration: 3600 });
        return;
      }
      if (emptyIdx.length) {
        const plannedTasks = list.reduce((sum, x) => sum + normalizeTimes(x.count, 1), 0);
        showToast(
          `将跳过 ${emptyIdx.length} 个空分镜（${emptyIdx.slice(0, 12).join(', ')}${emptyIdx.length > 12 ? '...' : ''}），创建 ${plannedTasks} 条任务`,
          'info',
          { title: '分镜将跳过空镜', duration: 5200 }
        );
      }

      storyboardRunCounter += 1;
      localStorage.setItem(STORYBOARD_RUN_KEY, String(storyboardRunCounter));
      // 若用户未填标题，自动给一个可检索的分镜组名，避免后续任务堆积难找
      const sbTitle = sbTitleRaw || `分镜组${storyboardRunCounter}`;
      if (storyboardTitle && !sbTitleRaw) storyboardTitle.value = sbTitle;

      list.forEach((shot) => {
        const rowRoles = shot.roles
          .map((r) => (r.username ? `@${r.username}` : `@${r.display}`))
          .filter(Boolean)
          .join(' ');
        const globalCtx = shot.useGlobalRoles ? roleContext : '';
        const finalPrompt = [globalCtx, sbContext, rowRoles, shot.text].filter(Boolean).join('\n\n');
        const times = normalizeTimes(shot.count, 1);
        const baseLabel = getStoryboardShotLabel(storyboardRunCounter, shot.idx1, totalShots);
        for (let i = 0; i < times; i++) {
          const label = times > 1 ? `${baseLabel}·${i + 1}` : baseLabel;
          jobs.push({
            promptSend: finalPrompt,
            promptUser: shot.text,
            file: null,
            fileDataUrl: shot.fileDataUrl,
            model,
            storyboard: {
              run: storyboardRunCounter,
              idx: shot.idx1,
              total: totalShots,
              title: sbTitle,
              label,
              take: i + 1,
              takes: times
            }
          });
        }
      });
    } else if (batchType === 'character') {
      // 角色卡模式：只需要视频文件，不需要提示词
      if (!files.length) {
        showToast('角色卡模式：请上传视频文件', 'warn', { title: '缺少视频', duration: 3600 });
        return;
      }
      const videoFile = files.find((f) => (f.type || '').startsWith('video'));
      if (!videoFile) {
        showToast('角色卡模式：请上传视频文件（不支持图片）', 'warn', { title: '文件类型错误', duration: 3600 });
        return;
      }
      // 角色卡模式：prompt为空，只传视频，标记为角色卡任务
      jobs.push({
        promptSend: '',
        promptUser: '(创建角色卡)',
        file: videoFile,
        model,
        isCharacterCreation: true  // 标记为角色卡创建任务
      });
    } else {
      if (!promptForSend && !files.length) {
        showToast('请至少填写提示词或上传文件', 'warn', { title: '无法生成', duration: 3600 });
        smoothFocus(promptBox);
        return;
      }
      for (let i = 0; i < finalCount; i++) {
        jobs.push({ promptSend: promptForSend, promptUser: prompt, file: files[0] || null, model });
      }
    }

    // 同提示批量：二次确认“大批量”，防止误触瞬间起飞
    if (batchType === 'same_prompt_files' && jobs.length >= 30) {
      const fileCount = files.length;
      const explain = fileCount
        ? `${fileCount} 个文件 × ${finalCount} 份 = ${jobs.length} 条任务`
        : `纯文字 × ${finalCount} 份 = ${jobs.length} 条任务`;
      showToast(`同提示批量较大：${explain}（已继续生成）`, 'warn', { title: '大批量提示', duration: 5200 });
    }

    // 轻提醒：不自动切 Tab，但给一个“查看任务”按钮（避免打断写提示的节奏）
    if (jobs.length && currentRightTab !== 'tasks') {
      showToast(`已创建 ${jobs.length} 条任务，正在生成…`, 'info', {
        title: '任务已入队',
        duration: 3600,
        action: { text: '查看任务', onClick: () => setRightTab('tasks') }
      });
    }

    // 入队后立即解锁按钮，允许追加任务
    const setSendBusy = (busy) => {
      [btnSend, btnSendPrimary].filter(Boolean).forEach((b) => {
        b.disabled = !!busy;
        if (busy) b.textContent = `生成中(${jobs.length}条)...`;
      });
    };
    setSendBusy(true);
    const pool =
      // 分镜不做“顺序生成/限流”：默认全部并发启动（任务会一次性出现）
      jobs.length;
    const running = runJobs(jobs, apiKey, baseUrl, pool).catch((e) => log('错误: ' + e.message));
    setSendBusy(false);
    syncSingleSamePlanUI(); // 恢复主按钮上的“预计任务数”文案
    syncBatchEditorPlanUI(); // 恢复批量编辑器按钮上的“预计任务数”文案
    await running;
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // 拖拽/选择文件
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      const list = Array.from(e.dataTransfer.files || []);
      setMainFiles(list);
      // 单次模式下拖进来多个：自动裁剪并提示（避免误以为“会批量”）
      ensureMainFilePickerMode(getBatchType(), { quiet: false });
      syncMainUploadUI({ quiet: true });
      renderFilePreview(); // 更新预览/提示（不阻塞）
    }
  });
  fileInput.addEventListener('change', () => {
    if (applyingMainFiles) return;
    // 用户通过文件选择器选中文件
    ensureMainFilePickerMode(getBatchType(), { quiet: false });
    syncMainUploadUI({ quiet: true });
    renderFilePreview();
  });

  // 文件清单：同提示批量下可逐个移除
  if (filePreviewList) {
    filePreviewList.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-remove-main-file]') : null;
      if (!btn) return;
      const idx = parseInt(btn.getAttribute('data-remove-main-file'), 10);
      const files = getMainFiles();
      if (isNaN(idx) || idx < 0 || idx >= files.length) return;
      const removed = files[idx];
      files.splice(idx, 1);
      setMainFiles(files);
      syncMainUploadUI({ quiet: true });
      renderFilePreview();
      showToast(`已移除：${removed?.name || '文件'}`, 'success');
    });
  }
  if (btnClearFiles) {
    btnClearFiles.addEventListener('click', () => {
      setMainFiles([]);
      syncMainUploadUI({ quiet: true });
      renderFilePreview();
      showToast('已清空文件', 'success');
    });
  }

  // 快捷模式切换：把“单次/同提示批量”从高级设置里挪到主上传区
  if (quickModeBar) {
    quickModeBar.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-quick-mode]') : null;
      if (!btn) return;
      const val = btn.getAttribute('data-quick-mode');
      if (!val) return;
      setBatchType(val);
      syncMainUploadUI({ quiet: false });
    });
  }
  if (btnOpenMoreModes) {
    btnOpenMoreModes.addEventListener('click', () => {
      setAdvancedOpen(true, { scroll: true });
    });
  }
  if (btnToggleAdvanced) {
    btnToggleAdvanced.addEventListener('click', () => {
      setAdvancedOpen(!advancedOpen, { scroll: false });
    });
  }

  // 快捷份数（同提示批量）：与高级设置里的 batchConcurrencyInput 同步
  const applyQuickCount = (next) => {
    if (!batchConcurrencyInput) return;
    const bt = getBatchType();
    const fallback = bt === 'storyboard' ? 1 : 2;
    const val = normalizeTimes(String(next ?? batchConcurrencyInput.value ?? fallback), fallback);
    batchConcurrencyInput.value = String(val);
    if (quickCountInput && document.activeElement !== quickCountInput) quickCountInput.value = String(val);
    saveForm();
    syncGlobalCountHighlight();
    syncSingleSamePlanUI();
    // 快捷份数同样会影响多提示/分镜的“预计任务数”与按钮可用性
    scheduleBatchEditorPlanUI();
  };
  if (quickCountDec) {
    quickCountDec.addEventListener('click', () => {
      const cur = clampInt(quickCountInput?.value || batchConcurrencyInput?.value || '2', { min: 1, max: 9999, fallback: 2 });
      applyQuickCount(cur - 1);
    });
  }
  if (quickCountInc) {
    quickCountInc.addEventListener('click', () => {
      const cur = clampInt(quickCountInput?.value || batchConcurrencyInput?.value || '2', { min: 1, max: 9999, fallback: 2 });
      applyQuickCount(cur + 1);
    });
  }
  if (quickCountInput) {
    quickCountInput.addEventListener('change', () => applyQuickCount(quickCountInput.value));
    quickCountInput.addEventListener('input', () => syncSingleSamePlanUI());
  }

  // 快捷标签
  tagBar.querySelectorAll('[data-snippet]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const snippet = btn.getAttribute('data-snippet');
      const cur = promptBox.value;
      promptBox.value = cur ? `${cur}\n${snippet}` : snippet;
      analyzePromptHints();
      saveForm();
      syncSingleSamePlanUI();
      renderFilePreview();
      scheduleDraftSave();
    });
  });

  // Prompt 变更
  promptBox.addEventListener('input', () => {
    analyzePromptHints();
    syncSingleSamePlanUI();
    // 仅更新“提示词为空”等提示，不要每次输入都重建 objectURL
    if (previewHintTimer) clearTimeout(previewHintTimer);
    previewHintTimer = setTimeout(() => renderFilePreview(), 180);
  });
  promptBox.addEventListener('dragover', (e) => e.preventDefault());
  promptBox.addEventListener('drop', (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      try {
        const obj = JSON.parse(text);
        if (obj.display) {
          handleRoleAttach({
            display: obj.display || obj.display_name || obj.username || '',
            username: obj.username || '',
            avatar: obj.avatar || obj.avatar_path || ''
          }, e);
          return;
        }
      } catch (_) {
        // 非 JSON 文本则忽略
      }
    }
  });

  // 角色卡挂载区
  const renderAttachedRoles = () => {
    attachedRolesBox.innerHTML =
      attachedRoles
        .map(
          (r, idx) =>
            `<span class="chip" data-attached="${idx}" draggable="true" style="display:inline-flex;align-items:center;gap:6px;">
                ${r.avatar ? `<img src="${r.avatar}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;">` : ''}
                @${escapeHtml(r.display || r.username || '角色')}
                <button class="chip-close" type="button" aria-label="移除角色" title="移除" style="margin-left:6px;cursor:pointer;border:none;background:transparent;font-weight:600;color:#64748b;line-height:1;">×</button>
             </span>`
        )
        .join('') || '';

    // 一键清空：没有角色时禁用，避免“点了没反应”的困惑
    if (btnClearMainRoles) {
      const has = Array.isArray(attachedRoles) && attachedRoles.length > 0;
      btnClearMainRoles.disabled = !has;
      btnClearMainRoles.style.opacity = has ? '1' : '0.55';
    }
    attachedRolesBox.querySelectorAll('[data-attached]').forEach((el) => {
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', el.getAttribute('data-attached'));
      });
      el.addEventListener('dragover', (e) => e.preventDefault());
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const to = parseInt(el.getAttribute('data-attached'), 10);
        if (isNaN(from) || isNaN(to) || from === to) return;
        const tmp = attachedRoles[from];
        attachedRoles.splice(from, 1);
        attachedRoles.splice(to, 0, tmp);
        renderAttachedRoles();
        persistRoles();
      });
    });
    attachedRolesBox.querySelectorAll('.chip-close').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chip = btn.closest('[data-attached]');
        if (!chip) return;
        const idx = parseInt(chip.getAttribute('data-attached'), 10);
        attachedRoles.splice(idx, 1);
        renderAttachedRoles();
        persistRoles();
        renderRoles();
      });
    });
    // 角色挂载会改变 promptForSend，可影响“是否就绪 / 预计任务数”
    syncSingleSamePlanUI();
  };

  // 多提示模式：本模式全局角色（不会影响单次/同提示）
  const renderMultiAttachedRoles = () => {
    if (!multiAttachedRolesBox) return;
    multiAttachedRolesBox.innerHTML =
      attachedRolesMulti
        .map(
          (r, idx) =>
            `<span class="chip" data-multi-attached="${idx}" style="display:inline-flex;align-items:center;gap:6px;">
                ${r.avatar ? `<img src="${r.avatar}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;">` : ''}
                @${escapeHtml(r.display || r.username || '角色')}
                <button class="chip-close" type="button" aria-label="移除角色" title="移除" style="margin-left:6px;cursor:pointer;border:none;background:transparent;font-weight:600;color:#64748b;line-height:1;">×</button>
             </span>`
        )
        .join('') || '';

    multiAttachedRolesBox.querySelectorAll('.chip-close').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chip = btn.closest('[data-multi-attached]');
        if (!chip) return;
        const idx = parseInt(chip.getAttribute('data-multi-attached'), 10);
        if (isNaN(idx)) return;
        attachedRolesMulti.splice(idx, 1);
        renderMultiAttachedRoles();
        persistRolesMulti();
        renderRoles();
      });
    });

    // 同步刷新每一行下方的角色展示（否则会出现“挂载全局但行下看不到”的错觉）
    renderMultiPromptRoleChipsOnly();
    // 兜底：避免某些边界情况下按钮状态没被重新计算
    scheduleBatchEditorPlanUI();
    // 再兜底：某些环境/iframe 下 rAF 可能被节流，直接同步一次避免“按钮灰了只能刷新”
    try {
      syncBatchEditorPlanUI();
    } catch (_) {
      /* ignore */
    }
  };

  // 分镜模式：本模式全局角色（不会影响单次/同提示）
  const renderStoryboardAttachedRoles = () => {
    if (!storyboardAttachedRolesBox) return;
    storyboardAttachedRolesBox.innerHTML =
      attachedRolesStoryboard
        .map(
          (r, idx) =>
            `<span class="chip" data-sb-attached="${idx}" style="display:inline-flex;align-items:center;gap:6px;">
                ${r.avatar ? `<img src="${r.avatar}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;">` : ''}
                @${escapeHtml(r.display || r.username || '角色')}
                <button class="chip-close" type="button" aria-label="移除角色" title="移除" style="margin-left:6px;cursor:pointer;border:none;background:transparent;font-weight:600;color:#64748b;line-height:1;">×</button>
             </span>`
        )
        .join('') || '';

    storyboardAttachedRolesBox.querySelectorAll('.chip-close').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chip = btn.closest('[data-sb-attached]');
        if (!chip) return;
        const idx = parseInt(chip.getAttribute('data-sb-attached'), 10);
        if (isNaN(idx)) return;
        attachedRolesStoryboard.splice(idx, 1);
        renderStoryboardAttachedRoles();
        persistRolesStoryboard();
        renderRoles();
      });
    });

    // 关键：全局角色变更后，同步刷新每一镜下方的角色展示（否则会出现“挂载全部但分镜下看不到”的错觉）
    renderStoryboardRoleChipsOnly();
    // 兜底：全局角色切换不应影响“开始生成”可用性，但需要强制刷新按钮状态（避免卡死需要刷新页面）
    scheduleBatchEditorPlanUI();
    // 再兜底：某些环境/iframe 下 rAF 可能被节流，直接同步一次避免“按钮灰了只能刷新”
    try {
      syncBatchEditorPlanUI();
    } catch (_) {
      /* ignore */
    }
  };

  const addAttachedRole = (roleObj) => {
    if (!roleObj || (!roleObj.display && !roleObj.username)) return;
    const u = roleObj.username || '';
    const d = roleObj.display || '';
    if (attachedRoles.find((r) => (u && r.username === u) || (!u && d && r.display === d))) return;
    attachedRoles.push(roleObj);
    markRoleUsed(u);
    renderAttachedRoles();
    persistRoles();
    renderRoles(); // 同步“已挂载”徽标/过滤统计
  };

  const addAttachedRoleMulti = (roleObj) => {
    if (!roleObj || (!roleObj.display && !roleObj.username)) return;
    const u = String(roleObj.username || '').trim();
    const d = String(roleObj.display || '').trim();
    if (attachedRolesMulti.find((r) => (u && String(r.username || '').trim() === u) || (!u && d && String(r.display || '').trim() === d)))
      return;
    attachedRolesMulti.push(roleObj);
    markRoleUsed(u);
    renderMultiAttachedRoles();
    persistRolesMulti();
    renderRoles();
  };

  const removeAttachedRoleMulti = (roleObj) => {
    const u = String(roleObj?.username || '').trim();
    const d = String(roleObj?.display || '').trim();
    const next = attachedRolesMulti.filter((r) => {
      const ru = String(r?.username || '').trim();
      const rd = String(r?.display || '').trim();
      if (u) return ru !== u;
      return d ? rd !== d : true;
    });
    const changed = next.length !== attachedRolesMulti.length;
    if (changed) {
      attachedRolesMulti = next;
      renderMultiAttachedRoles();
      persistRolesMulti();
      renderRoles();
    }
    return changed;
  };

  const toggleAttachedRoleMulti = (roleObj) => {
    const u = String(roleObj?.username || '').trim();
    const exists = u
      ? attachedRolesMulti.some((r) => String(r?.username || '').trim() === u)
      : attachedRolesMulti.some((r) => String(r?.display || '').trim() === String(roleObj?.display || '').trim());
    if (exists) return !removeAttachedRoleMulti(roleObj);
    addAttachedRoleMulti(roleObj);
    return true;
  };

  const addAttachedRoleStoryboard = (roleObj) => {
    if (!roleObj || (!roleObj.display && !roleObj.username)) return;
    const u = String(roleObj.username || '').trim();
    const d = String(roleObj.display || '').trim();
    if (
      attachedRolesStoryboard.find((r) => (u && String(r.username || '').trim() === u) || (!u && d && String(r.display || '').trim() === d))
    )
      return;
    attachedRolesStoryboard.push(roleObj);
    markRoleUsed(u);
    renderStoryboardAttachedRoles();
    persistRolesStoryboard();
    renderRoles();
  };

  const removeAttachedRoleStoryboard = (roleObj) => {
    const u = String(roleObj?.username || '').trim();
    const d = String(roleObj?.display || '').trim();
    const next = attachedRolesStoryboard.filter((r) => {
      const ru = String(r?.username || '').trim();
      const rd = String(r?.display || '').trim();
      if (u) return ru !== u;
      return d ? rd !== d : true;
    });
    const changed = next.length !== attachedRolesStoryboard.length;
    if (changed) {
      attachedRolesStoryboard = next;
      renderStoryboardAttachedRoles();
      persistRolesStoryboard();
      renderRoles();
    }
    return changed;
  };

  const toggleAttachedRoleStoryboard = (roleObj) => {
    const u = String(roleObj?.username || '').trim();
    const exists = u
      ? attachedRolesStoryboard.some((r) => String(r?.username || '').trim() === u)
      : attachedRolesStoryboard.some((r) => String(r?.display || '').trim() === String(roleObj?.display || '').trim());
    if (exists) return !removeAttachedRoleStoryboard(roleObj);
    addAttachedRoleStoryboard(roleObj);
    return true;
  };

  const addRoleToRow = (idx, roleObj) => {
    if (idx === null || idx === undefined || idx < 0 || !multiPrompts[idx]) return;
    const list = multiPromptRoles[idx] || [];
    if (list.find((r) => r.display === roleObj.display && r.username === roleObj.username)) return;
    list.push(roleObj);
    multiPromptRoles[idx] = list;
    markRoleUsed(roleObj?.username || '');
    renderMultiPromptRoleChipsOnly();
    renderRoles();
    saveForm();
  };

  const removeRoleFromRow = (idx, roleObj) => {
    if (idx === null || idx === undefined || idx < 0 || !multiPrompts[idx]) return false;
    const list = multiPromptRoles[idx] || [];
    const u = String(roleObj?.username || '').trim();
    const d = String(roleObj?.display || '').trim();
    const next = list.filter((r) => {
      const ru = String(r?.username || '').trim();
      const rd = String(r?.display || '').trim();
      if (u) return ru !== u;
      return d ? rd !== d : true;
    });
    const changed = next.length !== list.length;
    if (changed) {
      multiPromptRoles[idx] = next;
      renderMultiPromptRoleChipsOnly();
      renderRoles();
      saveForm();
    }
    return changed;
  };

  const toggleRoleOnRow = (idx, roleObj) => {
    const list = multiPromptRoles[idx] || [];
    const u = String(roleObj?.username || '').trim();
    const exists = u ? list.some((r) => String(r?.username || '').trim() === u) : list.some((r) => (r?.display || '') === roleObj?.display);
    if (exists) {
      removeRoleFromRow(idx, roleObj);
      return false;
    }
    addRoleToRow(idx, roleObj);
    return true;
  };

  const addRoleToStoryboardShot = (idx, roleObj) => {
    if (idx === null || idx === undefined || idx < 0 || !storyboardShots[idx]) return;
    const s = storyboardShots[idx];
    const list = Array.isArray(s.roles) ? s.roles : [];
    if (list.find((r) => r.display === roleObj.display && r.username === roleObj.username)) return;
    list.push(roleObj);
    storyboardShots[idx] = { ...s, roles: list };
    markRoleUsed(roleObj?.username || '');
    renderStoryboardRoleChipsOnly();
    renderRoles();
    saveForm();
  };

  const removeRoleFromStoryboardShot = (idx, roleObj) => {
    if (idx === null || idx === undefined || idx < 0 || !storyboardShots[idx]) return false;
    const s = storyboardShots[idx];
    const list = Array.isArray(s.roles) ? s.roles : [];
    const u = String(roleObj?.username || '').trim();
    const d = String(roleObj?.display || '').trim();
    const next = list.filter((r) => {
      const ru = String(r?.username || '').trim();
      const rd = String(r?.display || '').trim();
      if (u) return ru !== u;
      return d ? rd !== d : true;
    });
    const changed = next.length !== list.length;
    if (changed) {
      storyboardShots[idx] = { ...s, roles: next };
      renderStoryboardRoleChipsOnly();
      renderRoles();
      saveForm();
    }
    return changed;
  };

  const toggleRoleOnStoryboardShot = (idx, roleObj) => {
    const s = storyboardShots[idx];
    const list = (s && Array.isArray(s.roles) ? s.roles : []) || [];
    const u = String(roleObj?.username || '').trim();
    const exists = u ? list.some((r) => String(r?.username || '').trim() === u) : list.some((r) => (r?.display || '') === roleObj?.display);
    if (exists) {
      removeRoleFromStoryboardShot(idx, roleObj);
      return false;
    }
    addRoleToStoryboardShot(idx, roleObj);
    return true;
  };

  const showRoleTargetMenu = (roleObj, clientX, clientY) => {
    const menu = document.createElement('div');
    menu.className = 'role-target-menu';
    menu.style.position = 'fixed';
    menu.style.zIndex = 9999;
    menu.style.background = '#0f172a';
    menu.style.color = '#fff';
    menu.style.border = '1px solid #1e293b';
    menu.style.borderRadius = '10px';
    menu.style.padding = '8px';
    menu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
    menu.style.minWidth = '160px';
    menu.style.left = `${clientX}px`;
    menu.style.top = `${clientY}px`;
    const makeBtn = (label, handler) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.width = '100%';
      b.style.textAlign = 'left';
      b.style.background = 'transparent';
      b.style.color = '#fff';
      b.style.border = 'none';
      b.style.padding = '6px 8px';
      b.style.cursor = 'pointer';
      b.onmouseenter = () => (b.style.background = 'rgba(255,255,255,0.08)');
      b.onmouseleave = () => (b.style.background = 'transparent');
      b.onclick = () => {
        handler();
        renderRoles();
        document.body.removeChild(menu);
      };
      return b;
    };
    const bt = getBatchType();
    const uname = String(roleObj?.username || '').trim();

    // “全局（本模式）”：用于人物一致性，但不污染单次/同提示
    if (bt === 'multi_prompt') {
      const inGlobal = uname ? attachedRolesMulti.some((r) => String(r?.username || '').trim() === uname) : false;
      menu.appendChild(
        makeBtn(inGlobal ? '全局（本模式）：已挂载（点此取消）' : '全局（本模式）：挂载到所有提示', () => toggleAttachedRoleMulti(roleObj))
      );
      menu.appendChild(makeBtn('—— 挂载到单行 ——', () => {})).disabled = true;
      multiPrompts.forEach((p, idx) => {
        const row = multiPromptRoles[idx] || [];
        const inRow = uname ? row.some((r) => String(r?.username || '').trim() === uname) : false;
        menu.appendChild(makeBtn(inRow ? `提示 ${idx + 1}：已挂载（点此取消）` : `提示 ${idx + 1}`, () => toggleRoleOnRow(idx, roleObj)));
      });
    } else if (bt === 'storyboard') {
      const inGlobal = uname ? attachedRolesStoryboard.some((r) => String(r?.username || '').trim() === uname) : false;
      menu.appendChild(
        makeBtn(inGlobal ? '全局（本模式）：已挂载（点此取消）' : '全局（本模式）：挂载到所有分镜', () =>
          toggleAttachedRoleStoryboard(roleObj)
        )
      );
      menu.appendChild(makeBtn('—— 挂载到单镜 ——', () => {})).disabled = true;
      storyboardShots.forEach((s, idx) => {
        const roles = (s && Array.isArray(s.roles) ? s.roles : []) || [];
        const inShot = uname ? roles.some((r) => String(r?.username || '').trim() === uname) : false;
        menu.appendChild(
          makeBtn(inShot ? `分镜 ${idx + 1}：已挂载（点此取消）` : `分镜 ${idx + 1}`, () => toggleRoleOnStoryboardShot(idx, roleObj))
        );
      });
    } else {
      // 兜底：非批量模式不应该走到这里；按主提示挂载
      menu.appendChild(makeBtn('挂载到提示词下方', () => addAttachedRole(roleObj)));
    }
    document.body.appendChild(menu);
    const dismiss = (e) => {
      if (!menu.contains(e.target)) {
        document.body.removeChild(menu);
        document.removeEventListener('mousedown', dismiss);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', dismiss), 0);
  };

  const handleRoleAttach = (roleObj, event, targetIdx = null) => {
    const bt = getBatchType();
    if (bt !== 'multi_prompt' && bt !== 'storyboard') {
      addAttachedRole(roleObj);
      return;
    }
    if (targetIdx !== null) {
      if (bt === 'multi_prompt') addRoleToRow(targetIdx, roleObj);
      else addRoleToStoryboardShot(targetIdx, roleObj);
      return;
    }
    const { clientX = window.innerWidth / 2, clientY = window.innerHeight / 2 } = event || {};
    showRoleTargetMenu(roleObj, clientX, clientY);
  };

  const safeParse = (raw, fallback) => {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const loadRoleUiFromStorage = () => {
    const v = safeParse(localStorage.getItem(ROLE_UI_KEY) || '', null);
    if (!v || typeof v !== 'object') return;
    if (typeof v.query === 'string') roleUi.query = v.query;
    if (typeof v.filter === 'string') roleUi.filter = v.filter;
    if (typeof v.sort === 'string') roleUi.sort = v.sort;
    if (typeof v.dense === 'boolean') roleUi.dense = v.dense;
  };

  const saveRoleUiToStorage = () => {
    try {
      localStorage.setItem(
        ROLE_UI_KEY,
        JSON.stringify({
          query: roleUi.query || '',
          filter: roleUi.filter || 'all',
          sort: roleUi.sort || 'smart',
          dense: !!roleUi.dense
        })
      );
    } catch (_) {
      /* ignore */
    }
  };

  const loadRoleFavsFromStorage = () => {
    const arr = safeParse(localStorage.getItem(ROLE_FAV_KEY) || '[]', []);
    roleFavs = new Set(Array.isArray(arr) ? arr.filter(Boolean).map((x) => String(x)) : []);
  };

  const saveRoleFavsToStorage = () => {
    try {
      localStorage.setItem(ROLE_FAV_KEY, JSON.stringify(Array.from(roleFavs.values())));
    } catch (_) {
      /* ignore */
    }
  };

  const loadRoleUsedFromStorage = () => {
    const obj = safeParse(localStorage.getItem(ROLE_USED_KEY) || '{}', {});
    roleUsed = obj && typeof obj === 'object' ? obj : {};
  };

  const saveRoleUsedToStorage = () => {
    try {
      localStorage.setItem(ROLE_USED_KEY, JSON.stringify(roleUsed || {}));
    } catch (_) {
      /* ignore */
    }
  };

  const markRoleUsed = (username) => {
    const u = String(username || '').trim();
    if (!u) return;
    roleUsed[u] = Date.now();
    saveRoleUsedToStorage();
  };

  const isRoleAttachedMain = (username) => {
    const u = String(username || '').trim();
    if (!u) return false;
    return attachedRoles.some((r) => String(r?.username || '').trim() === u);
  };

  const isRoleAttachedMultiGlobal = (username) => {
    const u = String(username || '').trim();
    if (!u) return false;
    return attachedRolesMulti.some((r) => String(r?.username || '').trim() === u);
  };

  const isRoleAttachedStoryboardGlobal = (username) => {
    const u = String(username || '').trim();
    if (!u) return false;
    return attachedRolesStoryboard.some((r) => String(r?.username || '').trim() === u);
  };

  const isRoleAttachedInAnyMultiRow = (username) => {
    const u = String(username || '').trim();
    if (!u) return false;
    return Object.values(multiPromptRoles || {}).some((arr) => Array.isArray(arr) && arr.some((r) => String(r?.username || '').trim() === u));
  };

  const isRoleAttachedInAnyStoryboardShot = (username) => {
    const u = String(username || '').trim();
    if (!u) return false;
    return storyboardShots.some((s) => Array.isArray(s?.roles) && s.roles.some((r) => String(r?.username || '').trim() === u));
  };

  const isRoleAttachedInCurrentMode = (username) => {
    const bt = getBatchType();
    if (bt === 'multi_prompt') return isRoleAttachedMultiGlobal(username) || isRoleAttachedInAnyMultiRow(username);
    if (bt === 'storyboard') return isRoleAttachedStoryboardGlobal(username) || isRoleAttachedInAnyStoryboardShot(username);
    // 单次/同提示
    return isRoleAttachedMain(username);
  };

  const syncRoleFilterButtons = () => {
    if (!roleFilterBar) return;
    const btns = Array.from(roleFilterBar.querySelectorAll('[data-role-filter]'));
    btns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-role-filter') === roleUi.filter));
  };

  const syncRoleClearButton = () => {
    if (!roleSearchClear || !roleSearch) return;
    roleSearchClear.classList.toggle('show', !!roleSearch.value.trim());
  };

  const syncRoleDenseButton = () => {
    if (!btnRoleDense || !roleList) return;
    btnRoleDense.classList.toggle('active', !!roleUi.dense);
    btnRoleDense.textContent = roleUi.dense ? '密集 ✓' : '密集';
    roleList.classList.toggle('dense', !!roleUi.dense);
  };

  const syncRoleSortSelect = () => {
    if (!roleSort) return;
    roleSort.value = roleUi.sort || 'smart';
  };

  const syncRoleCount = (visible, total) => {
    if (!roleCountEl) return;
    if (!total) roleCountEl.textContent = '0';
    else if (visible === total && !roleUi.query && (roleUi.filter === 'all' || !roleUi.filter))
      roleCountEl.textContent = `共 ${total}`;
    else roleCountEl.textContent = `显示 ${visible}/${total}`;
  };

  const renderRoleSkeleton = (n = 6) => {
    if (!roleList) return;
    roleList.setAttribute('aria-busy', 'true');
    roleList.innerHTML = Array.from({ length: n })
      .map(
        () =>
          `<div class="role-card role-skeleton" aria-hidden="true">
            <div class="role-avatar" style="background:#e2e8f0;border-color:rgba(148,163,184,0.55);"></div>
            <div class="role-meta">
              <div style="height:14px;width:68%;background:#e2e8f0;border-radius:8px;"></div>
              <div style="height:12px;width:46%;background:#e2e8f0;border-radius:8px;margin-top:8px;"></div>
              <div style="height:12px;width:86%;background:#e2e8f0;border-radius:8px;margin-top:10px;"></div>
              <div style="height:30px;width:100%;background:#e2e8f0;border-radius:12px;margin-top:12px;"></div>
            </div>
          </div>`
      )
      .join('');
    if (roleCountEl) roleCountEl.textContent = '加载中…';
    notifyHeight();
  };

  const getRoleDisplayName = (r) => {
    const a = String(r?.display_name || '').trim();
    const b = String(r?.username || '').trim();
    return a || b || '角色';
  };

  const normalizeKeyword = (raw) => {
    const s = String(raw || '').trim().toLowerCase();
    return s.replace(/^@+/, '');
  };

  const renderRoles = () => {
    if (!roleList) return;
    roleList.setAttribute('aria-busy', 'false');

    // UI 同步（避免外部状态与 DOM 脱节）
    syncRoleFilterButtons();
    syncRoleDenseButton();
    syncRoleClearButton();
    syncRoleSortSelect();

    const all = Array.isArray(roles) ? roles : [];
    const total = all.length;
    const keyword = normalizeKeyword(roleSearch?.value || roleUi.query || '');

    // 过滤：关键词 + 筛选器
    let list = all.filter((r) => {
      if (!keyword) return true;
      const hay = [
        getRoleDisplayName(r),
        r?.username ? '@' + r.username : '',
        r?.cameo_id || '',
        r?.character_id || '',
        r?.description || '',
        r?.bio || ''
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(keyword);
    });

    if (roleUi.filter === 'attached') {
      list = list.filter((r) => isRoleAttachedInCurrentMode(r?.username || ''));
    } else if (roleUi.filter === 'fav') {
      list = list.filter((r) => roleFavs.has(String(r?.username || '').trim()));
    }

    // 排序
    const byName = (a, b) =>
      getRoleDisplayName(a).localeCompare(getRoleDisplayName(b), 'zh-CN', { numeric: true, sensitivity: 'base' });
    const byCreatedDesc = (a, b) => (Date.parse(b?.created_at || '') || 0) - (Date.parse(a?.created_at || '') || 0);
    const byCreatedAsc = (a, b) => -byCreatedDesc(a, b);

    if (roleUi.sort === 'newest') list.sort(byCreatedDesc);
    else if (roleUi.sort === 'oldest') list.sort(byCreatedAsc);
    else if (roleUi.sort === 'name_asc') list.sort(byName);
    else if (roleUi.sort === 'name_desc') list.sort((a, b) => -byName(a, b));
    else {
      // smart：收藏 > 最近使用 > 创建时间 > 名称
      list.sort((a, b) => {
        const ua = String(a?.username || '').trim();
        const ub = String(b?.username || '').trim();
        const fa = roleFavs.has(ua) ? 1 : 0;
        const fb = roleFavs.has(ub) ? 1 : 0;
        if (fa !== fb) return fb - fa;
        const la = roleUsed[ua] || 0;
        const lb = roleUsed[ub] || 0;
        if (la !== lb) return lb - la;
        const ca = Date.parse(a?.created_at || '') || 0;
        const cb = Date.parse(b?.created_at || '') || 0;
        if (ca !== cb) return cb - ca;
        return byName(a, b);
      });
    }

    syncRoleCount(list.length, total);

    if (!total) {
      roleList.innerHTML = `
        <div class="role-empty">
          <div class="title">暂无角色卡</div>
          <div class="desc">可以先在管理台/生成流程创建角色卡，然后回到这里点击“刷新”。</div>
          <div class="actions">
            <button class="pill-btn" type="button" data-role-action="reload">刷新</button>
          </div>
        </div>
      `;
      notifyHeight();
      return;
    }

    if (!list.length) {
      const parts = [];
      if (keyword) parts.push('搜索无结果');
      if (roleUi.filter === 'attached') parts.push('当前没有“已挂载”的角色');
      if (roleUi.filter === 'fav') parts.push('当前没有“收藏”的角色');
      const tip = parts.length ? parts.join('，') : '没有匹配的角色';
      roleList.innerHTML = `
        <div class="role-empty">
          <div class="title">${escapeHtml(tip)}</div>
          <div class="desc">可以清空搜索/切回“全部”，或直接刷新重新加载角色卡。</div>
          <div class="actions">
            ${keyword ? '<button class="pill-btn" type="button" data-role-action="clear-search">清空搜索</button>' : ''}
            ${roleUi.filter !== 'all' ? '<button class="pill-btn" type="button" data-role-action="show-all">显示全部</button>' : ''}
            <button class="pill-btn" type="button" data-role-action="reload">刷新</button>
          </div>
        </div>
      `;
      notifyHeight();
      return;
    }

    const bt = getBatchType();
    const isBatch = bt === 'multi_prompt' || bt === 'storyboard';

    roleList.innerHTML = list
      .map((r) => {
        const username = String(r?.username || '').trim();
        const display = getRoleDisplayName(r);
        const full = String(r?.description || r?.bio || '').trim();
        const text = full ? full.replace(/\s+/g, ' ') : '暂无描述';
        const short = text.length > 88 ? text.slice(0, 88) + '…' : text;
        const avatar = String(r?.avatar_path || '').trim();
        const avatarSrc = avatar || DEFAULT_ROLE_AVATAR;
        const fav = username && roleFavs.has(username);
        const attached = username && isRoleAttachedInCurrentMode(username);

        const cameo = String(r?.cameo_id || '').trim();
        const cameoShort = cameo ? (cameo.length > 14 ? cameo.slice(0, 14) + '…' : cameo) : '';
        const charId = String(r?.character_id || '').trim();
        const charShort = charId ? (charId.length > 14 ? charId.slice(0, 14) + '…' : charId) : '';

        const roleData = {
          id: r?.id || null,
          display,
          username,
          avatar,
          desc: short,
          full: full || short,
          cameo_id: cameo,
          character_id: charId,
          created_at: r?.created_at || ''
        };
        const roleJson = encodeURIComponent(JSON.stringify(roleData));

        const chips = [
          cameo
            ? `<button class="role-chip" type="button" data-role-action="copy" data-copy="${escapeAttr(cameo)}" title="复制 cameo_id: ${escapeAttr(cameo)}">cameo: ${escapeHtml(cameoShort)}</button>`
            : '',
          charId
            ? `<button class="role-chip" type="button" data-role-action="copy" data-copy="${escapeAttr(charId)}" title="复制 character_id: ${escapeAttr(charId)}">char: ${escapeHtml(charShort)}</button>`
            : ''
        ].join('');

        return `
          <div class="role-card ${attached ? 'attached' : ''} ${fav ? 'fav' : ''}" draggable="true" data-role="${roleJson}" title="${escapeAttr(full || short || display)}">
            <button class="role-star ${fav ? 'fav' : ''}" type="button" data-role-action="fav" aria-label="${fav ? '取消收藏' : '收藏'}" title="${fav ? '取消收藏' : '收藏'}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
              </svg>
            </button>
            <img class="role-avatar" src="${escapeAttr(avatarSrc)}" alt="${escapeAttr(display)}" loading="lazy">
            <div class="role-meta">
              <div class="role-top">
                <div class="role-name">${escapeHtml(display)}</div>
                ${attached ? '<span class="role-badge attached" title="当前模式已挂载">已挂载</span>' : ''}
              </div>
              <div class="role-username">${username ? '@' + escapeHtml(username) : ''}</div>
              <div class="role-desc">${escapeHtml(short)}</div>
              ${chips ? `<div class="role-chips">${chips}</div>` : ''}
              <div class="role-actions">
                <button class="pill-btn role-attach ${attached ? 'active' : ''}" type="button" data-role-action="attach" title="${isBatch ? '挂载到本模式（可选全局/单行/单镜）' : attached ? '取消挂载' : '挂载到提示词下方'}">${isBatch ? '挂载' : attached ? '取消挂载' : '挂载'}</button>
                <button class="pill-btn role-copy" type="button" data-role-action="copy-username">复制 @username</button>
                <button class="pill-btn role-delete" type="button" data-role-action="delete" style="color:#ef4444;" title="删除角色卡">删除</button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    notifyHeight();
  };

  const parseRoleFromCard = (cardEl) => {
    try {
      const raw = cardEl?.getAttribute ? cardEl.getAttribute('data-role') : '';
      return raw ? JSON.parse(decodeURIComponent(raw)) : null;
    } catch (_) {
      return null;
    }
  };

  const loadRoles = async () => {
    renderRoleSkeleton(6);
    try {
      // 从localStorage读取角色卡列表
      const stored = localStorage.getItem('character_cards');
      const data = stored ? JSON.parse(stored) : [];
      roles = Array.isArray(data) ? data : [];
    } catch (e) {
      roles = [];
      log('角色卡加载失败');
    }
    renderRoles();
  };

  // baseUrl 输入时自动刷新角色卡：避免必须“失焦(change)”才生效的交互割裂
  // - input：防抖（避免每个字符都打一次请求）
  // - change：更快触发（粘贴/回车后立刻生效）
  let rolesAutoReloadTimer = null;
  let rolesAutoReloadLastBaseUrl = '';
  const scheduleLoadRoles = (opts = { force: false }) => {
    const force = !!(opts && opts.force);
    if (rolesAutoReloadTimer) clearTimeout(rolesAutoReloadTimer);
    rolesAutoReloadTimer = setTimeout(
      () => {
        rolesAutoReloadTimer = null;
        const baseUrl = getBaseUrl();
        // baseUrl 还没填完整时不要吵（避免输入过程中频繁 toast）
        if (!baseUrl || baseUrl.length < 8 || !/^https?:\/\//i.test(baseUrl)) return;
        if (!force && baseUrl === rolesAutoReloadLastBaseUrl) return;
        rolesAutoReloadLastBaseUrl = baseUrl;
        loadRoles();
      },
      force ? 80 : 800
    );
  };

  const initRoleUi = () => {
    loadRoleUiFromStorage();
    loadRoleFavsFromStorage();
    loadRoleUsedFromStorage();
    if (roleSearch) roleSearch.value = roleUi.query || '';
    syncRoleFilterButtons();
    syncRoleDenseButton();
    syncRoleClearButton();
    syncRoleSortSelect();
  };

  // 事件绑定
  rightTabButtons.forEach((btn) =>
    btn.addEventListener('click', () => setRightTab(btn.getAttribute('data-tab')))
  );
  if (previewFilterBar) {
    previewFilterBar.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-preview-filter]') : null;
      if (!btn) return;
      setPreviewFilter(btn.getAttribute('data-preview-filter') || 'all', { toast: false });
    });
  }
  // 预览：批量下载（当前过滤）
  let previewBatchDownloading = false;
  if (btnPreviewBatchDownload) {
    btnPreviewBatchDownload.addEventListener('click', async (e) => {
      if (previewBatchDownloading) return;

      // 只下载“当前过滤”可见结果：用户可先切换到“分镜/视频/图片”后再点
      const fullList = (Array.isArray(tasks) ? tasks : []).filter((t) => t && t.url && isValidMediaUrl(t.url));
      const filtered = fullList.filter((t) => taskMatchesPreviewFilter(t, previewFilter));
      // URL 去重：避免同一结果在 tasks 里出现多次导致重复下载
      const seen = new Set();
      const list = [];
      filtered.forEach((t) => {
        const u = String(t.url || '');
        if (!u || seen.has(u)) return;
        seen.add(u);
        list.push(t);
      });

      if (!list.length) {
        showToast('当前过滤条件下暂无可下载的结果', 'warn', { title: '批量下载' });
        return;
      }

      // 排序：分镜优先按镜号/份数排序，其它按任务 id 递增（下载后更整齐）
      const sorted = list.slice().sort((a, b) => {
        const sa = a && a.storyboard ? a.storyboard : null;
        const sb = b && b.storyboard ? b.storyboard : null;
        if (sa || sb) {
          const runA = sa ? parseInt(String(sa.run || '0'), 10) || 0 : 0;
          const runB = sb ? parseInt(String(sb.run || '0'), 10) || 0 : 0;
          if (runA !== runB) return runA - runB;
          const idxA = sa ? parseInt(String(sa.idx || '0'), 10) || 0 : 0;
          const idxB = sb ? parseInt(String(sb.idx || '0'), 10) || 0 : 0;
          if (idxA !== idxB) return idxA - idxB;
          const takeA = sa ? parseInt(String(sa.take || '0'), 10) || 0 : 0;
          const takeB = sb ? parseInt(String(sb.take || '0'), 10) || 0 : 0;
          if (takeA !== takeB) return takeA - takeB;
        }
        const idA = a && typeof a.id === 'number' ? a.id : 0;
        const idB = b && typeof b.id === 'number' ? b.id : 0;
        return idA - idB;
      });

      const n = sorted.length;
      const wantDirectMulti = !!(e && e.shiftKey); // Shift+Click => multi-files
      showToast(
        wantDirectMulti
          ? `将触发 ${n} 个下载（若浏览器提示“是否允许多文件下载”，请选择“允许”）。`
          : `将把 ${n} 个结果打包成 1 个 ZIP 并下载（更适配 IDM/拦截器，且文件名更友好）。`,
        'info',
        { title: wantDirectMulti ? '多文件下载' : '打包 ZIP', duration: n >= 12 ? 5200 : 4200 }
      );

      previewBatchDownloading = true;
      const oldText = btnPreviewBatchDownload.textContent || '批量下载';
      btnPreviewBatchDownload.setAttribute('data-loading', '1');
      btnPreviewBatchDownload.textContent = wantDirectMulti ? `下载中(${n})…` : `打包中(${n})…`;

      let okCount = 0;
      try {
        if (wantDirectMulti) {
          // 注意：不要 await/定时器拆分，否则容易被浏览器当作“非用户手势”拦截。
          // 这里一次性同步触发，首次会询问“允许多文件下载”。
          sorted.forEach((t, idx) => {
            const u = String(t.url || '');
            if (!u) return;
            const filename = buildDownloadFilename(t, u, t.type, idx + 1);
            const ok = triggerBrowserDownload(u, filename);
            if (ok) okCount += 1;
          });
        } else {
          // ZIP 打包：后端把 /tmp 文件打包成 zip，然后前端触发一次下载
          const items = sorted
            .map((t, idx) => {
              const u = String(t.url || '');
              return {
                url: normalizeTmpDownloadUrl(u),
                filename: buildDownloadFilename(t, u, t.type, idx + 1)
              };
            })
            .filter((x) => x && x.url && String(x.url).startsWith('/tmp/'));

          const skipped = n - items.length;
          if (!items.length) {
            throw new Error('当前结果没有可打包的 /tmp 本地缓存文件（请确认输出链接为 /tmp/...）');
          }

          const titleFromShot =
            sorted.find((t) => t && t.storyboard && t.storyboard.title)?.storyboard?.title || '';
          const titleFromInput =
            (storyboardTitle && storyboardTitle.value ? storyboardTitle.value.trim() : '') || '';
          const title =
            previewFilter === 'storyboard'
              ? titleFromInput || titleFromShot || `storyboard_${new Date().toISOString().slice(0, 10)}`
              : `preview_${previewFilterLabel(previewFilter)}`;

          const resp = await fetch('/api/download/batch-zip', {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, items })
          });
          const text = await resp.text();
          let data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (err) {
            throw new Error(`响应解析失败（可能被浏览器插件/拦截器改写）：${(err && err.message) || String(err)}`);
          }
          if (!resp.ok || !data || data.success !== true) {
            const detail = (data && (data.detail || data.message)) || text || `HTTP ${resp.status}`;
            throw new Error(typeof detail === 'string' ? detail : `HTTP ${resp.status}`);
          }

          const zipUrl = data.url ? String(data.url) : '';
          const zipName = data.filename ? String(data.filename) : '';
          if (!zipUrl) throw new Error('打包成功但缺少下载链接');

          const okDl = triggerBrowserDownload(zipUrl, zipName);
          okCount = okDl ? 1 : 0;

          showToast(
            `已打包 ${data.count || items.length} 个文件${skipped ? `（跳过 ${skipped} 个非本地链接）` : ''}。\n若未自动开始下载：点击此提示里的“下载ZIP”。`,
            'success',
            {
              title: '打包完成',
              duration: 7200,
              action: { text: '下载ZIP', onClick: () => triggerBrowserDownload(zipUrl, zipName) }
            }
          );
        }
      } catch (err) {
        showToast(`批量下载失败：${(err && err.message) || String(err)}`, 'error', {
          title: '批量下载失败',
          duration: 5200
        });
      } finally {
        btnPreviewBatchDownload.removeAttribute('data-loading');
        btnPreviewBatchDownload.setAttribute('data-done', '1');
        setTimeout(() => {
          try {
            btnPreviewBatchDownload.removeAttribute('data-done');
          } catch (_) {}
        }, 1200);
        btnPreviewBatchDownload.textContent = oldText;
        previewBatchDownloading = false;
      }

      if (wantDirectMulti) {
        showToast(
          `已触发 ${okCount}/${n} 个下载。\n若被拦截：请在浏览器提示中允许“多文件下载”。\n若使用 IDM 且无反应：建议直接点“批量下载”（打包ZIP）。`,
          okCount ? 'success' : 'warn',
          { title: '多文件下载', duration: n >= 10 ? 5200 : 4200 }
        );
      }
    });
  }
  if (btnOnlyRunning) {
    btnOnlyRunning.addEventListener('click', () => {
      onlyRunning = !onlyRunning;
      btnOnlyRunning.classList.toggle('active', onlyRunning);
      btnOnlyRunning.textContent = onlyRunning ? '仅运行中 ?' : '仅运行中';
      renderTasks();
    });
  }
  if (btnPreviewDense) {
    btnPreviewDense.addEventListener('click', () => {
      densePreview = !densePreview;
      try {
        localStorage.setItem(PREVIEW_DENSE_KEY, densePreview ? '1' : '0');
      } catch (_) {
        /* ignore */
      }
      if (previewGrid) previewGrid.classList.toggle('dense', densePreview);
      btnPreviewDense.classList.toggle('active', densePreview);
      btnPreviewDense.textContent = densePreview ? '预览密集 ✓' : '预览密集';
    });
    // 初始化同步（持久化）
    if (previewGrid) previewGrid.classList.toggle('dense', densePreview);
    btnPreviewDense.classList.toggle('active', densePreview);
    btnPreviewDense.textContent = densePreview ? '预览密集 ✓' : '预览密集';
  }
  if (btnLogBottom) {
    btnLogBottom.addEventListener('click', () => {
      out.scrollTop = out.scrollHeight;
    });
  }
  if (concurrencyDec && concurrencyInc) {
    const clampConcurrency = (v) => Math.max(1, Math.min(5, v));
    const syncConcurrency = () => {
      batchConcurrencyInput.value = clampConcurrency(parseInt(batchConcurrencyInput.value || '1', 10) || 1);
      saveForm();
    };
    concurrencyDec.addEventListener('click', () => {
      batchConcurrencyInput.value = clampConcurrency((parseInt(batchConcurrencyInput.value || '1', 10) || 1) - 1);
      syncConcurrency();
    });
    concurrencyInc.addEventListener('click', () => {
      batchConcurrencyInput.value = clampConcurrency((parseInt(batchConcurrencyInput.value || '1', 10) || 1) + 1);
      syncConcurrency();
    });
    batchConcurrencyInput.addEventListener('change', syncConcurrency);
  }

  // 预览弹窗（大图/大屏查看）
  if (previewModal) {
    previewModal.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.getAttribute && target.getAttribute('data-close') === '1') {
        closePreviewModal();
      }
    });
  }
  if (btnPreviewClose) {
    btnPreviewClose.addEventListener('click', closePreviewModal);
  }
  if (btnPreviewOpenNew) {
    btnPreviewOpenNew.addEventListener('click', () => {
      const u = previewModalState && previewModalState.url ? String(previewModalState.url) : '';
      if (!u) return;
      window.open(u, '_blank', 'noopener');
    });
  }
  if (btnPreviewCopyLink) {
    btnPreviewCopyLink.addEventListener('click', async (e) => {
      const u = previewModalState && previewModalState.url ? String(previewModalState.url) : '';
      const ok = await copyTextSafe(u);
      showBubble(ok ? '已复制链接' : '复制失败', e.currentTarget);
    });
  }
  if (btnPreviewCopyHtml) {
    btnPreviewCopyHtml.addEventListener('click', async (e) => {
      const u = previewModalState && previewModalState.url ? String(previewModalState.url) : '';
      const t = previewModalState && previewModalState.type ? String(previewModalState.type) : 'video';
      const html = buildEmbedHtml(u, t === 'image' ? 'image' : 'video');
      const ok = await copyTextSafe(html);
      showBubble(ok ? '已复制HTML' : '复制失败', e.currentTarget);
    });
  }
  if (btnPreviewLocateTask) {
    btnPreviewLocateTask.addEventListener('click', () => {
      const tid = previewModalState && previewModalState.taskId ? parseInt(String(previewModalState.taskId), 10) : 0;
      if (!tid) return;
      closePreviewModal();
      setRightTab('tasks');
      requestAnimationFrame(() => {
        const el = taskList?.querySelector(`.task-card[data-id="${tid}"]`);
        if (!el) return;
        el.classList.add('spotlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.classList.remove('spotlight'), 1300);
      });
    });
  }

  // 分镜审查兜底：修改分镜提示词弹窗
  if (editStoryboardModal) {
    editStoryboardModal.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.getAttribute && target.getAttribute('data-close') === '1') {
        closeEditStoryboardModal();
      }
    });
  }
  if (btnEditStoryboardCancel) {
    btnEditStoryboardCancel.addEventListener('click', closeEditStoryboardModal);
  }
  if (btnEditStoryboardRetry) {
    btnEditStoryboardRetry.addEventListener('click', submitEditStoryboardModal);
  }

  // 来自管理页（任务球/抽屉）的控制：定位任务、打开预览
  window.addEventListener('message', (event) => {
    try {
      if (event && event.origin && event.origin !== window.location.origin) return;
      const d = event && event.data ? event.data : {};
      if (!d || typeof d !== 'object') return;

      if (d.type === 'focus_task') {
        const id = parseInt(String(d.id || '0'), 10) || 0;
        if (!id) return;
        setRightTab('tasks');
        requestAnimationFrame(() => {
          const el = taskList?.querySelector(`.task-card[data-id="${id}"]`);
          if (!el) return;
          el.classList.add('spotlight');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => el.classList.remove('spotlight'), 1300);
        });
        return;
      }

      if (d.type === 'open_preview') {
        const url = d.url ? String(d.url) : '';
        if (!url) return;
        const tid = parseInt(String(d.taskId || '0'), 10) || null;
        const mediaType =
          d.mediaType === 'image' || d.mediaType === 'video'
            ? d.mediaType
            : /\.(png|jpg|jpeg|webp)(?:\?|#|$)/i.test(url)
              ? 'image'
              : 'video';
        // Use our modal so the user stays in one flow.
        openPreviewModal(url, mediaType, tid);
        return;
      }
    } catch (_) {
      /* ignore */
    }
  });
  // 快捷键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (editStoryboardModal && editStoryboardModal.classList.contains('open')) {
        e.preventDefault();
        closeEditStoryboardModal();
        return;
      }
      if (previewModal && previewModal.classList.contains('open')) {
        e.preventDefault();
        closePreviewModal();
        return;
      }
    }
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (editStoryboardModal && editStoryboardModal.classList.contains('open')) {
        submitEditStoryboardModal();
        return;
      }
      handleSend();
    }
    if (e.altKey && !e.shiftKey) {
      if (e.key === '1') setRightTab('tasks');
      if (e.key === '2') setRightTab('preview');
      if (e.key === '3') setRightTab('log');
    }
  });

  // 清空“输出/任务”统一入口：避免只清 DOM 导致 tasks 与 UI 脱钩（红点/预览会反复异常）
  const clearAllOutputs = (opts = { toast: true }) => {
    // 如果正在预览，先关闭，避免“清空后仍显示旧视频”的错觉
    try {
      if (previewModal && previewModal.classList.contains('open')) closePreviewModal();
      if (editStoryboardModal && editStoryboardModal.classList.contains('open')) closeEditStoryboardModal();
    } catch (_) {
      /* ignore */
    }
    // 1) 清理任务数组
    tasks = [];
    unread.tasks = false;
    // 2) 清理预览未读集合
    previewSeenTaskIds = new Set();
    try {
      localStorage.removeItem(PREVIEW_SEEN_KEY);
    } catch (_) {
      /* ignore */
    }
    // 3) 清理预览去重集合/日志缓存，释放内存
    try {
      previewKnown.clear();
    } catch (_) {
      /* ignore */
    }
    taskLogBuffer = {};
    currentLogTaskId = null;
    logVersion = 0;
    logSeenVersion = 0;
    out.textContent = '';

    // 4) 清理“完成后自动折叠”的定时器，避免清空后还在后台改 tasks
    try {
      collapseTimers.forEach((timer) => clearTimeout(timer));
      collapseTimers.clear();
    } catch (_) {
      /* ignore */
    }

    scheduleRender({ tasks: true, previews: true });
    schedulePersistTasks({ immediate: true });
    if (opts && opts.toast) showToast('已清空输出（任务/预览/日志）', 'success');
  };

  btnSend.addEventListener('click', handleSend);
  btnClear.addEventListener('click', () => {
    clearAllOutputs();
  });
  btnClearDone.addEventListener('click', () => {
    tasks = tasks.filter((t) => t.status !== 'error');
    prunePreviewSeenTaskIds();
    persistPreviewSeenTaskIds();
    scheduleRender({ tasks: true, previews: true });
    schedulePersistTasks({ immediate: true });
    showToast('已清理失败任务', 'success');
  });
  btnClearAll.addEventListener('click', () => {
    clearAllOutputs({ toast: false });
  });
  if (btnCopyLog) {
    btnCopyLog.addEventListener('click', async (e) => {
      const ok = await copyTextSafe(out.textContent || '');
      showBubble(ok ? '已复制日志' : '复制失败', e.currentTarget);
      if (ok) {
        logSeenVersion = logVersion;
        updateUnreadDots();
      }
    });
  }
  if (btnCopyTaskLog) {
    btnCopyTaskLog.addEventListener('click', async (e) => {
      const t =
        currentLogTaskId !== null ? tasks.find((x) => x.id === currentLogTaskId) : tasks.length ? tasks[0] : null;
      const content = t ? getTaskLogText(t) : '';
      const ok = await copyTextSafe(content);
      showBubble(ok ? '已复制该任务日志' : '复制失败', e.currentTarget);
    });
  }

  // 角色卡 UI（搜索/过滤/排序/密集）
  if (roleSearch) {
    roleSearch.addEventListener('input', () => {
      roleUi.query = roleSearch.value || '';
      saveRoleUiToStorage();
      syncRoleClearButton();
      renderRoles();
    });
    roleSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        roleSearch.value = '';
        roleUi.query = '';
        saveRoleUiToStorage();
        syncRoleClearButton();
        renderRoles();
        roleSearch.blur();
      }
    });
  }
  if (roleSearchClear && roleSearch) {
    roleSearchClear.addEventListener('click', () => {
      roleSearch.value = '';
      roleUi.query = '';
      saveRoleUiToStorage();
      syncRoleClearButton();
      renderRoles();
      roleSearch.focus();
    });
  }
  if (roleFilterBar) {
    roleFilterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-role-filter]');
      if (!btn) return;
      roleUi.filter = btn.getAttribute('data-role-filter') || 'all';
      saveRoleUiToStorage();
      syncRoleFilterButtons();
      renderRoles();
    });
  }
  if (roleSort) {
    roleSort.addEventListener('change', () => {
      roleUi.sort = roleSort.value || 'smart';
      saveRoleUiToStorage();
      renderRoles();
    });
  }
  if (btnRoleDense) {
    btnRoleDense.addEventListener('click', () => {
      roleUi.dense = !roleUi.dense;
      saveRoleUiToStorage();
      syncRoleDenseButton();
      renderRoles();
    });
  }
  if (btnReloadRoles) btnReloadRoles.addEventListener('click', loadRoles);

  // 角色卡列表：事件委托（避免每次 renderRoles 都重新绑监听）
  if (roleList) {
    roleList.addEventListener(
      'error',
      (e) => {
        const t = e.target;
        if (t && t.classList && t.classList.contains('role-avatar')) {
          t.src = DEFAULT_ROLE_AVATAR;
        }
      },
      true
    );

    roleList.addEventListener('dragstart', (e) => {
      const card = e.target.closest ? e.target.closest('.role-card') : null;
      if (!card) return;
      const data = parseRoleFromCard(card);
      if (!data) return;
      e.dataTransfer.setData('text/plain', JSON.stringify(data));
    });

    roleList.addEventListener('click', async (e) => {
      const actionBtn = e.target.closest ? e.target.closest('[data-role-action]') : null;
      if (!actionBtn) return;
      const action = actionBtn.getAttribute('data-role-action') || '';

      if (action === 'reload') {
        loadRoles();
        return;
      }
      if (action === 'clear-search') {
        if (roleSearch) {
          roleSearch.value = '';
          roleUi.query = '';
          saveRoleUiToStorage();
          syncRoleClearButton();
          renderRoles();
          roleSearch.focus();
        }
        return;
      }
      if (action === 'show-all') {
        roleUi.filter = 'all';
        saveRoleUiToStorage();
        syncRoleFilterButtons();
        renderRoles();
        return;
      }

      const card = e.target.closest ? e.target.closest('.role-card') : null;
      const data = card ? parseRoleFromCard(card) : null;
      if (!data) return;

      if (action === 'attach') {
        markRoleUsed(data.username || '');
        const roleObj = { display: data.display || data.username || '', username: data.username || '', avatar: data.avatar || '' };
        const bt = getBatchType();
        // 单次/同提示：按钮可直接“取消挂载”，避免只能逐个点 chip 关闭
        if (bt !== 'multi_prompt' && bt !== 'storyboard') {
          const u = String(roleObj.username || '').trim();
          if (u && isRoleAttachedMain(u)) {
            attachedRoles = attachedRoles.filter((r) => String(r?.username || '').trim() !== u);
            renderAttachedRoles();
            persistRoles();
            renderRoles();
            showBubble('已取消挂载', actionBtn);
            return;
          }
        }
        handleRoleAttach(roleObj, e);
        // 单次模式会立刻 addAttachedRole()，那边会 renderRoles；批量模式由菜单回调触发 renderRoles
        return;
      }
      if (action === 'copy-username') {
        const ok = await copyTextSafe(`@${data.username || data.display}`);
        showBubble(ok ? '已复制 @username' : '复制失败', actionBtn);
        return;
      }
      if (action === 'copy') {
        const v = actionBtn.getAttribute('data-copy') || '';
        if (!v) return;
        const ok = await copyTextSafe(v);
        showBubble(ok ? '已复制' : '复制失败', actionBtn);
        return;
      }
      if (action === 'fav') {
        const u = String(data.username || '').trim();
        if (!u) {
          showBubble('缺少 username，无法收藏', actionBtn);
          return;
        }
        if (roleFavs.has(u)) {
          roleFavs.delete(u);
          showBubble('已取消收藏', actionBtn);
        } else {
          roleFavs.add(u);
          showBubble('已收藏', actionBtn);
        }
        saveRoleFavsToStorage();
        renderRoles();
        return;
      }
      if (action === 'delete') {
        const u = String(data.username || '').trim();
        const displayName = data.display || u || '此角色';

        // 二次确认
        if (!confirm(`确定要删除角色卡 "${displayName}" 吗？\n\n删除后将无法恢复。`)) {
          return;
        }

        try {
          // 从localStorage删除
          const stored = localStorage.getItem('character_cards');
          const cards = stored ? JSON.parse(stored) : [];
          const filtered = cards.filter(c => c.username !== u);
          localStorage.setItem('character_cards', JSON.stringify(filtered));

          // 刷新显示
          loadRoles();
          showToast('角色卡已删除', 'success');
        } catch (e) {
          console.error('删除角色卡失败:', e);
          showToast('删除失败', 'error');
        }
        return;
      }
    });
  }

  $('apiKey').addEventListener('input', () => {
    saveForm();
    syncSingleSamePlanUI();
    // 分镜/多提示使用的是 btnSend：这里也要同步按钮状态，避免“填了 key 但按钮仍灰”的错觉
    scheduleBatchEditorPlanUI();
  });
  $('baseUrl').addEventListener('input', () => {
    saveForm();
    scheduleLoadRoles({ force: false });
  });
  $('model').addEventListener('change', () => {
    saveForm();
    renderFilePreview();
  });
  if (btnUseRecommendedModel) {
    btnUseRecommendedModel.addEventListener('click', () => {
      if (!currentRecommendedModel) {
        showToast('暂无可用的推荐模型', 'warn');
        return;
      }
      $('model').value = currentRecommendedModel;
      saveForm();
      renderFilePreview();
      showToast('已切换到推荐模型', 'success');
    });
  }
  promptBox.addEventListener('input', saveForm);
  promptBox.addEventListener('input', scheduleDraftSave);
  $('baseUrl').addEventListener('change', () => {
    saveForm();
    scheduleLoadRoles({ force: true });
  });
  if (batchPromptList) batchPromptList.addEventListener('input', saveForm);
  if (batchConcurrencyInput)
    batchConcurrencyInput.addEventListener('change', () => {
      const bt = getBatchType();
      const fallback = bt === 'storyboard' ? 1 : 2;
      const val = normalizeTimes(batchConcurrencyInput.value, fallback);
      batchConcurrencyInput.value = String(val);
      saveForm();
      syncGlobalCountHighlight();
      syncSingleSamePlanUI();
      // 多提示/分镜的“开始生成（N）”依赖默认份数：这里也要同步，避免按钮文案/禁用状态滞后
      scheduleBatchEditorPlanUI();
    });
  if (btnApplyGlobalCountToAll)
    btnApplyGlobalCountToAll.addEventListener('click', () => {
      const bt = getBatchType();
      if (bt !== 'multi_prompt' && bt !== 'storyboard') return;
      const fallback = bt === 'storyboard' ? 1 : 2;
      const val = normalizeTimes(batchConcurrencyInput?.value || String(fallback), fallback);
      batchConcurrencyInput.value = String(val);
      if (bt === 'multi_prompt') {
        multiPrompts = multiPrompts.map((p) => ({ ...p, count: val }));
        renderMultiPrompts();
      } else {
        storyboardShots = storyboardShots.map((s) => ({ ...s, count: val }));
        renderStoryboardShots();
      }
      saveForm();
      syncGlobalCountHighlight();
      scheduleBatchEditorPlanUI();
      showToast('已套用到全部', 'success');
    });
  batchModeBar.querySelectorAll('input[name="batchType"]').forEach((r) =>
    r.addEventListener('change', () => setBatchType(r.value))
  );
  // 模式条：窗口缩放/折叠展开会导致布局变化，需要重算“滑动高亮”位置
  window.addEventListener('resize', scheduleBatchModeIndicator);
  if (btnAddPrompt)
    btnAddPrompt.addEventListener('click', () => {
      const bt = getBatchType();
      if (bt === 'storyboard') {
        addStoryboardShot('', normalizeTimes(batchConcurrencyInput?.value || '1', 1));
      } else {
        addMultiPrompt('', normalizeTimes(batchConcurrencyInput?.value || '2', 2));
      }
    });
  if (storyboardTitle) storyboardTitle.addEventListener('input', saveForm);
  if (storyboardContext) storyboardContext.addEventListener('input', saveForm);
  if (storyboardSequential) storyboardSequential.addEventListener('change', saveForm);
  if (btnMultiClearRoles)
    btnMultiClearRoles.addEventListener('click', () => {
      attachedRolesMulti = [];
      renderMultiAttachedRoles();
      persistRolesMulti();
      renderRoles();
      showToast('已清空多提示全局角色', 'success');
    });
  if (btnClearMainRoles)
    btnClearMainRoles.addEventListener('click', () => {
      attachedRoles = [];
      renderAttachedRoles();
      persistRoles();
      renderRoles();
      showToast('已清空提示词下方的角色挂载', 'success');
    });
  if (btnStoryboardClearRoles)
    btnStoryboardClearRoles.addEventListener('click', () => {
      attachedRolesStoryboard = [];
      renderStoryboardAttachedRoles();
      persistRolesStoryboard();
      renderRoles();
      showToast('已清空分镜全局角色', 'success');
    });
  if (btnStoryboardScopeRoles)
    btnStoryboardScopeRoles.addEventListener('click', (e) => {
      e.preventDefault();
      showStoryboardGlobalScopeMenu(e.currentTarget || btnStoryboardScopeRoles);
    });
  if (storyboardShotCount) {
    storyboardShotCount.addEventListener('input', () => {
      storyboardShotCount.setAttribute('data-dirty', '1');
      saveForm();
    });
    storyboardShotCount.addEventListener('change', saveForm);
    storyboardShotCount.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setStoryboardShotCount(storyboardShotCount?.value || '8', { confirmShrink: true });
      }
    });
  }
  if (btnApplyStoryboardCount)
    btnApplyStoryboardCount.addEventListener('click', () => {
      setStoryboardShotCount(storyboardShotCount?.value || '8', { confirmShrink: true });
    });
  if (btnStoryboardFromPrompt)
    btnStoryboardFromPrompt.addEventListener('click', () => {
      const raw = (promptBox.value || '').split('\n').map((l) => l.trim()).filter(Boolean);
      if (!raw.length) {
        showToast('主提示为空：无法导入分镜', 'warn');
        return;
      }
      const hasContent = storyboardShots.some(
        (s) => (s.text || '').trim() || (Array.isArray(s.roles) && s.roles.length) || s.fileDataUrl
      );
      if (hasContent) captureStoryboardUndo('主提示按行导入覆盖');
      setBatchType('storyboard');
      const defaultCount = normalizeTimes(batchConcurrencyInput?.value || '1', 1);
      storyboardShots = raw.map((t) => ({
        text: t,
        count: defaultCount,
        fileDataUrl: null,
        fileName: '',
        roles: [],
        useGlobalRoles: true
      }));
      if (storyboardShotCount) {
        storyboardShotCount.value = String(storyboardShots.length);
        storyboardShotCount.removeAttribute('data-dirty');
      }
      renderStoryboardShots();
      saveForm();
      showToast(`已导入 ${storyboardShots.length} 条分镜${hasContent ? '（已覆盖原内容，可撤销）' : ''}`, 'success', {
        title: '分镜已导入',
        duration: hasContent ? 5200 : 2400,
        action: hasContent ? { text: '撤销', onClick: () => undoStoryboardOnce() } : null
      });
    });
  if (btnStoryboardClear)
    btnStoryboardClear.addEventListener('click', () => {
      const n = storyboardShots.length || parseInt(storyboardShotCount?.value || '8', 10) || 8;
      const hasContent = storyboardShots.some((s) => (s.text || '').trim() || (Array.isArray(s.roles) && s.roles.length) || s.fileDataUrl);
      if (!hasContent) {
        // 没内容也照样铺好输入框，保持“可立即写”
        storyboardShots = [];
        appendStoryboardShots(Math.max(1, n), { text: '', count: normalizeTimes(batchConcurrencyInput?.value || '1', 1) });
        showToast('已重置分镜为空白', 'success');
        return;
      }
      captureStoryboardUndo('清空分镜');
      const defaultCount = normalizeTimes(batchConcurrencyInput?.value || '1', 1);
      const prev = storyboardShots;
      storyboardShots = Array.from({ length: Math.max(1, n) }).map((_, i) => ({
        text: '',
        count: defaultCount,
        fileDataUrl: null,
        fileName: '',
        roles: [],
        useGlobalRoles: prev && prev[i] && prev[i].useGlobalRoles === false ? false : true
      }));
      renderStoryboardShots();
      saveForm();
      showToast('分镜已清空（可撤销）', 'success', {
        title: '分镜已清空',
        duration: 5200,
        action: { text: '撤销', onClick: () => undoStoryboardOnce() }
      });
    });
  if (btnSendPrimary) btnSendPrimary.addEventListener('click', handleSend);
  if (btnClearPrimary) btnClearPrimary.addEventListener('click', () => {
    clearAllOutputs();
  });
  btnExportBatch.addEventListener('click', () => {
    const bt = getBatchType();
    let payload = null;
    let filename = 'batch_prompts.json';

    const pickRoleFields = (r) => ({
      display: r?.display || r?.display_name || r?.username || '',
      username: r?.username || '',
      avatar: r?.avatar || r?.avatar_path || ''
    });

    if (bt === 'storyboard') {
      payload = {
        kind: 'storyboard',
        version: 2,
        title: (storyboardTitle && storyboardTitle.value ? storyboardTitle.value.trim() : '') || '',
        context: (storyboardContext && storyboardContext.value ? storyboardContext.value.trim() : '') || '',
        global_roles: (Array.isArray(attachedRolesStoryboard) ? attachedRolesStoryboard : []).map(pickRoleFields),
        shots: storyboardShots.map((s) => ({
          prompt: s.text || '',
          count: normalizeTimes(s.count, 1),
          use_global_roles: s && s.useGlobalRoles === false ? false : true,
          roles: Array.isArray(s.roles) ? s.roles.map(pickRoleFields) : []
        }))
      };
      filename = 'storyboard.json';
    } else {
      // 多提示模板（对象格式）：包含“全局角色”，同时兼容旧 array 导入
      const rows = (Array.isArray(multiPrompts) ? multiPrompts : [])
        .map((p, idx) => ({
          prompt: (p?.text || '').trim(),
          count: normalizeTimes(p?.count, 2),
          roles: Array.isArray(multiPromptRoles[idx]) ? multiPromptRoles[idx].map(pickRoleFields) : []
        }))
        .filter((x) => x.prompt || (Array.isArray(x.roles) && x.roles.length));
      if (!rows.length) {
        showToast('暂无可导出的批量内容', 'warn');
        return;
      }
      payload = {
        kind: 'multi_prompt',
        version: 2,
        global_roles: (Array.isArray(attachedRolesMulti) ? attachedRolesMulti : []).map(pickRoleFields),
        rows
      };
      filename = 'multi_prompt.json';
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
  btnImportBatch.addEventListener('click', () => importBatchFile.click());
  importBatchFile.addEventListener('change', async () => {
    if (!importBatchFile.files || !importBatchFile.files.length) return;
    const file = importBatchFile.files[0];
    const text = await file.text();
    try {
      const data = JSON.parse(text);

      // 分镜模板（对象）
      if (data && typeof data === 'object' && data.kind === 'storyboard' && Array.isArray(data.shots)) {
        if (storyboardTitle) storyboardTitle.value = (data.title || '').trim();
        if (storyboardContext) storyboardContext.value = (data.context || '').trim();
        if (storyboardSequential) storyboardSequential.checked = data.sequential !== false;
        if (Array.isArray(data.global_roles)) {
          attachedRolesStoryboard = data.global_roles
            .map((r) => ({
              display: r.display || r.display_name || r.username || '',
              username: r.username || '',
              avatar: r.avatar || r.avatar_path || ''
            }))
            .filter((r) => r.display || r.username);
          persistRolesStoryboard();
          renderStoryboardAttachedRoles();
        }
        storyboardShots = data.shots
          .map((x) => ({
            text: (x.prompt || x.text || '').trim(),
            count: normalizeTimes(x.count, 1),
            fileDataUrl: null,
            fileName: '',
            useGlobalRoles: x && (x.useGlobalRoles === false || x.use_global_roles === false) ? false : true,
            roles: Array.isArray(x.roles)
              ? x.roles
                  .map((r) => ({
                    display: r.display || r.display_name || r.username || '',
                    username: r.username || '',
                    avatar: r.avatar || r.avatar_path || ''
                  }))
                  .filter((r) => r.display || r.username)
              : []
          }));
        if (!storyboardShots.length) {
          storyboardShots = [
            { text: '', count: normalizeTimes(batchConcurrencyInput?.value || '1', 1), fileDataUrl: null, fileName: '', roles: [], useGlobalRoles: true }
          ];
        }
        renderStoryboardShots();
        setBatchType('storyboard');
        saveForm();
        importBatchFile.value = '';
        showToast('已导入分镜模板', 'success');
        return;
      }

      // 多提示模板（对象）
      if (data && typeof data === 'object' && data.kind === 'multi_prompt' && Array.isArray(data.rows)) {
        if (Array.isArray(data.global_roles)) {
          attachedRolesMulti = data.global_roles
            .map((r) => ({
              display: r.display || r.display_name || r.username || '',
              username: r.username || '',
              avatar: r.avatar || r.avatar_path || ''
            }))
            .filter((r) => r.display || r.username);
          persistRolesMulti();
          renderMultiAttachedRoles();
        }
        multiPrompts = data.rows
          .map((x) => ({
            text: (x.prompt || x.text || '').trim(),
            count: normalizeTimes(x.count, 2),
            fileDataUrl: null,
            fileName: ''
          }))
          .filter((x) => x.text);

        // 同步行角色（可选）
        Object.keys(multiPromptRoles).forEach((k) => delete multiPromptRoles[k]);
        data.rows.forEach((x, idx) => {
          if (Array.isArray(x.roles) && x.roles.length) {
            multiPromptRoles[idx] = x.roles
              .map((r) => ({
                display: r.display || r.display_name || r.username || '',
                username: r.username || '',
                avatar: r.avatar || r.avatar_path || ''
              }))
              .filter((r) => r.display || r.username);
          }
        });

        renderMultiPrompts();
        setBatchType('multi_prompt');
        saveForm();
        importBatchFile.value = '';
        showToast('已导入多提示模板', 'success');
        return;
      }

      // 多提示模板：兼容 array 旧格式
      if (Array.isArray(data)) {
        multiPrompts = data
          .map((x) => ({
            text: (x.prompt || x.text || '').trim(),
            count: normalizeTimes(x.count, 2)
          }))
          .filter((x) => x.text);

        // 同步行角色（可选）
        Object.keys(multiPromptRoles).forEach((k) => delete multiPromptRoles[k]);
        data.forEach((x, idx) => {
          if (Array.isArray(x.roles) && x.roles.length) {
            multiPromptRoles[idx] = x.roles
              .map((r) => ({
                display: r.display || r.display_name || r.username || '',
                username: r.username || '',
                avatar: r.avatar || r.avatar_path || ''
              }))
              .filter((r) => r.display || r.username);
          }
        });

        renderMultiPrompts();
        setBatchType('multi_prompt');
        saveForm();
        importBatchFile.value = '';
        showToast('已导入批量模板', 'success');
        return;
      }

      showToast('导入失败：不支持的模板格式', 'error');
    } catch (_) {
      showToast('导入失败：格式错误');
    }
    importBatchFile.value = '';
  });

  // 初始化
  setAdvancedOpen(advancedOpen);
  initRoleUi();
  loadForm();
  scheduleBatchModeIndicator();
  loadTasksFromStorage();
  loadPreviewSeenTaskIds();
  syncPreviewFilterButtons();
  loadRolesFromStorage();
  analyzePromptHints();
  renderFilePreview();
  syncMainUploadUI({ quiet: true });
  renderAttachedRoles();
  renderMultiAttachedRoles();
  renderStoryboardAttachedRoles();
  renderTasks();
  renderPreviews();
  setRightTab(currentRightTab); // 应用持久化 tab
  loadRoles();
})();
