---
description: إضافة تحويل جديد بين إعداد لوحة ومتغيّر متجر
argument-hint: "<اسم الإعداد ووصف الربط المطلوب>"
---

أضف تحويلاً جديداً: $ARGUMENTS

اتبع skill `sync-mapping` بالحرف:
1. حقل افتراضي في `DEFAULT_CONFIG` (`src/bridge.js`).
2. تحويل في `dashboardToConfig()` (`src/mapping.js`).
3. تطبيق in-place + إعادة عرض في `src/store-adapter.js`.
4. التقاط في `src/dashboard-adapter.js` إن لزم.

لا تلمس `newprojectzid` أو `zidprojectdashboard`. ثم شغّل `/sync-check`.
