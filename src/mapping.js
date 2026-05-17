/* Deal Maker AI — خريطة التحويل المركزية بين لوحة التاجر والمتجر.
 * دوال نقية فقط (pure) — لا تلمس DOM ولا تخزين.
 * أي تحويل جديد يُضاف هنا وفقط هنا.
 */
(function (root) {
  "use strict";

  // القيم الافتراضية للوحة (من src/lib/sales-assistant-data.ts) — تستخدم
  // لبذر الـ bridge فور فتح اللوحة لتبدو التجربة متصلة فوراً.
  var DASHBOARD_DEFAULTS = {
    mode: "ai",
    timerMinutes: 10,
    levels: [
      { name: "مبتدئ", requiredOrders: 1 },
      { name: "هاوي", requiredOrders: 3 },
      { name: "خبير", requiredOrders: 6 },
      { name: "محترف", requiredOrders: 12 }
    ],
    roulette: [
      { label: "توصيل مجاني", weight: 25 },
      { label: "كوب مجاني", weight: 15 },
      { label: "خصم 10%", weight: 30 },
      { label: "منتج إضافي", weight: 10 },
      { label: "خصم 20%", weight: 8 }
    ],
    bubbleMessages: [
      "تفضّل قهوة سعودية ولا مختصة؟",
      "تحب الأكواب السيراميك ولا الورقية؟",
      "تدوّر على تجربة منزلية ولا ضيافة؟"
    ]
  };

  // استنتاج الخصم من نص الجائزة (مثل "خصم 10%").
  function discountFromLabel(label) {
    var m = /(\d{1,2})\s*%/.exec(String(label || ""));
    if (!m) return 0;
    var n = parseInt(m[1], 10);
    return isFinite(n) ? n / 100 : 0;
  }

  function emojiFromLabel(label) {
    var s = String(label || "");
    if (s.indexOf("%") > -1) return "🏷️";
    if (s.indexOf("توصيل") > -1 || s.indexOf("شحن") > -1) return "🚚";
    if (s.indexOf("كوب") > -1) return "🍵";
    if (s.indexOf("منتج") > -1) return "☕";
    return "🎁";
  }

  // تحويل إعدادات لوحة التاجر إلى شكل config الـ bridge.
  function dashboardToConfig(d) {
    d = d || {};
    var patch = {};
    if (d.mode) patch.mode = d.mode;

    if (typeof d.timerMinutes === "number" && d.timerMinutes > 0) {
      patch.timer = { seconds: Math.round(d.timerMinutes * 60) };
    }
    if (d.timerMessage) patch.timer = Object.assign(patch.timer || {}, { message: d.timerMessage });
    if (d.timerStartOn) patch.timer = Object.assign(patch.timer || {}, { startOn: d.timerStartOn });

    if (d.levels && d.levels.length) {
      // المتجر يحوي 4 عقد مستوى ثابتة — نحافظ على التصميم
      // بعدم تجاوز 4 وبجعل أول عتبة = 0 (دخول المستوى الأول).
      var icons = ["🌱", "☕", "🔥", "🏆"];
      patch.levels = d.levels.slice(0, 4).map(function (l, i) {
        var need = i === 0 ? 0 : Math.max(1, parseInt(l.requiredOrders, 10) || (i * 2));
        return { name: l.name || ("مستوى " + (i + 1)), icon: l.icon || icons[i] || "⭐", need: need };
      });
    }

    if (d.roulette && d.roulette.length) {
      patch.roulette = d.roulette.map(function (r) {
        return {
          label: r.label || "جائزة",
          emoji: r.emoji || emojiFromLabel(r.label),
          weight: typeof r.weight === "number" ? r.weight : 10,
          discount: typeof r.discount === "number" ? r.discount : discountFromLabel(r.label)
        };
      });
    }

    if (d.bundles) {
      patch.bundles = d.bundles.map(function (b) {
        return { id: b.id, name: b.name, tagline: b.description || b.tagline || "", active: b.active !== false };
      });
    }

    if (d.bubbleMessages && d.bubbleMessages.length) {
      patch.bubble = { messages: d.bubbleMessages.slice() };
    }
    return patch;
  }

  root.DealMakerMapping = {
    DASHBOARD_DEFAULTS: DASHBOARD_DEFAULTS,
    discountFromLabel: discountFromLabel,
    emojiFromLabel: emojiFromLabel,
    dashboardToConfig: dashboardToConfig
  };
})(typeof window !== "undefined" ? window : this);
