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
 * argument 是账号别名（可选，默认 default）。同一别名再次抓取会覆盖旧凭证；
 * 若 token 变了但别名没变，脚本自动按 token 匹配并更新对应账号，避免过期后还要改配置。
 */

const STORE_KEY = 'kuro_capture_store';
const DEFAULT_ALIAS = 'default';

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

// argument 可以是别名字符串，也可以是签到脚本用的 JSON（取其中的 name/alias）
function parseAliasArg(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return '';
  const text = raw.trim();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return text; // 普通字符串，直接当别名
  }
  if (Array.isArray(parsed)) parsed = parsed[0];
  if (parsed && typeof parsed === 'object') {
    return String(parsed.name || parsed.alias || parsed.id || '').trim();
  }
  return String(parsed || '').trim();
}

function getAlias() {
  return parseAliasArg($argument) || DEFAULT_ALIAS;
}

// token 变了但别名没变时，按 token 匹配已有账号，自动更新它的凭证
function resolveAlias(alias, token, store) {
  const accounts = store.accounts;
  if (alias && accounts[alias]) return alias;
  if (!token) return alias || DEFAULT_ALIAS;

  const keys = Object.keys(accounts);
  for (let i = 0; i < keys.length; i++) {
    if (accounts[keys[i]] && accounts[keys[i]].token === token) return keys[i];
  }
  return alias || DEFAULT_ALIAS;
}

// token 脱敏，只在通知里显示前后各几位
function maskToken(token) {
  const t = String(token || '');
  if (t.length <= 8) return '****';
  return t.slice(0, 4) + '…' + t.slice(-4);
}

function main() {
  const headers = $request.headers;
  const cred = pickCredential(headers);

  if (!cred.token) {
    // 没有凭证的请求（比如公共接口）直接放行，不写存储
    console.log('[KuroCapture] 请求未携带 token，跳过');
    $done({});
    return;
  }

  const store = loadStore();
  const alias = resolveAlias(getAlias(), cred.token, store);
  const prev = store.accounts[alias] || {};
  const isNew = !prev.token;
  const tokenChanged = !!prev.token && prev.token !== cred.token;

  // 同一 token 的后续请求：静默放行，不重写存储也不刷通知
  if (!isNew && !tokenChanged && prev.devCode === cred.devCode &&
      prev.distinctId === cred.distinctId) {
    $done({});
    return;
  }

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
    // 只在首次抓取或 token 变化时通知，避免 App 每个请求都刷一条
    if (isNew || tokenChanged) {
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
