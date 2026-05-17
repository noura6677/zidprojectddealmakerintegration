/* Deal Maker AI — Integration Bridge SDK (Frontend-only)
 * لا Backend / لا APIs / لا قواعد بيانات.
 * المزامنة عبر localStorage + BroadcastChannel + storage events.
 * يعمل كـ classic script (window.DealMakerBridge) داخل المتجر،
 * اللوحة، والـ Hub — كلها على نفس الـ origin فتتشارك التخزين.
 */
(function (root) {
  "use strict";

  var CONFIG_KEY = "djbridge:config:v1";
  var EVENTS_KEY = "djbridge:events:v1";
  var CHANNEL = "djbridge";
  var MAX_EVENTS = 200;

  var DEFAULT_CONFIG = {
    version: 1,
    updatedAt: 0,
    mode: "ai", // ai | merchant | hybrid
    timer: {
      seconds: 60,
      message: "جائزتك محجوزة! أكمل طلبك قبل انتهاء الوقت",
      startOn: "win" // win | first_add | open_cart
    },
    levels: [
      { name: "مبتدئ", icon: "🌱", need: 0 },
      { name: "هاوي", icon: "☕", need: 2 },
      { name: "خبير", icon: "🔥", need: 4 },
      { name: "محترف", icon: "🏆", need: 6 }
    ],
    roulette: [
      { label: "توصيل مجاني", emoji: "🚚", weight: 28, discount: 0 },
      { label: "كوب مجاني", emoji: "🍵", weight: 24, discount: 0 },
      { label: "خصم 10%", emoji: "🏷️", weight: 22, discount: 0.1 },
      { label: "منتج إضافي", emoji: "☕", weight: 18, discount: 0 },
      { label: "خصم 20%", emoji: "🏷️", weight: 8, discount: 0.2 }
    ],
    bundles: [], // [{ id, name, tagline, active }]
    bubble: {
      messages: [
        "أهلاً بك في نجدية — هل تحب أن نساعدك في اختيار قهوتك؟"
      ]
    }
  };

  function safeParse(s, fallback) {
    try { var v = JSON.parse(s); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }

  function deepMerge(base, patch) {
    if (Array.isArray(patch)) return patch.slice();
    if (patch && typeof patch === "object") {
      var out = {};
      var k;
      for (k in base) out[k] = base[k];
      for (k in patch) {
        out[k] = (patch[k] && typeof patch[k] === "object" && !Array.isArray(patch[k]))
          ? deepMerge(base[k] || {}, patch[k])
          : (Array.isArray(patch[k]) ? patch[k].slice() : patch[k]);
      }
      return out;
    }
    return patch;
  }

  var ls = (function () {
    try { var t = "__djb__"; root.localStorage.setItem(t, t); root.localStorage.removeItem(t); return root.localStorage; }
    catch (e) { return null; }
  })();

  var memStore = {};
  function rawGet(k) { return ls ? ls.getItem(k) : (memStore[k] || null); }
  function rawSet(k, v) { if (ls) ls.setItem(k, v); else memStore[k] = v; }

  var bc = null;
  try { if (typeof root.BroadcastChannel === "function") bc = new root.BroadcastChannel(CHANNEL); }
  catch (e) { bc = null; }

  var configSubs = [];
  var eventSubs = [];

  function getConfig() {
    var stored = safeParse(rawGet(CONFIG_KEY), null);
    return stored ? deepMerge(DEFAULT_CONFIG, stored) : deepMerge(DEFAULT_CONFIG, {});
  }

  function notifyConfig(cfg, origin) {
    for (var i = 0; i < configSubs.length; i++) {
      try { configSubs[i](cfg, origin); } catch (e) {}
    }
  }

  function setConfig(patch, opts) {
    opts = opts || {};
    var next = deepMerge(getConfig(), patch || {});
    next.updatedAt = Date.now();
    next.version = 1;
    rawSet(CONFIG_KEY, JSON.stringify(next));
    if (bc && !opts.silent) { try { bc.postMessage({ t: "config", at: next.updatedAt }); } catch (e) {} }
    notifyConfig(next, "local");
    return next;
  }

  function resetConfig() {
    rawSet(CONFIG_KEY, JSON.stringify(deepMerge(DEFAULT_CONFIG, { updatedAt: Date.now() })));
    if (bc) { try { bc.postMessage({ t: "config", at: Date.now() }); } catch (e) {} }
    notifyConfig(getConfig(), "reset");
  }

  function onConfig(cb, fireNow) {
    if (typeof cb !== "function") return function () {};
    configSubs.push(cb);
    if (fireNow !== false) { try { cb(getConfig(), "init"); } catch (e) {} }
    return function () { configSubs = configSubs.filter(function (f) { return f !== cb; }); };
  }

  function getEvents() { return safeParse(rawGet(EVENTS_KEY), []) || []; }

  function emit(type, payload) {
    var list = getEvents();
    var ev = { type: type, payload: payload || {}, ts: Date.now() };
    list.push(ev);
    if (list.length > MAX_EVENTS) list = list.slice(list.length - MAX_EVENTS);
    rawSet(EVENTS_KEY, JSON.stringify(list));
    if (bc) { try { bc.postMessage({ t: "event", ev: ev }); } catch (e) {} }
    for (var i = 0; i < eventSubs.length; i++) {
      try { eventSubs[i](ev); } catch (e) {}
    }
    return ev;
  }

  function onEvent(cb) {
    if (typeof cb !== "function") return function () {};
    eventSubs.push(cb);
    return function () { eventSubs = eventSubs.filter(function (f) { return f !== cb; }); };
  }

  if (bc) {
    bc.onmessage = function (m) {
      var d = m && m.data;
      if (!d) return;
      if (d.t === "config") notifyConfig(getConfig(), "remote");
      else if (d.t === "event" && d.ev) {
        for (var i = 0; i < eventSubs.length; i++) {
          try { eventSubs[i](d.ev); } catch (e) {}
        }
      }
    };
  }

  if (root.addEventListener) {
    root.addEventListener("storage", function (e) {
      if (!e) return;
      if (e.key === CONFIG_KEY) notifyConfig(getConfig(), "remote");
      else if (e.key === EVENTS_KEY) {
        var list = getEvents();
        var last = list[list.length - 1];
        if (last) for (var i = 0; i < eventSubs.length; i++) {
          try { eventSubs[i](last); } catch (err) {}
        }
      }
    });
  }

  root.DealMakerBridge = {
    KEYS: { config: CONFIG_KEY, events: EVENTS_KEY },
    DEFAULT_CONFIG: DEFAULT_CONFIG,
    getConfig: getConfig,
    setConfig: setConfig,
    resetConfig: resetConfig,
    onConfig: onConfig,
    emit: emit,
    onEvent: onEvent,
    getEvents: getEvents
  };
})(typeof window !== "undefined" ? window : this);
