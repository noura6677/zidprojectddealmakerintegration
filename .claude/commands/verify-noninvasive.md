---
description: التأكد أن العمل غير تطفّلي ولا يمسّ المشروعين
---

شغّل وكيل `integration-auditor` وأعد تقريره.

تحقّق يدوياً أيضاً:
- لا مسار في التغييرات يحوي `newprojectzid` أو `zidprojectdashboard`.
- لا Backend/API/DB — Vanilla JS فقط.
- المحوّلات تعدّل in-place وتستدعي دوال عرض موجودة فقط.

أخرج: مطابق / غير مطابق مع الأسباب.
