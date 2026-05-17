---
name: sync-mapping
description: إضافة أو فحص تحويل جديد بين إعداد في لوحة التاجر ومتغيّر في المتجر. استخدمها عندما تريد ربط إعداد جديد بالمتجر.
---

# Skill: sync-mapping

عند إضافة تحويل جديد:

1. أضف الحقل إلى `DEFAULT_CONFIG` في `src/bridge.js` بقيمة افتراضية آمنة.
2. أضف التحويل في `dashboardToConfig()` داخل `src/mapping.js` فقط.
3. طبّقه في `src/store-adapter.js` بتعديل المتغيّر in-place (splice/خاصية)
   ثم استدعاء دالة العرض المناسبة الموجودة (renderProducts/renderCart/...).
4. لا تعدّل أي ملف في المشروعين. لا تغيّر بنية DOM أو تصميم.
5. شغّل mapping-verifier و `/sync-check`.

قاعدة: المتجر يحوي 4 عقد مستوى ثابتة؛ لا تتجاوزها. أول مستوى need=0.
