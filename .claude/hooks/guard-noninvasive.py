#!/usr/bin/env python3
"""PreToolUse guard: يمنع أي كتابة/تعديل على ملفات المشروعين الأصليين.
يقرأ حمولة الأداة من stdin، ويُخرج كود غير صفري لرفض العملية.”"""
import json
import sys

BLOCKED = ("newprojectzid", "zidprojectdashboard")

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

tool_input = (data or {}).get("tool_input", {}) or {}
path = tool_input.get("file_path") or tool_input.get("path") or ""

for name in BLOCKED:
    if name in str(path):
        sys.stderr.write(
            "✖ مرفوض: ممنوع تعديل ملفات المتجر أو لوحة التاجر.\n"
            "كل العمل يجب أن يبقى داخل مستودع الربط فقط (RULES.md).\n"
        )
        sys.exit(2)

sys.exit(0)
