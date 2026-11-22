/**
 * 库街区（Kuro BBS）自动签到 — Surge cron 脚本
 *
 * 参考：https://github.com/mxyooR/Kuro-autosignin
 * 支持鸣潮 / 战双游戏签到 + 库街区论坛每日任务（签到/浏览/点赞/分享）。
 *
 * 凭证来源：优先读取 kuro-capture.js 抓到的存储（kuro_capture_store），
 * 也可以在 argument 中手动填写（JSON 数组）。两者都不用就提示未配置。
 *
 * 配置示例（Surge [Script]）：
 * kuro.signin = type=cron,cronexp="0 8 * * *",script-path=kuro-signin.js,timeout=120,argument=[{"name":"主号"}]
 */

const API = {
  USER_MINE: 'https://api.kurobbs.com/user/mineV2',
  USER_ROLE_LIST: 'https://api.kurobbs.com/user/role/findRoleList',
  USER_SIGN_IN: 'https://api.kurobbs.com/user/signIn',
  TASK_PROCESS: 'https://api.kurobbs.com/encourage/level/getTaskProcess',
  TASK_SHARE: 'https://api.kurobbs.com/encourage/level/shareTask',
  GAME_SIGN_IN: 'https://api.kurobbs.com/encourage/signIn/v2',
  GAME_SIGN_RECORD: 'https://api.kurobbs.com/encourage/signIn/queryRecordV2',
  GAME_SIGN_INIT: 'https://api.kurobbs.com/encourage/signIn/initSignInV2',
  GAME_REPLENISH_SIGN: 'https://api.kurobbs.com/encourage/signIn/repleSigInV2',
  FORUM_LIST: 'https://api.kurobbs.com/forum/list',
  FORUM_POST_DETAIL: 'https://api.kurobbs.com/forum/getPostDetail',
  FORUM_LIKE: 'https://api.kurobbs.com/forum/like',
  GOLD_TOTAL: 'https://api.kurobbs.com/encourage/gold/getTotalGold'
};

const GAMES = {
  wuwa: {
    label: '鸣潮',
    gameId: '3',
    serverId: '76402e5b20be2c39f095a152090afddc',
    roleKey: 'wwroleId'
  },
  pgr: {
    label: '战双',
    gameId: '2',
    serverId: '1000',
    roleKey: 'eeeroleId'
  }
};

// Safari UA 前缀用字符码拼装，避免被浏览器的 UA 改写干扰
const SAFARI_UA =
  String.fromCharCode(77, 111, 122, 105, 108, 108, 97, 47, 53, 46, 48) +
  ' (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)';

const STORE_KEY = 'kuro_signin_state';
const CAPTURE_STORE_KEY = 'kuro_capture_store';
const TOKEN_EXPIRED_CODES = [220, 1009, 1002, 1001, 1003, 1004];
const USER_ERROR_CODES = [1513];
const ALREADY_SIGNED_CODES = [1511, 1007, 1512];
const SUCCESS_CODES = [200];

// ---------- 小工具 ----------

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function currentMonth() {
  const d = new Date();
  const m = d.getMonth() + 1;
  return m < 10 ? '0' + m : String(m);
}

function todayStr() {
  const d = new Date();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return (
    d.getFullYear() +
    '-' +
    (m < 10 ? '0' + m : m) +
    '-' +
    (day < 10 ? '0' + day : day)
  );
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function parseJSON(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

// 把抓包时保存的真实请求头合并进默认头（大小写不敏感，避免重复键）
function mergeCapturedExtras(h, extras) {
  if (!extras || typeof extras !== 'object') return h;
  const skip = { cookie: 1, token: 1, devcode: 1, distinct_id: 1, host: 1,
    'content-length': 1, 'transfer-encoding': 1, accept: 1 };
  Object.keys(extras).forEach(function (name) {
    if (skip[name.toLowerCase()]) return;
    // 已有同名（忽略大小写）则替换
    const existing = Object.keys(h).find(function (k) {
      return k.toLowerCase() === name.toLowerCase();
    });
    if (existing) delete h[existing];
    h[name] = extras[name];
  });
  return h;
}

// 注意：Surge 中 headers 对象会整体替换默认头，所以需要写全必要字段。
function baseHeaders() {
  return {
    Host: 'api.kurobbs.com',
    Accept: '*/*',
    'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    Connection: 'keep-alive',
    source: 'ios',
    lang: 'zh-Hans',
    channelId: '1',
    channel: 'appstore',
    version: '2.2.0',
    model: 'iPhone15,2',
    osVersion: '17.3',
    'User-Agent': 'KuroGameBox/48 CFNetwork/1492.0.1 Darwin/23.3.0'
  };
}

function bbsHeaders(cfg) {
  const h = baseHeaders();
  mergeCapturedExtras(h, cfg.user && cfg.user.extras);
  h.Cookie = cfg.user && cfg.user.cookie ? cfg.user.cookie : 'user_token=' + cfg.token;
  h.token = cfg.token;
  h.devCode = cfg.devcode || '';
  h.distinct_id = cfg.distinct_id || '';
  if (cfg.ip) h.Ip = cfg.ip;
  return h;
}

function gameHeaders(cfg) {
  const h = baseHeaders();
  mergeCapturedExtras(h, cfg.user && cfg.user.extras);
  h.Accept = 'application/json, text/plain, */*';
  h['Sec-Fetch-Site'] = 'same-site';
  h['Sec-Fetch-Mode'] = 'cors';
  h.Origin = 'https://web-static.kurobbs.com';
  h['User-Agent'] = SAFARI_UA + ' KuroGameBox/2.2.0';
  h.token = cfg.token;
  h.devCode = (cfg.ip || '10.0.2.0') + ', ' + SAFARI_UA + ' KuroGameBox/2.2.0';
  return h;
}

function userInfoHeaders(cfg) {
  return {
    osversion: 'Android',
    countrycode: 'CN',
    ip: '10.0.2.233',
    model: '2211133C',
    source: 'android',
    lang: 'zh-Hans',
    version: '1.0.9',
    versioncode: '1090',
    'content-type': 'application/x-www-form-urlencoded',
    'accept-encoding': 'gzip',
    'user-agent': 'okhttp/3.10.0',
    token: cfg.token,
    devcode: cfg.devcode || '',
    distinct_id: cfg.distinct_id || ''
  };
}

// 表单编码：和 Python requests 的 data=dict 行为一致
function formEncode(data) {
  if (!data) return '';
  return Object.keys(data)
    .map(function (key) {
      return (
        encodeURIComponent(key) + '=' + encodeURIComponent(String(data[key]))
      );
    })
    .join('&');
}

function request(method, url, headers, data) {
  return new Promise(function (resolve) {
    const options = {
      url: url,
      headers: headers,
      timeout: 20
    };
    const body = formEncode(data);
    if (method === 'post') options.body = body;
    $httpClient[method](options, function (error, response, bodyText) {
      if (error) {
        resolve({ code: -1, msg: String(error), data: null });
        return;
      }
      const parsed = parseJSON(bodyText, null);
      if (!parsed || typeof parsed !== 'object') {
        resolve({
          code: -1,
          msg: '响应不是 JSON: ' + String(bodyText || '').slice(0, 120),
          data: null
        });
        return;
      }
      resolve({
        code: Number(parsed.code),
        msg: parsed.msg || parsed.message || '',
        data: parsed.data
      });
    });
  });
}

function bbsPost(url, data, cfg) {
  return request('post', url, bbsHeaders(cfg), data);
}

function gamePost(url, data, cfg) {
  return request('post', url, gameHeaders(cfg), data);
}

function userPost(url, data, cfg) {
  return request('post', url, userInfoHeaders(cfg), data);
}

// ---------- 配置与状态 ----------

function getRawArgument() {
  if (typeof $argument === 'string' && $argument.trim()) return $argument.trim();
  return '';
}

// 读取 kuro-capture.js 抓到的凭证库
function loadCaptureStore() {
  const raw = $persistentStore.read(CAPTURE_STORE_KEY);
  let store = null;
  try {
    store = raw ? JSON.parse(raw) : null;
  } catch (e) {
    store = null;
  }
  if (!store || typeof store !== 'object' || !store.accounts) return {};
  return store.accounts;
}

function normalizeAccount(raw, index) {
  const item = raw && typeof raw === 'object' ? raw : {};
  const alias = String(item.name || item.alias || item.id || '').trim();
  return {
    alias: alias,
    id: alias || ('账号' + (index + 1)),
    token: String(item.token || '').trim(),
    enable: item.enable !== false,
    autoReplenish: item.autoReplenish === true || item.auto_replenish === true,
    game: item.game || 'all', // all | wuwa | pgr | none
    forum: item.forum !== false,
    games: item.games, // 可覆盖：{wuwa:{...}, pgr:{...}}
    user: item.user || {},
    devcode: String(item.devcode || '').trim(),
    distinct_id: String(item.distinct_id || '').trim()
  };
}

function loadAccounts() {
  const arg = getRawArgument();
  const captured = loadCaptureStore();
  const accounts = [];

  // argument 里配置了账号：按别名去抓到的凭证里匹配
  if (arg) {
    let parsed = parseJSON(arg, null);
    if (!parsed) parsed = arg; // 也支持直接写一个别名字符串
    if (!Array.isArray(parsed)) parsed = [parsed];

    parsed.forEach(function (raw, i) {
      const acc = normalizeAccount(raw, i);
      if (!acc.alias && !acc.token) return; // 没有任何标识的配置项忽略

      // 手填 token 优先；否则根据 name/alias 去抓取库里找
      let cred = null;
      if (acc.alias && captured[acc.alias]) cred = captured[acc.alias];
      if (!cred && acc.id && captured[acc.id]) cred = captured[acc.id];

      if (!acc.token && cred) {
        acc.token = String(cred.token || '').trim();
        acc.devcode = acc.devcode || String(cred.devCode || cred.devcode || '').trim();
        acc.distinct_id =
          acc.distinct_id || String(cred.distinctId || cred.distinct_id || '').trim();
        if (cred.cookie && !acc.user.cookie) acc.user.cookie = cred.cookie;
        if (cred.extras && !acc.user.extras) acc.user.extras = cred.extras;
      }
      if (acc.token) accounts.push(acc);
      else
        console.log(
          '账号 ' +
            acc.id +
            ' 没有找到 token（请检查别名是否正确、或先运行抓 cookie 脚本）'
        );
    });
    return accounts;
  }

  // 没有 argument：把抓到的所有账号都拿来签到
  Object.keys(captured).forEach(function (alias, i) {
    const c = captured[alias];
    if (!c || !c.token) return;
    const acc = normalizeAccount(
      {
        name: alias,
        token: c.token,
        devcode: c.devCode || c.devcode,
        distinct_id: c.distinctId || c.distinct_id,
        user: { cookie: c.cookie, extras: c.extras }
      },
      i
    );
    acc.alias = alias;
    acc.token = String(c.token).trim();
    if (acc.token) accounts.push(acc);
  });
  if (!accounts.length) {
    console.log('未找到可用凭证：请先运行 kuro-capture.js 抓取 cookie');
  }
  return accounts;
}

function loadState() {
  const raw = $persistentStore.read(STORE_KEY);
  const state = parseJSON(raw, {}) || {};
  if (!state.accounts || typeof state.accounts !== 'object') state.accounts = {};
  if (!state.days || typeof state.days !== 'object') state.days = {};
  return state;
}

function saveState(state) {
  $persistentStore.write(JSON.stringify(state), STORE_KEY);
}

function getSavedAccount(state, id) {
  const saved = state.accounts[id];
  return saved && typeof saved === 'object' ? saved : {};
}

function ensureDeviceInfo(cfg, saved) {
  cfg.devcode = cfg.devcode || saved.devcode || uuid();
  cfg.distinct_id = cfg.distinct_id || saved.distinct_id || uuid();
  cfg.userId = cfg.userId || saved.userId || '';
  saved.devcode = cfg.devcode;
  saved.distinct_id = cfg.distinct_id;
}

// ---------- API 封装 ----------

async function getUserId(cfg) {
  if (cfg.userId) return cfg.userId;
  const res = await userPost(API.USER_MINE, null, cfg);
  if (res.code === 200 && res.data && res.data.mine) {
    return res.data.mine.userId || '';
  }
  return '';
}

async function getRoleId(cfg, game) {
  if (cfg.roleId) return cfg.roleId;
  const res = await userPost(
    API.USER_ROLE_LIST,
    { gameId: game.gameId },
    cfg
  );
  if (res.code === 200 && res.data && res.data.length > 0) {
    return res.data[0].roleId || '';
  }
  return '';
}

async function getSignReward(cfg, game, roleId, userId) {
  const res = await gamePost(
    API.GAME_SIGN_RECORD,
    {
      gameId: game.gameId,
      serverId: game.serverId,
      roleId: roleId,
      userId: userId
    },
    cfg
  );
  if (res.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
    return res.data[0].goodsName || '';
  }
  return '';
}

async function getReplenishCount(cfg, game, roleId, userId) {
  const res = await gamePost(
    API.GAME_SIGN_INIT,
    {
      gameId: game.gameId,
      serverId: game.serverId,
      roleId: roleId,
      userId: userId
    },
    cfg
  );
  if (res.code === 200 && res.data) return Number(res.data.omissionNum || 0);
  return 0;
}

async function replenishSign(cfg, game, roleId, userId, month) {
  const res = await gamePost(
    API.GAME_REPLENISH_SIGN,
    {
      gameId: game.gameId,
      serverId: game.serverId,
      roleId: roleId,
      userId: userId,
      reqMonth: month
    },
    cfg
  );
  if (res.code === 200) {
    const reward = await getSignReward(cfg, game, roleId, userId);
    return (
      game.label +
      '补签成功' +
      (reward ? '，奖励：' + reward : '')
    );
  }
  return game.label + '补签失败：' + (res.msg || '未知错误 ' + res.code);
}

// ---------- 签到流程 ----------

async function signGame(cfg, game, roleId, userId, month) {
  const res = await gamePost(
    API.GAME_SIGN_IN,
    {
      gameId: game.gameId,
      serverId: game.serverId,
      roleId: roleId,
      userId: userId,
      reqMonth: month
    },
    cfg
  );

  const reward = await getSignReward(cfg, game, roleId, userId);
  const suffix = reward ? '，奖励：' + reward : '';

  if (SUCCESS_CODES.indexOf(res.code) >= 0) {
    return { ok: true, message: game.label + '签到成功' + suffix };
  }
  if (ALREADY_SIGNED_CODES.indexOf(res.code) >= 0) {
    return { ok: true, message: game.label + '今日已签到' + suffix };
  }
  if (TOKEN_EXPIRED_CODES.indexOf(res.code) >= 0) {
    return { ok: false, tokenExpired: true, message: game.label + '登录已过期' };
  }
  if (USER_ERROR_CODES.indexOf(res.code) >= 0) {
    return { ok: false, userError: true, message: game.label + '用户信息异常' };
  }
  return {
    ok: false,
    message: game.label + '签到失败：' + (res.msg || '错误码 ' + res.code)
  };
}

async function getForumList(cfg) {
  const res = await bbsPost(
    API.FORUM_LIST,
    {
      forumId: '9',
      gameId: '3',
      pageIndex: '1',
      pageSize: '20',
      searchType: '3',
      timeType: '0'
    },
    cfg
  );
  if (res.code === 200 && res.data && res.data.postList) {
    return res.data.postList;
  }
  return [];
}

async function getTaskList(cfg) {
  const res = await bbsPost(API.TASK_PROCESS, { gameId: '0' }, cfg);
  if (res.code === 200 && res.data && res.data.dailyTask) {
    return res.data.dailyTask;
  }
  return [];
}

async function forumSignIn(cfg) {
  const res = await bbsPost(API.USER_SIGN_IN, { gameId: '2' }, cfg);
  return res.code === 200;
}

async function viewPost(cfg, postId) {
  const res = await bbsPost(
    API.FORUM_POST_DETAIL,
    { isOnlyPublisher: '0', postId: postId, showOrderTyper: '2' },
    cfg
  );
  return res.code === 200;
}

async function likePost(cfg, post, userId) {
  const res = await bbsPost(
    API.FORUM_LIKE,
    {
      forumId: 11,
      gameId: 3,
      likeType: 1,
      operateType: 1,
      postCommentId: '',
      postCommentReplyId: '',
      postId: post.postId,
      postType: 1,
      toUserId: post.userId || userId || ''
    },
    cfg
  );
  return res.code === 200;
}

async function sharePost(cfg) {
  const res = await bbsPost(API.TASK_SHARE, { gameId: 3 }, cfg);
  return res.code === 200;
}

async function getGold(cfg) {
  const res = await bbsPost(API.GOLD_TOTAL, null, cfg);
  if (res.code === 200 && res.data) return Number(res.data.goldNum || 0);
  return null;
}

async function doForumTasks(cfg) {
  const lines = [];
  let posts = [];

  const tasks = await getTaskList(cfg);
  if (!tasks.length) {
    lines.push('论坛任务：获取任务列表失败');
    return lines;
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (Number(task.process) === 1) continue; // 已完成
    const remark = task.remark || '';

    if (remark === '用户签到') {
      const ok = await forumSignIn(cfg);
      lines.push('论坛签到：' + (ok ? '成功' : '失败'));
    } else if (remark === '浏览3篇帖子') {
      if (!posts.length) posts = await getForumList(cfg);
      let count = 0;
      for (let j = 0; j < Math.min(3, posts.length); j++) {
        if (await viewPost(cfg, posts[j].postId)) count++;
        await sleep(randomInt(400, 900));
      }
      lines.push('浏览帖子：' + count + '/3');
    } else if (remark === '点赞5次') {
      if (!posts.length) posts = await getForumList(cfg);
      let count = 0;
      for (let j = 0; j < Math.min(5, posts.length); j++) {
        if (await likePost(cfg, posts[j], cfg.userId)) count++;
        await sleep(randomInt(400, 900));
      }
      lines.push('点赞帖子：' + count + '/5');
    } else if (remark === '分享1次帖子') {
      const ok = await sharePost(cfg);
      lines.push('分享帖子：' + (ok ? '成功' : '失败'));
    }
  }

  const finalTasks = await getTaskList(cfg);
  if (finalTasks.length) {
    const gain = finalTasks.reduce(function (sum, t) {
      return Number(t.process) === 1 ? sum + Number(t.gainGold || 0) : sum;
    }, 0);
    const gold = await getGold(cfg);
    lines.push(
      '今日任务金币 +' + gain + (gold !== null ? '，当前 ' + gold + ' 金币' : '')
    );
  }
  return lines;
}

async function signInAccount(acc, state, dateStr) {
  const name = acc.id;
  const saved = getSavedAccount(state, name);
  const lines = [];

  if (!acc.enable) {
    return { skipped: true, lines: [name + '：已禁用'] };
  }

  // 当天已成功签到则跳过（游戏 + 论坛都成功才记完成）
  const dayRecord = state.days[dateStr] || {};
  if (dayRecord[name] === true) {
    return { skipped: true, lines: [name + '：今日已完成'] };
  }

  ensureDeviceInfo(acc, saved);

  try {
    let fatal = false;

    // 游戏签到：优先用 argument 里手填的 roleId / userId
    const wantGames = {};
    if (acc.game === 'all' || acc.game === 'wuwa') wantGames.wuwa = true;
    if (acc.game === 'all' || acc.game === 'pgr') wantGames.pgr = true;
    if (Array.isArray(acc.games)) {
      acc.games.forEach(function (g) {
        wantGames[String(g)] = true;
      });
    }

    for (const key in GAMES) {
      if (!wantGames[key]) continue;
      const game = GAMES[key];
      const override = (acc.games && acc.games[key]) || {};
      let roleId = override.roleId || saved[game.roleKey] || '';

      let cfg = Object.assign({}, acc, {
        userId: override.userId || acc.userId || saved.userId || ''
      });
      if (!cfg.userId) cfg.userId = await getUserId(cfg);
      if (!cfg.userId) {
        lines.push(game.label + '：无法获取用户 ID，跳过');
        continue;
      }
      cfg.userId = String(cfg.userId);

      if (!roleId) {
        roleId = await getRoleId(cfg, game);
        if (roleId) lines.push(game.label + '：已自动获取角色 ID');
      }
      if (!roleId) continue; // 未绑定该游戏则跳过
      const result = await signGame(cfg, game, roleId, cfg.userId, currentMonth());
      lines.push(result.message);
      if (result.tokenExpired || result.userError) fatal = true;

      if (!fatal && acc.autoReplenish && result.ok) {
        const count = await getReplenishCount(cfg, game, roleId, cfg.userId);
        if (count > 0) {
          lines.push(await replenishSign(cfg, game, roleId, cfg.userId, currentMonth()));
        }
      }
      saved[game.roleKey] = roleId;
      saved.userId = cfg.userId;
      await sleep(randomInt(300, 700));
    }

    if (!fatal && acc.forum) {
      const fcfg = Object.assign({}, acc, { userId: acc.userId || saved.userId || '' });
      if (!fcfg.userId) fcfg.userId = await getUserId(fcfg);
      if (fcfg.userId) {
        saved.userId = String(fcfg.userId);
        const forumLines = await doForumTasks(fcfg);
        Array.prototype.push.apply(lines, forumLines);
      } else {
        lines.push('论坛：无法获取用户 ID，跳过');
      }
    }

    // 失败则重试一次
    if (
      !fatal &&
      lines.some(function (l) {
        return l.indexOf('失败') >= 0;
      })
    ) {
      lines.push('发现失败项，10 秒后重试一次…');
      await sleep(10000);
      lines.length = 0;
      lines.push(name + '（重试）');
      // 简化重试：游戏与论坛再跑一遍；已成功的接口会返回“今日已签到”
      const retry = await signInAccountRetry(acc, state, saved);
      Array.prototype.push.apply(lines, retry);
    }

    state.accounts[name] = saved;
    state.days[dateStr] = state.days[dateStr] || {};
    if (
      !fatal &&
      !lines.some(function (l) {
        return l.indexOf('失败') >= 0;
      })
    ) {
      state.days[dateStr][name] = true;
    }
    return { ok: !fatal, lines: lines, tokenExpired: fatal };
  } catch (e) {
    console.log('[KuroSignIn] 账号异常堆栈: ' + (e && e.stack ? e.stack : String(e)));
    return { ok: false, lines: [name + '异常：' + (e && e.message ? e.message : String(e))] };
  }
}

async function signInAccountRetry(acc, state, saved) {
  const lines = [];
  const wantGames = {};
  if (acc.game === 'all' || acc.game === 'wuwa') wantGames.wuwa = true;
  if (acc.game === 'all' || acc.game === 'pgr') wantGames.pgr = true;

  for (const key in GAMES) {
    if (!wantGames[key]) continue;
    const game = GAMES[key];
    const roleId = saved[game.roleKey] || '';
    if (!roleId) continue;
    const cfg = Object.assign({}, acc, { roleId: roleId, userId: saved.userId || '' });
    if (!cfg.userId) cfg.userId = await getUserId(cfg);
    if (!cfg.userId) continue;
    const result = await signGame(cfg, game, roleId, cfg.userId, currentMonth());
    lines.push(result.message);
  }
  if (acc.forum) {
    const cfg = Object.assign({}, acc, { userId: saved.userId || '' });
    const forumLines = await doForumTasks(cfg);
    Array.prototype.push.apply(lines, forumLines);
  }
  return lines;
}

// ---------- 入口 ----------

async function main() {
  const accounts = loadAccounts();
  if (!accounts.length) {
    $notification.post('库街区签到', '未配置账号', '请在 [Script] 的 argument 中填写账号 JSON');
    $done();
    return;
  }

  const state = loadState();
  const dateStr = todayStr();
  const results = [];

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    const result = await signInAccount(acc, state, dateStr);
    results.push(result);
    saveState(state); // 每处理一个账号就保存，避免中途退出丢状态
    await sleep(randomInt(500, 1200));
  }

  const okCount = results.filter(function (r) {
    return r.ok && !r.skipped;
  }).length;
  const failCount = results.filter(function (r) {
    return !r.ok && !r.skipped;
  }).length;

  const summary =
    '成功 ' +
    okCount +
    ' · 失败 ' +
    failCount +
    ' · 跳过 ' +
    (results.length - okCount - failCount);
  const detail = results
    .map(function (r) {
      return r.lines.join('\n');
    })
    .join('\n---\n');

  console.log('[KuroSignIn] ' + dateStr + '\n' + summary + '\n' + detail);
  $notification.post('库街区签到 ' + dateStr, summary, detail.slice(0, 900));
  $done();
}

main().catch(function (e) {
  console.log('[KuroSignIn] 致命错误: ' + (e && e.stack ? e.stack : String(e)));
  $notification.post('库街区签到异常', '', String(e && e.message ? e.message : e));
  $done();
});
