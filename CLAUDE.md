# CLAUDE.md — سياق مشروع طبقة الربط (Deal Maker Integration)

## ما هذا المشروع؟
طبقة ربط **Frontend-only** تصل بين مشروعين Demo قائمين **ومكتملين**:

- **المتجر** `newprojectzid` — HTML/CSS/Vanilla JS ثابت. الإعدادات في `data.js`
  كمتغيّرات عامة: `DEAL_CONFIG` / `ROULETTE_PRIZES` / `BUNDLES`.
- **اللوحة** `zidprojectdashboard` — Next.js 16 / React 19. إعدادات Mock في
  `src/lib/sales-assistant-data.ts` ولوحات `src/components/sales-assistant/panels.tsx`.
- **الربط** (هذا المستودع) — يوصّلهما دون لمس أي ملف فيهما.

الموقعان على نفس الـ origin (`noura6677.github.io`) → يتشاركان `localStorage`
تلقائياً، وهذا أساس المزامنة.

## البنية
- `src/bridge.js` — SDK المزامنة (config + ناقل أحداث عكسي).
- `src/mapping.js` — خريطة التحويل المركزية لوحة ↔ متجر (دوال نقية).
- `src/store-adapter.js` — يُطبّق الإعدادات على متغيّرات المتجر in-place.
- `src/dashboard-adapter.js` — يلتقط تعديلات التاجر ويكتبها في الـ bridge.
- `hub/index.html` — SaaS Hub يضمّن المشروعين ويحقن الـ bridge (صفر تعديل).
- `loader/` — سطر تحميل اختياري (لا يُطبّق إلا بإذن صريح).

## قيود صارمة (غير قابلة للتجاوز)
1. **ممنوع** تعديل أي ملف داخل `newprojectzid` أو `zidprojectdashboard`.
2. **ممنوع** تغيير التصميم/الهوية/الأنيميشن/التدفّق/المكوّنات الحالية.
3. **ممنوع** Backend أو APIs أو قواعد بيانات — Vanilla JS + localStorage فقط.
4. كل العمل داخل هذا المستودع فقط، وبإضافة بحتة غير تطفّلية.
5. المحوّلات تُعدّل المتغيّرات in-place (splice) وتستدعي دوال العرض
   الموجودة — لا تعيد بناء أي شيء.

## التشغيل
```bash
python3 -m http.server 8000   # http://localhost:8000/hub/
```
الفرع: `claude/review-constraints-ThJOO`.

## عند أي مهمة جديدة
- أي تحويل جديد يُضاف في `src/mapping.js` فقط.
- شغّل `/verify-noninvasive` و `/sync-check` قبل أي دفع.
- إن لزم لمس المشروعين — توقّف واسأل أولاً.
