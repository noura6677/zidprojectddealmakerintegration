# دمج اختياري في لوحة التاجر (zidprojectdashboard)

> اختياري تماماً. الـ Hub يغني عنه دون لمس اللوحة. هذا مجرد بديل
> إن رغبت بمزامنة مباشرة عند فتح اللوحة منفردةً.

لأن اللوحة Next.js، يُضاف السكربت عبر `<Script>` في الجذر
`src/app/layout.tsx` (سطر واحد، دون أي تغيير تصميمي):

```tsx
import Script from "next/script";
// داخل <body> :
<Script src="https://noura6677.github.io/zidprojectddealmakerintegration/src/bridge.js" strategy="afterInteractive" />
<Script src="https://noura6677.github.io/zidprojectddealmakerintegration/src/mapping.js" strategy="afterInteractive" />
<Script src="https://noura6677.github.io/zidprojectddealmakerintegration/src/dashboard-adapter.js" strategy="afterInteractive" />
```

لا تعدّل أي ملف آخر. وفق القيود المتفق عليها، لا يُطبّق هذا الدمج
إلا بإذن صريح منك — الافتراضي هو الـ Hub المعزول.
