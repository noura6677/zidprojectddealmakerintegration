/* Deal Maker AI — محوّل المتجر (Store Adapter)
 * يُطبّق إعدادات الـ bridge على متغيّرات المتجر العامة
 * بالتعديل في المكان (in-place) دون لمس app.js / data.js إطلاقاً،
 * ثم يُعيد استدعاء دوال العرض الموجودة، ويُرجِع نشاط العميل
 * إلى التحليلات عبر مراقبة DOM (غير تطفّلية).
 */
(function (root) {
  "use strict";
  var B = root.DealMakerBridge;
  if (!B) { console.warn("[store-adapter] bridge غير محمّل"); return; }

  function applyConfig(cfg) {
    if (!cfg) return;

    // المؤقت + المستويات — DEAL_CONFIG ثابت (const) فنُعدّل خواصّه في مكانه.
    if (root.DEAL_CONFIG) {
      if (cfg.timer && typeof cfg.timer.seconds === "number") {
        root.DEAL_CONFIG.timerSeconds = cfg.timer.seconds;
      }
      if (cfg.levels && cfg.levels.length && Array.isArray(root.DEAL_CONFIG.levels)) {
        var lv = cfg.levels.slice(0, 4).map(function (l, i) {
          return { name: l.name, icon: l.icon, need: i === 0 ? 0 : l.need };
        });
        root.DEAL_CONFIG.levels.splice.apply(root.DEAL_CONFIG.levels, [0, root.DEAL_CONFIG.levels.length].concat(lv));
        // تحديث أسماء عقد المستوى الظاهرة دون تغيير البنية.
        var nodes = root.document ? root.document.querySelectorAll(".lvl-node") : [];
        for (var i = 0; i < nodes.length; i++) {
          var nm = nodes[i].querySelector(".lvl-name");
          var dot = nodes[i].querySelector(".lvl-dot");
          if (lv[i]) {
            if (nm) nm.textContent = lv[i].name;
            if (dot && lv[i].icon) dot.textContent = lv[i].icon;
          }
        }
      }
    }

    // جوائز عجلة الحظ — تعديل المصفوفة في مكانها لبقاء المرجع.
    if (cfg.roulette && cfg.roulette.length && Array.isArray(root.ROULETTE_PRIZES)) {
      var keepImg = root.ROULETTE_PRIZES.map(function (p) { return p && p.img; });
      var prizes = cfg.roulette.map(function (r, i) {
        var o = { label: r.label, emoji: r.emoji || "🎁", weight: r.weight || 10 };
        if (r.discount) o.discount = r.discount;
        if (keepImg[i]) o.img = keepImg[i];
        return o;
      });
      root.ROULETTE_PRIZES.splice.apply(root.ROULETTE_PRIZES, [0, root.ROULETTE_PRIZES.length].concat(prizes));
    }

    // الحزم — نحتفظ بعناصر وصور المتجر الأصلية ونغيّر فقط
    // الاسم/الوصف ونستبعد غير المفعّل — حسب الترتيب.
    if (cfg.bundles && cfg.bundles.length && Array.isArray(root.BUNDLES) && root.__DJB_BUNDLES_BASE === undefined) {
      root.__DJB_BUNDLES_BASE = root.BUNDLES.map(function (b) { return JSON.parse(JSON.stringify(b)); });
    }
    if (cfg.bundles && cfg.bundles.length && Array.isArray(root.BUNDLES) && root.__DJB_BUNDLES_BASE) {
      var base = root.__DJB_BUNDLES_BASE;
      var next = [];
      for (var bi = 0; bi < base.length; bi++) {
        var meta = cfg.bundles[bi];
        if (meta && meta.active === false) continue;
        var clone = JSON.parse(JSON.stringify(base[bi]));
        if (meta) {
          if (meta.name) clone.name = meta.name;
          if (meta.tagline) clone.tagline = meta.tagline;
        }
        next.push(clone);
      }
      if (next.length === 0) next = base.map(function (b) { return JSON.parse(JSON.stringify(b)); });
      root.BUNDLES.splice.apply(root.BUNDLES, [0, root.BUNDLES.length].concat(next));
    }

    reRender();
    applyBubble(cfg);
  }

  function reRender() {
    try { if (typeof root.renderBundles === "function") root.renderBundles(); } catch (e) {}
    try { if (typeof root.renderProducts === "function") root.renderProducts(); } catch (e) {}
    try { if (typeof root.renderCart === "function") root.renderCart(); } catch (e) {}
    try {
      if (typeof root.updateLevels === "function" && root.State &&
          (root.State.mode === "ACTIVE" || root.State.mode === "REWARD")) {
        root.updateLevels();
      }
    } catch (e) {}
  }

  // رسائل الفقاعة: نغيّر نصّ الترحيب فقط حين تكون السلة فارغة
  // والوضع تمهيدي (لا نغيّر التدفّق ولا التصميم).
  function applyBubble(cfg) {
    if (!cfg || !cfg.bubble || !cfg.bubble.messages || !cfg.bubble.messages.length) return;
    var el = root.document && root.document.getElementById("bubbleText");
    if (!el) return;
    var empty = true;
    try { empty = typeof root.cartQtyTotal !== "function" || root.cartQtyTotal() === 0; } catch (e) {}
    var passive = !root.State || root.State.mode === "PASSIVE";
    if (empty && passive) {
      var chips = root.document.getElementById("bubbleChips");
      var hasChips = chips && !chips.classList.contains("hidden") && chips.children.length;
      if (!hasChips) el.textContent = cfg.bubble.messages[0];
    }
  }

  // —— الاتجاه العكسي: نشاط العميل → تحليلات اللوحة ——
  function watchActivity() {
    var doc = root.document;
    if (!doc) return;

    var cc = doc.getElementById("cartCount");
    if (cc) {
      var lastCount = cc.textContent;
      new MutationObserver(function () {
        if (cc.textContent !== lastCount) {
          var prev = parseInt(lastCount, 10) || 0;
          var now = parseInt(cc.textContent, 10) || 0;
          lastCount = cc.textContent;
          B.emit(now > prev ? "add_to_cart" : "cart_change", { count: now });
        }
      }).observe(cc, { childList: true, characterData: true, subtree: true });
    }

    var rm = doc.getElementById("rewardModal");
    if (rm) {
      new MutationObserver(function () {
        if (!rm.classList.contains("hidden")) {
          var lbl = doc.getElementById("rewardLabel");
          B.emit("reward_granted", { label: lbl ? lbl.textContent : "" });
        }
      }).observe(rm, { attributes: true, attributeFilter: ["class"] });
    }

    var cm = doc.getElementById("celebrateModal");
    if (cm) {
      new MutationObserver(function () {
        if (!cm.classList.contains("hidden")) B.emit("levels_unlocked", {});
      }).observe(cm, { attributes: true, attributeFilter: ["class"] });
    }

    var toasts = doc.getElementById("toasts");
    if (toasts) {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          for (var j = 0; j < muts[i].addedNodes.length; j++) {
            var n = muts[i].addedNodes[j];
            var t = (n && n.textContent) || "";
            if (t.indexOf("ترقّيت") > -1) B.emit("level_up", { text: t });
            else if (t.indexOf("استلم") > -1 || t.indexOf("الطلب") > -1) B.emit("order", { text: t });
          }
        }
      }).observe(toasts, { childList: true });
    }

    var orderModal = doc.getElementById("orderModal");
    if (orderModal) {
      new MutationObserver(function () {
        if (!orderModal.classList.contains("hidden")) B.emit("checkout", {});
      }).observe(orderModal, { attributes: true, attributeFilter: ["class"] });
    }
  }

  function start() {
    B.onConfig(function (cfg) { applyConfig(cfg); }, true);
    watchActivity();
    B.emit("store_connected", {});
  }

  if (root.document && root.document.readyState === "loading") {
    root.document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 0); });
  } else {
    setTimeout(start, 0);
  }
})(typeof window !== "undefined" ? window : this);
