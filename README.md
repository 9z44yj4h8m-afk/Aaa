# ALMOGHANI LIVE — الموقع الكامل على GitHub

يحتوي هذا المستودع على **نسخة الموقع الحالية** بجميع ملفات HTML والقنوات، وكذلك رابط Git مباشر إلى **مشروع Lovable الكامل**.

## 1. الموقع الأساسي
- `index.html`: واجهة الموقع ومشغل البث
- `admin.html` و`admin.js` و`admin/index.html`: لوحة التحكم
- `control.js` و`site-config.js`: إعدادات الموقع
- `channels-arabic.m3u` وملفات M3U الأخرى: قوائم القنوات
- `design-backups/`: نسخ التصميم السابقة
- الصور والملفات الأخرى محفوظة في جذر المستودع

## 2. ملفات Lovable/React كاملة
مجلد **`lovable-app/`** هو Git submodule يرتبط بمستودع
[almoghani-net-22](https://github.com/9z44yj4h8m-afk/almoghani-net-22)
عند الالتزام `6fa834fcee863dd51729a405a05a91cea7ab3b85`.

يمكن فتح المجلد من GitHub لرؤية المشروع الكامل (المشغل، الأقسام، لوحة التحكم، IPTV، القنوات، الصور، Android، وملفات المشروع).

لاستلام جميع الملفات محليًا مع المجلد المرتبط:

```bash
git clone --recurse-submodules https://github.com/9z44yj4h8m-afk/Aaa.git
```

**مهم:** هذا المجلد مرتبط بالمصدر ولا يعني أن مئات ملفات Lovable نُسخت مستقلّة إلى مستودع Aaa. للحفظ المستقل يمكن استخدام workflow `import-lovable-site.yml` بعد تفعيل GitHub Actions.

## النشر
لم يتم نقل ربط `almoghani.net` من مستودع `Z`، للحفاظ على عمل الموقع الحالي. تستطيع نشر نسخة Aaa على GitHub Pages بعد ضبط إعدادات الاستضافة.

هذه الملفات المصدرية لا تتضمن نسخًا من بيانات قاعدة Supabase أو حسابات العملاء والاشتراكات. لا تشارك روابط بث خاصة أو بيانات دخول ضمن مستودع عام.
