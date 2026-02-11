import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { api } from "@/api/client";

export type LocaleData = Record<string, unknown>;
export type LocaleCode = "ru" | "uz" | "en";

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  ru: "Русский",
  uz: "O'zbekcha",
  en: "English",
};

export const useLocalesStore = defineStore("locales", () => {
  const locales = ref<Record<string, LocaleData>>({});
  const availableLocales = ref<string[]>([]);
  const activeLocale = ref<string>("ru");
  const loading = ref(false);

  const currentLocaleData = computed(
    () => locales.value[activeLocale.value] ?? {},
  );

  async function fetchLocales() {
    loading.value = true;
    try {
      locales.value = await api<Record<string, LocaleData>>("/locales");
      const keys = Object.keys(locales.value);
      availableLocales.value = keys;
      if (keys.length > 0 && !keys.includes(activeLocale.value)) {
        activeLocale.value = keys[0] ?? "ru";
      }
    } finally {
      loading.value = false;
    }
  }

  async function fetchAvailableLocales() {
    availableLocales.value = await api<string[]>("/locales/available");
  }

  function setActiveLocale(code: string) {
    activeLocale.value = code;
  }

  async function updateValue(locale: string, path: string, value: string) {
    await api("/locales/entry", {
      method: "PUT",
      body: JSON.stringify({ locale, key: path, value }),
    });

    if (!locales.value[locale]) {
      locales.value[locale] = {};
    }

    const keys = path.split(".");
    let current = locales.value[locale] as Record<string, unknown>;

    for (let i = 0; i < keys.length - 1; i += 1) {
      const key = keys[i];
      if (!key) {
        continue;
      }

      if (
        current[key] === undefined ||
        current[key] === null ||
        typeof current[key] !== "object"
      ) {
        current[key] = {};
      }

      current = current[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
  }

  async function uploadBrandingLogo(locale: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const result = await api<{ locale: string; key: string; value: string }>(
      `/locales/branding/logo/${locale}`,
      {
        method: "POST",
        body: formData,
      },
    );

    await updateValue(result.locale, result.key, result.value);
    return result.value;
  }

  function getNestedValue(obj: Record<string, unknown>, path: string): string {
    const keys = path.split(".");
    let current: unknown = obj;

    for (const key of keys) {
      if (!current || typeof current !== "object") {
        return "";
      }
      current = (current as Record<string, unknown>)[key];
    }

    return typeof current === "string" ? current : "";
  }

  function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
    const result: string[] = [];

    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === "object") {
        result.push(...flattenKeys(value as Record<string, unknown>, fullKey));
      } else {
        result.push(fullKey);
      }
    }

    return result;
  }

  return {
    locales,
    availableLocales,
    activeLocale,
    loading,
    currentLocaleData,
    fetchLocales,
    fetchAvailableLocales,
    setActiveLocale,
    updateValue,
    uploadBrandingLogo,
    getNestedValue,
    flattenKeys,
  };
});
