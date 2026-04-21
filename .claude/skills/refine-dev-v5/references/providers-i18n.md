---
title: i18n Provider — Internationalization
impact: LOW
tags: i18n, internationalization, useTranslation, translate, changeLocale, getLocale, locale
---

## i18n Provider

Enables multi-language support. Refine automatically translates all built-in UI text (button labels, page titles, notifications) through this provider.

---

## Provider Interface

```typescript
interface I18nProvider {
  translate: (key: string, options?: any, defaultMessage?: string) => string;
  changeLocale: (lang: string, options?: any) => Promise<any>;
  getLocale: () => string;
}
```

---

## Registration

```typescript
<Refine i18nProvider={i18nProvider} />
```

---

## Example with next-i18next

```typescript
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

const i18nProvider: I18nProvider = {
  translate: (key, options, defaultMessage) => {
    const { t } = useTranslation();
    return t(key, options) ?? defaultMessage ?? key;
  },
  changeLocale: async (lang) => {
    await i18n.changeLanguage(lang);
  },
  getLocale: () => i18n.language
};
```

---

## `useTranslation()` — Access i18n Methods

```typescript
import { useTranslation } from "@refinedev/core";

const { translate, changeLocale, getLocale } = useTranslation();

// Translate a key
const label = translate("products.fields.name", "Name");

// With interpolation options
translate("products.count", { count: 5 }, "5 Products");

// Switch locale
await changeLocale("tr");

// Get current locale
const current = getLocale();  // "en", "tr", etc.
```

---

## Built-In Translation Keys

Refine uses structured keys for its own UI:

```
buttons.create     → "Create"
buttons.edit       → "Edit"
buttons.delete     → "Delete"
buttons.save       → "Save"
pages.login.title  → "Sign in to your account"
pages.error.404    → "Sorry, the page you visited does not exist"
notifications.createSuccess  → "Successfully created {resource}"
notifications.editSuccess    → "Successfully edited {resource}"
notifications.deleteSuccess  → "Successfully deleted {resource}"
```

Override these in your translation files to customize all built-in UI text.
