/**
 * 库街区凭证抓取脚本 — Surge http-request
 *
 * 挂在 api.kurobbs.com 的请求上，把 App 发出的请求头里的凭证
 * （token / devCode / distinct_id / Cookie / 常用头）自动存进 Surge，
 * 供 kuro-signin.js 签到时读取。
 *
 * 配置示例（Surge [Script]）：
 * kuro.capture = type=http-request,pattern=^https://api\.kurobbs\.com/,script-path=kuro-capture.js,argument=主号
 *
 * 需要先开启 MITM：
 * [MITM]
 * hostname = api.kurobbs.com
 *
 * 账号别名：优先用 argument 指定的名字；没指定时从 token 派生一个稳定短标识
 * （如 库街区_A1B2），同一账号始终是同一个名字，不同账号互不混淆。
 * 每次真正写入凭证都会发 Surge 通知（同账号 30 秒内节流，避免刷屏）。
 */

const STORE_KEY = 'kuro_capture_store';

// 从请求头里找字段（大小写不敏感；也支持 full-header-mode 的数组形式）
function getHeader(headers, name) {
  if (!headers) return '';
  const lower = name.toLowerCase();
  if (Array.isArray(headers)) {
    for (let i = 0; i < headers.length; i++) {
      const item = headers[i];
      if (item && String(item.field || '').toLowerCase() === lower) {
        return String(item.value || '');
      }
    }
    return '';
  }
  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === lower) return String(headers[keys[i]] || '');
  }
  return '';
}

// Cookie 里取某个 key
function cookieValue(cookie, key) {
  if (!cookie) return '';
  const parts = cookie.split(';');
  for (let i = 0; i < parts.length; i++) {
    const kv = parts[i].trim();
    const eq = kv.indexOf('=');
    if (eq > 0 && kv.slice(0, eq).trim() === key) {
      return kv.slice(eq + 1).trim();
    }
  }
  return '';
}

function loadStore() {
  const raw = $persistentStore.read(STORE_KEY);
  let store = null;
  try {
    store = raw ? JSON.parse(raw) : null;
  } catch (e) {
    store = null;
  }
  if (!store || typeof store !== 'object') store = { accounts: {} };
  if (!store.accounts || typeof store.accounts !== 'object') store.accounts = {};
  return store;
}

function saveStore(store) {
  return $persistentStore.write(JSON.stringify(store), STORE_KEY);
}

function pickCredential(headers) {
  const cookie = getHeader(headers, 'Cookie') || getHeader(headers, 'cookie');
  const token =
    getHeader(headers, 'token') ||
    cookieValue(cookie, 'user_token') ||
    cookieValue(cookie, 'token') ||
    '';
  const devCode =
    getHeader(headers, 'devCode') ||
    getHeader(headers, 'devcode') ||
    cookieValue(cookie, 'devCode') ||
    '';
  const distinctId =
    getHeader(headers, 'distinct_id') ||
    getHeader(headers, 'distinctId') ||
    cookieValue(cookie, 'distinct_id') ||
    '';
  return { token: token, devCode: devCode, distinctId: distinctId, cookie: cookie };
}

// 简单稳定哈希（JSC 引擎无 crypto，自己实现一个）
function shortHash(str) {
  let h = 5381;
  const text = String(str || '');
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) >>> 0; // h * 33 + c
  }
  return h.toString(16).toUpperCase().slice(-6).padStart(6, '0');
}

// 从 token 派生稳定账号标识
function aliasFromToken(token) {
  return '库街区_' + shortHash(token).slice(0, 4);
}

function getAlias(token) {
  // 显式指定的别名优先；否则从 token 派生一个稳定标识
  try {
    const arg = typeof $argument === 'string' ? $argument.trim() : '';
    if (arg && arg !== 'true' && arg !== 'false' && arg !== 'on' && arg !== 'off') {
      if (arg.charAt(0) !== '{' && arg.charAt(0) !== '[') return arg;
      const parsed = JSON.parse(arg);
      const first = Array.isArray(parsed) ? parsed[0] : parsed;
      if (first && typeof first === 'object') {
        const name = first.name || first.alias || first.id;
        if (name) return String(name);
      }
    }
  } catch (e) {
    console.log('[KuroCapture] 别名解析回退: ' + e.message);
  }
  return aliasFromToken(token);
}

// token 变了但别名没变时，按 token 匹配已有账号，自动更新它的凭证
function resolveAlias(alias, token, store) {
  const accounts = store.accounts;
  if (alias && accounts[alias]) return alias;
  if (!token) return alias || 'unknown';

  const keys = Object.keys(accounts);
  for (let i = 0; i < keys.length; i++) {
    if (accounts[keys[i]] && accounts[keys[i]].token === token) return keys[i];
  }
  return alias || 'unknown';
}

// token 脱敏，只在通知里显示前后各几位
function maskToken(token) {
  const t = String(token || '');
  if (t.length <= 8) return '****';
  return t.slice(0, 4) + '…' + t.slice(-4);
}

// 参数 false/off/0 表示禁用抓取
function isDisabled() {
  const a = typeof $argument === 'string' ? $argument.trim().toLowerCase() : '';
  return a === 'false' || a === 'off' || a === '0';
}

function main() {
  if (isDisabled()) {
    $done({});
    return;
  }
  const headers = $request.headers;
  const cred = pickCredential(headers);

  if (!cred.token) {
    // 没有凭证的请求（比如公共接口）直接放行，不写存储
    console.log('[KuroCapture] 请求未携带 token，跳过');
    $done({});
    return;
  }

  const store = loadStore();
  const alias = resolveAlias(getAlias(cred.token), cred.token, store);
  const prev = store.accounts[alias] || {};
  const tokenChanged = !!prev.token && prev.token !== cred.token;

  const entry = prev;
  entry.token = cred.token;
  if (cred.devCode) entry.devCode = cred.devCode;
  if (cred.distinctId) entry.distinctId = cred.distinctId;
  if (cred.cookie) entry.cookie = cred.cookie;

  // 保存一些有用的原样请求头，签到脚本会复用
  const useful = [
    'source', 'lang', 'version', 'versioncode', 'channel', 'channelId',
    'model', 'osVersion', 'osversion', 'countrycode', 'User-Agent', 'user-agent'
  ];
  const extras = entry.extras || {};
  useful.forEach(function (name) {
    const value = getHeader(headers, name);
    if (value) extras[name] = value;
  });
  // 去掉仅大小写不同的重复键（如 User-Agent / user-agent）
  const seen = {};
  Object.keys(extras).forEach(function (k) {
    const lower = k.toLowerCase();
    if (seen[lower]) delete extras[k];
    else seen[lower] = true;
  });
  entry.extras = extras;

  entry.updatedAt = new Date().toISOString();
  entry.url = $request.url;
  store.accounts[alias] = entry;

  if (saveStore(store)) {
    console.log('[KuroCapture] 已保存账号 ' + alias + ' 的凭证');
    // 每次真正写入都通知，但同一账号 30 秒内节流，避免 App 连续请求刷屏
    const now = Date.now();
    const lastNotify = Number(entry.lastNotifyAt || 0);
    if (now - lastNotify > 30000) {
      entry.lastNotifyAt = now;
      saveStore(store); // 把通知时间也持久化
      $notification.post(
        '库街区凭证已抓取',
        '账号：' + alias + (tokenChanged ? '（已更新）' : ''),
        'token ' + maskToken(cred.token) + ' 已保存，签到脚本可以直接使用了'
      );
    }
  } else {
    console.log('[KuroCapture] 写入存储失败');
  }

  // 原样放行请求，不影响 App 正常使用
  $done({});
}

try {
  main();
} catch (e) {
  console.log('[KuroCapture] 异常: ' + (e && e.stack ? e.stack : String(e)));
  $done({});
}
