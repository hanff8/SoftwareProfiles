// ==UserScript==
// @name         New Userscript
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        *://*.mypikpak.com/*
// ==/UserScript==

(function () {
    'use strict';

    const regexPattern = /(^https?:\/\/.*)(\.mypikpak\.com)(.*)/;

    // 定义目标 URL 的格式，使用 $1 表示第一个捕获组，$2 表示第二个捕获组
    const targetUrlTemplate = "$1.mypikpak.net$3";

    // 获取当前 URL 并进行匹配
    // const currentUrl = window.location.href;
    const currentUrl = "https://mypikpak.com/all"
    const match = currentUrl.match(regexPattern);

    console.log(targetUrlTemplate)
    if (match) {
        console.log("Match!!!")

        // 使用捕获的组生成重定向 URL
        const redirectUrl = currentUrl.replace(regexPattern, targetUrlTemplate);
        window.location.replace(redirectUrl);
    }
})();