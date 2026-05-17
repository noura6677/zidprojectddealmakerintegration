---
name: bridge-contract
description: توثيق وفحص عقد الـ bridge (config schema + أحداث). استخدمها عند تعديل بنية config أو أحداث المزامنة.
---

# Skill: bridge-contract

عقد الـ bridge (ثابت — أي تغيير يرفع `version`):

- مفتاح الإعداد: `djbridge:config:v1`
- مفتاح الأحداث: `djbridge:events:v1`
- قناة البث: BroadcastChannel `djbridge`
- config: `{ version, updatedAt, mode, timer{seconds,message,startOn},
  levels[{name,icon,need}], roulette[{label,emoji,weight,discount}],
  bundles[{id,name,tagline,active}], bubble{messages[]} }`
- الأحداث العكسية: store_connected, add_to_cart, cart_change,
  reward_granted, levels_unlocked, level_up, checkout, order.

عند أي تعديل: حدّث DEFAULT_CONFIG + mapping + المحوّلين معاً،
وحافظ على التوافق الخلفي (deepMerge مع الافتراضيات).
