/* Deal Maker AI — محوّل لوحة التاجر (Dashboard Adapter)
 * غير تطفّلي: لا يُعدّل أي ملف أو واجهة في اللوحة.
 * يبذر الـ bridge بالقيم الافتراضية ثم يلتقط تعديلات التاجر
 * عبر قراءة DOM بعد أحداث input/click (بأفضل جهد) ويكتبها في الـ bridge.
 */
(function (root) {
  "use strict";
  var B = root.DealMakerBridge;
  var M = root.DealMakerMapping;
  if (!B || !M) { console.warn("[dashboard-adapter] bridge/mapping غير محمّل"); return; }
  var doc = root.document;

  function seed() {
    var cfg = B.getConfig();
    if (!cfg.updatedAt) B.setConfig(M.dashboardToConfig(M.DASHBOARD_DEFAULTS));
  }

  function txt(el) { return el ? (el.textContent || "").trim() : ""; }

  // قراءة الحالة الظاهرة من لوحات sales-assistant (بأفضل جهد).
  function scrape() {
    if (!doc) return null;
    var d = {};

    // الوضع: زر ModeSwitch المحدّد عادة يحمل aria-pressed/حالة نشطة.
    var modeBtns = doc.querySelectorAll('[data-mode], [role="tab"], button');
    for (var i = 0; i < modeBtns.length; i++) {
      var b = modeBtns[i];
      var label = txt(b);
      var pressed = b.getAttribute("aria-pressed") === "true" || b.getAttribute("data-state") === "active";
      if (!pressed) continue;
      if (label.indexOf("ذكاء") > -1 || label.indexOf("الطيّار") > -1) d.mode = "ai";
      else if (label.indexOf("التاجر") > -1 || label.indexOf("اليدوي") > -1) d.mode = "merchant";
      else if (label.indexOf("هجين") > -1) d.mode = "hybrid";
    }

    // المؤقت: أول input[type=number] معقول كدقائق.
    var nums = doc.querySelectorAll('input[type="number"]');
    for (var n = 0; n < nums.length; n++) {
      var v = parseInt(nums[n].value, 10);
      if (isFinite(v) && v > 0 && v <= 240) { d.timerMinutes = v; break; }
    }

    // رسائل الببل: inputs بجوار أيقونة Sparkles داخل قسم الببل.
    var bubbleInputs = doc.querySelectorAll('input.flex-1, input[placeholder*="اقتراح"]');
    var msgs = [];
    for (var bi = 0; bi < bubbleInputs.length; bi++) {
      var bv = (bubbleInputs[bi].value || "").trim();
      if (bv && bv.length > 3 && bubbleInputs[bi].getAttribute("placeholder") == null) msgs.push(bv);
    }
    if (msgs.length) d.bubbleMessages = msgs;

    return d;
  }

  var pending = null;
  function pushSoon() {
    if (pending) return;
    pending = setTimeout(function () {
      pending = null;
      var d = scrape();
      if (d) B.setConfig(M.dashboardToConfig(d));
    }, 350);
  }

  function start() {
    seed();
    if (doc) {
      doc.addEventListener("input", pushSoon, true);
      doc.addEventListener("change", pushSoon, true);
      doc.addEventListener("click", function () { setTimeout(pushSoon, 60); }, true);
    }
    // استقبال تحليلات المتجر (للعرض في الـ Hub) — لا نلمس واجهة اللوحة.
    B.onEvent(function (ev) {
      try { (root.__djbActivity = root.__djbActivity || []).push(ev); } catch (e) {}
    });
  }

  if (doc && doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () { setTimeout(start, 400); });
  } else {
    setTimeout(start, 400);
  }
})(typeof window !== "undefined" ? window : this);
