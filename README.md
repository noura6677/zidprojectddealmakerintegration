# Deal Maker AI — طبقة الربط (Integration Bridge)

طبقة ربط **Frontend-only** تصل بين مشروعين Demo قائمين **دون تعديل أي ملف فيهما**:

- **متجر نجدية:** https://noura6677.github.io/newprojectzid/
- **لوحة تحكم Deal Maker AI:** https://noura6677.github.io/zidprojectdashboard/

> هذا المستودع لا يحتوي على Backend ولا APIs ولا قواعد بيانات. المزامنة تتم
> عبر `localStorage` + `BroadcastChannel` + `storage events` فقط، لأن الموقعين
> منشوران على نفس الـ origin (`noura6677.github.io`).

## الفكرة

عندما يغيّر التاجر أي إعداد في لوحة التحكم (الحزم، المستويات، عجلة الحظ،
المؤقت، رسائل الببل، الوضع) ينعكس مباشرة داخل متجر نجدية — ويعود نشاط
العميل (إضافة للسلة، مكافأة، ترقية) إلى تحليلات اللوحة.

## البنية

```
src/bridge.js            ← SDK المزامنة المشترك (config + events)
src/mapping.js           ← خريطة التحويل لوحة ↔ متجر (مركزية)
src/store-adapter.js     ← يطبّق الإعدادات على متغيّرات المتجر (بلا لمس app.js)
src/dashboard-adapter.js ← يلتقط تعديلات اللوحة ويكتبها في الـ bridge
hub/index.html           ← SaaS Hub: يضمّن المشروعين ويحقن الـ bridge (صفر تعديل)
loader/                  ← سطر تحميل اختياري لو رغبت بدمجه داخل المشروعين لاحقاً
```

## التشغيل

```bash
python3 -m http.server 8000   # ثم افتح http://localhost:8000/hub/
```

أو انشر المستودع على GitHub Pages وافتح `/hub/`.

## القيود الصارمة

راجع `CLAUDE.md` و `RULES.md`. باختصار: ممنوع تعديل تصميم/سلوك/تنفيذ
المشروعين. كل العمل هنا فقط، وبإضافة بحتة غير تطفّلية.
