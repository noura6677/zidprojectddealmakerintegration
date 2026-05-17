---
description: فحص توافق المزامنة بين bridge و mapping والمحوّلين
---

تحقّق من تسلسل المزامنة:

1. اقرأ `src/bridge.js` و `src/mapping.js` و `src/store-adapter.js` و `src/dashboard-adapter.js`.
2. تأكد أن كل حقل في `DEFAULT_CONFIG` له تحويل في mapping وتطبيق في store-adapter.
3. تأكد أن dashboard-adapter يبذر ويكتب بنفس الشكل.
4. تأكد أن الأحداث العكسية متسقة بين store-adapter و hub.

أخرج قائمة بأي فجوات. لا تعدّل ملفات المشروعين.
