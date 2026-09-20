import { AppConfig } from "@/modules/settings.js";
import { Context, Effect, Layer, Random } from "effect";
import type { NoSuchElementError } from "effect/Cause";
import type { ConfigError } from "effect/Config";
import { CurrentLanguage } from "./CurrentLanguage.js";
import { deBase } from "./messages/de_DE.js";
import { deDsa } from "./messages/de_DSA.js";
import { enTde } from "./messages/en_TDE.js";
import { enBase } from "./messages/en_US.js";
import type { MessageKey, MessageParams } from "./types.js";

const base: Record<"de" | "en", Record<MessageKey, string | string[]>> = { en: enBase, de: deBase } as const;
const dsa: Record<"de" | "en", Record<MessageKey, string | string[]>> = {
  en: { ...enBase, ...enTde },
  de: { ...deBase, ...deDsa },
} as const;
const format = (locale: "de" | "en", template: string, params: Record<string, string | number | number[]>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) return `{${key}}`;
    if (Array.isArray(value)) return new Intl.ListFormat(locale).format(value.map(String));
    return String(value);
  });

export interface ParsedLanguage {
  locale: "en" | "de";
  variant: "default" | "dsa";
}
export const parseLanguage = (lang: string): ParsedLanguage => {
  const [language, variantRaw] = lang.split("_");

  const locale = language === "de" ? "de" : "en";

  const variant = variantRaw?.toLowerCase() === (locale === "de" ? "dsa" : "tde") ? "dsa" : "default";

  return { locale, variant };
};

export interface I18n {
  readonly t: {
    <K extends MessageKey>(key: K): Effect.Effect<string, ConfigError | NoSuchElementError, CurrentLanguage>;

    <K extends MessageKey>(
      key: K,
      params: MessageParams[K],
    ): Effect.Effect<string, ConfigError | NoSuchElementError, CurrentLanguage>;
  };
  supportedLanguages(): string[];
}

export const I18nService = Context.Service<I18n>("I18n");
export const I18nServiceLive = Layer.effect(
  I18nService,
  Effect.gen(function* () {
    const appCfg = yield* AppConfig;

    const resolve = (locale: "en" | "de", variant: "default" | "dsa", key: string) => {
      const table = variant === "dsa" ? dsa[locale] : base[locale];

      return table[key as keyof typeof table];
    };

    return {
      t: <K extends MessageKey>(key: K, params?: MessageParams[K]) =>
        Effect.gen(function* () {
          const lang = yield* CurrentLanguage;

          const { locale, variant } = parseLanguage(lang ?? appCfg.defaultLanguage);

          let template = resolve(locale, variant, key);

          if (!template) return key;
          if (typeof template !== "string") {
            template = yield* Random.choice(template);
          }

          return format(locale, template, params ?? {});
        }),
      supportedLanguages: () => ["de_DSA", "de_DE", "en_US", "en_TDE"],
    };
  }),
);
