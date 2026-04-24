//2026/04/21
/*
@Name：WeTalk 自动化签到+视频奖励
@Author：TG@ZenMoFiShi

[rewrite_local]
^https:\/\/api\.wetalkapp\.com\/app\/queryBalanceAndBonus url script-request-header https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/WeTalk.js

[task_local]
20 8,20 * * * https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/WeTalk.js, tag=WeTalk签到, enabled=true

[MITM]
hostname = api.wetalkapp.com
*/

const scriptName = "WeTalk";
const storeKey = "wetalk_accounts_v1";
const SECRET = "0fOiukQq7jXZV2GRi9LGlO";
const API_HOST = "api.wetalkapp.com";
const MAX_VIDEO = 5;
const VIDEO_DELAY = 8000;
const ACCOUNT_GAP = 3500;

const IOS_VERSIONS = [
  "17.5.1",
  "17.6.1",
  "17.4.1",
  "17.2.1",
  "16.7.8",
  "17.6",
  "17.3.1",
  "18.0.1",
  "17.1.2",
  "16.6.1",
];
const IOS_SCALES = ["2.00", "3.00", "3.00", "2.00", "3.00"];
const IPHONE_MODELS = [
  "iPhone14,3",
  "iPhone13,3",
  "iPhone15,3",
  "iPhone16,1",
  "iPhone14,7",
  "iPhone13,2",
  "iPhone15,2",
  "iPhone12,1",
];
const CFN_VERS = [
  "1410.0.3",
  "1494.0.7",
  "1568.100.1",
  "1209.1",
  "1474.0.4",
  "1568.200.2",
];
const DARWIN_VERS = ["22.6.0", "23.5.0", "23.6.0", "24.0.0", "22.4.0"];

function MD5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX, lY) {
    const lX4 = lX & 0x40000000,
      lY4 = lY & 0x40000000,
      lX8 = lX & 0x80000000,
      lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4)
      return lResult & 0x40000000
        ? lResult ^ 0xc0000000 ^ lX8 ^ lY8
        : lResult ^ 0x40000000 ^ lX8 ^ lY8;
    return lResult ^ lX8 ^ lY8;
  }
  function F(x, y, z) {
    return (x & y) | (~x & z);
  }
  function G(x, y, z) {
    return (x & z) | (y & ~z);
  }
  function H(x, y, z) {
    return x ^ y ^ z;
  }
  function I(x, y, z) {
    return y ^ (x | ~z);
  }
  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function ConvertToWordArray(str) {
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 =
      (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1).fill(0);
    let lBytePosition = 0,
      lByteCount = 0;
    while (lByteCount < lMessageLength) {
      const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] |= str.charCodeAt(lByteCount) << lBytePosition;
      lByteCount++;
    }
    const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] |= 0x80 << lBytePosition;
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function WordToHex(lValue) {
    let WordToHexValue = "";
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      const WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue += WordToHexValue_temp.substr(
        WordToHexValue_temp.length - 2,
        2,
      );
    }
    return WordToHexValue;
  }
  const x = ConvertToWordArray(string);
  let a = 0x67452301,
    b = 0xefcdab89,
    c = 0x98badcfe,
    d = 0x10325476;
  const S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22,
    S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  const S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23,
    S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;
  for (let k = 0; k < x.length; k += 16) {
    const AA = a,
      BB = b,
      CC = c,
      DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  return (
    WordToHex(a) +
    WordToHex(b) +
    WordToHex(c) +
    WordToHex(d)
  ).toLowerCase();
}

function getUTCSignDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}

function normalizeHeaderNameMap(headers) {
  const out = {};
  Object.keys(headers || {}).forEach((k) => (out[k] = headers[k]));
  return out;
}

function parseRawQuery(url) {
  const query = (url.split("?")[1] || "").split("#")[0];
  const rawMap = {};
  query.split("&").forEach((pair) => {
    if (!pair) return;
    const idx = pair.indexOf("=");
    if (idx < 0) return;
    const k = pair.slice(0, idx);
    const v = pair.slice(idx + 1);
    rawMap[k] = v;
  });
  return rawMap;
}

function fingerprintOf(paramsRaw) {
  const drop = {
    sign: 1,
    signDate: 1,
    timestamp: 1,
    ts: 1,
    nonce: 1,
    random: 1,
    reqTime: 1,
    reqId: 1,
    requestId: 1,
  };
  const base = Object.keys(paramsRaw || {})
    .filter((k) => !drop[k])
    .sort()
    .map((k) => `${k}=${paramsRaw[k]}`)
    .join("&");
  return MD5(base).slice(0, 12);
}

function loadStore() {
  //const raw = $prefs.valueForKey(storeKey);
  const raw = $persistentStore.read(storeKey);
  if (!raw) return { version: 1, accounts: {}, order: [] };
  try {
    const obj = JSON.parse(raw);
    if (!obj.accounts) obj.accounts = {};
    if (!Array.isArray(obj.order)) obj.order = Object.keys(obj.accounts);
    return obj;
  } catch (e) {
    return { version: 1, accounts: {}, order: [] };
  }
}

function saveStore(store) {
  //$prefs.setValueForKey(JSON.stringify(store), storeKey);
  $persistentStore.write(JSON.stringify(store), storeKey);
}

function pickItem(arr, seed) {
  return arr[seed % arr.length];
}

function buildUA(baseUA, seed) {
  const iosVer = pickItem(IOS_VERSIONS, seed);
  const scale = pickItem(IOS_SCALES, seed + 1);
  const model = pickItem(IPHONE_MODELS, seed + 2);
  const cfn = pickItem(CFN_VERS, seed + 3);
  const darwin = pickItem(DARWIN_VERS, seed + 4);
  if (baseUA && typeof baseUA === "string") {
    let ua = baseUA;
    let changed = false;
    if (/iOS \d+(\.\d+){0,2}/.test(ua)) {
      ua = ua.replace(/iOS \d+(\.\d+){0,2}/, `iOS ${iosVer}`);
      changed = true;
    }
    if (/Scale\/\d+(\.\d+)?/.test(ua)) {
      ua = ua.replace(/Scale\/\d+(\.\d+)?/, `Scale/${scale}`);
      changed = true;
    }
    if (/iPhone\d+,\d+/.test(ua)) {
      ua = ua.replace(/iPhone\d+,\d+/, model);
      changed = true;
    }
    if (/CFNetwork\/[\d.]+/.test(ua)) {
      ua = ua.replace(/CFNetwork\/[\d.]+/, `CFNetwork/${cfn}`);
      changed = true;
    }
    if (/Darwin\/[\d.]+/.test(ua)) {
      ua = ua.replace(/Darwin\/[\d.]+/, `Darwin/${darwin}`);
      changed = true;
    }
    if (changed) return ua;
  }
  return `WeTalk/30.6.0 (com.innovationworks.wetalk; build:28; iOS ${iosVer}) Alamofire/5.4.3`;
}

function buildSignedParamsRaw(capture) {
  const params = {};
  Object.keys(capture.paramsRaw || {}).forEach((k) => {
    if (k !== "sign" && k !== "signDate") params[k] = capture.paramsRaw[k];
  });
  params.signDate = getUTCSignDate();
  const signBase = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  params.sign = MD5(signBase + SECRET);
  return params;
}

function buildUrl(path, capture) {
  const params = buildSignedParamsRaw(capture);
  const qs = Object.keys(params)
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join("&");
  return `https://${API_HOST}/app/${path}?${qs}`;
}

function cloneHeaders(headers) {
  const out = {};
  Object.keys(headers || {}).forEach((k) => (out[k] = headers[k]));
  return out;
}

function buildHeaders(capture, ua) {
  const headers = cloneHeaders(capture.headers || {});
  delete headers["Content-Length"];
  delete headers["content-length"];
  delete headers[":authority"];
  delete headers[":method"];
  delete headers[":path"];
  delete headers[":scheme"];
  headers["Host"] = API_HOST;
  headers["Accept"] = headers["Accept"] || "application/json";
  Object.keys(headers).forEach((k) => {
    if (k.toLowerCase() === "user-agent") delete headers[k];
  });
  headers["User-Agent"] = ua;
  return headers;
}

function notify(title, body) {
  //$notify(scriptName, title, body);
  $notification.post(title, scriptName, body);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpRequest(params) {
  return new Promise((resolve, reject) => {
    $httpClient.get(params, (error, response, data) => {
      if (error) {
        reject(error); // 失败时走 catch
      } else {
        resolve({ response, data }); // 成功时返回结果
      }
    });
  });
}

function runAccount(acc, index, total) {
  const tag = `[账号${index + 1}/${total} ${acc.alias || acc.id}]`;
  const ua = buildUA(acc.baseUA, acc.uaSeed);
  const headers = buildHeaders(acc.capture, ua);
  const msgs = [tag];

  // function fetchApi(path) {
  //   return $task.fetch({
  //     url: buildUrl(path, acc.capture),
  //     method: "GET",
  //     headers,
  //   });
  // }
  function fetchApi(path) {
    return httpRequest({
      url: buildUrl(path, acc.capture),
      headers,
    });
  }

  function doVideoLoop(count) {
    let i = 0;
    function next() {
      if (i >= count) return Promise.resolve();
      return new Promise((resolve) => {
        setTimeout(
          () => {
            i++;
            fetchApi("videoBonus")
              .then((res) => {
                try {
                  const d = JSON.parse(res.body);
                  if (d.retcode === 0) {
                    msgs.push(`🎬 视频${i}：+${d.result?.bonus || "?"} Coins`);
                    resolve(next());
                  } else {
                    msgs.push(`⏸ 视频${i}：${d.retmsg}`);
                    resolve();
                  }
                } catch (e) {
                  msgs.push(`❌ 视频${i}：解析失败`);
                  resolve();
                }
              })
              .catch((err) => {
                msgs.push(`❌ 视频${i}：${err.error || "请求失败"}`);
                resolve();
              });
          },
          i === 0 ? 1500 : VIDEO_DELAY,
        );
      });
    }
    return next();
  }

  return $httpClient("queryBalanceAndBonus")
    .then((res) => {
      try {
        const d = JSON.parse(res.body);
        if (d.retcode === 0) msgs.push(`💰 余额：${d.result.balance} Coins`);
        else msgs.push(`⚠️ 查询：${d.retmsg}`);
      } catch (e) {
        msgs.push("❌ 查询：解析失败");
      }
      return fetchApi("checkIn");
    })
    .then((res) => {
      try {
        const d = JSON.parse(res.body);
        if (d.retcode === 0)
          msgs.push(
            `✅ 签到：${(d.result?.bonusHint || d.retmsg || "").replace(/\n/g, " ")}`,
          );
        else msgs.push(`⚠️ 签到：${d.retmsg}`);
      } catch (e) {
        msgs.push("❌ 签到：解析失败");
      }
      return doVideoLoop(MAX_VIDEO);
    })
    .then(() => fetchApi("queryBalanceAndBonus"))
    .then((res) => {
      try {
        const d = JSON.parse(res.body);
        if (d.retcode === 0)
          msgs.push(`💰 最新余额：${d.result.balance} Coins`);
      } catch (e) {}
      return msgs.join("\n");
    })
    .catch((err) => {
      msgs.push(`❌ 异常：${err.error || String(err)}`);
      return msgs.join("\n");
    });
}

if (typeof $request !== "undefined" && $request) {
  const paramsRaw = parseRawQuery($request.url);
  const headersMap = normalizeHeaderNameMap($request.headers || {});
  let baseUA = "";
  Object.keys(headersMap).forEach((k) => {
    if (k.toLowerCase() === "user-agent") baseUA = headersMap[k];
  });

  const store = loadStore();
  const fp = fingerprintOf(paramsRaw);
  const now = Date.now();
  const existed = !!store.accounts[fp];
  const uaSeed = existed ? store.accounts[fp].uaSeed : store.order.length;
  const alias = existed
    ? store.accounts[fp].alias
    : `账号${store.order.length + 1}`;

  store.accounts[fp] = {
    id: fp,
    alias,
    uaSeed,
    baseUA,
    capture: { url: $request.url, paramsRaw, headers: headersMap },
    createdAt: existed ? store.accounts[fp].createdAt : now,
    updatedAt: now,
  };
  if (!existed) store.order.push(fp);
  saveStore(store);

  const total = store.order.length;
  notify(
    existed ? "🔄 账号参数已更新" : "✅ 新账号已入库",
    `${alias}（id:${fp}）\n当前账号总数：${total}`,
  );
  console.log(
    `【${scriptName}】${existed ? "update" : "add"} account ${fp}\n${JSON.stringify(store.accounts[fp], null, 2)}`,
  );
  $done({});
} else {
  const store = loadStore();
  const ids = store.order.filter((id) => store.accounts[id]);
  if (!ids.length) {
    notify("⚠️ 未抓到任何账号", "请先打开 WeTalk 触发抓包");
    $done();
  } else {
    const total = ids.length;
    const results = [];
    let chain = Promise.resolve();
    ids.forEach((id, idx) => {
      chain = chain
        .then(() => runAccount(store.accounts[id], idx, total))
        .then((text) => {
          results.push(text);
        })
        .then(() => (idx < ids.length - 1 ? sleep(ACCOUNT_GAP) : null));
    });
    chain
      .then(() => {
        notify(`🎉 全部完成 (${total}个账号)`, results.join("\n———\n"));
        $done();
      })
      .catch((err) => {
        notify(
          "❌ 任务异常",
          results.join("\n———\n") + "\n" + (err.error || String(err)),
        );
        $done();
      });
  }
}
