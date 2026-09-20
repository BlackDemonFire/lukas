import { sendMessage } from "@/discord/sendMessage";
import { I18nService } from "@/i18n/I18n";
import { isOwner } from "@/modules/command";
import { AppConfig } from "@/modules/settings";
import { SettingsRepository } from "@/repositories/SettingsRepository";
import { declareCommand } from "@/types.js";
import { Message, PermissionFlagsBits } from "discord.js";
import { Effect } from "effect";

export const LangCommand = declareCommand({
  summary: "command.lang.description",
  usage: Effect.gen(function* () {
    const settings = yield* AppConfig;
    return `${settings.prefix}lang <lang>`;
  }),
  name: "lang",
  category: "Settings",
  run: Effect.fn("LangCommand.run")(function* (message: Message, args: string[]) {
    const { channel } = message;
    if (!channel.isSendable()) {
      yield* Effect.logError(`channel ${message.channel.id} is not sendable`);
      return;
    }
    const i18n = yield* I18nService;
    let newLang: string;
    let languages: string = "";
    if (!message.inGuild()) {
      const msg = yield* i18n.t("general.guildOnly");
      yield* sendMessage(channel, { content: msg });
      return;
    }
    const messageAuthorIsOwner = yield* isOwner(message.author);
    if (!(message.member!.permissions.has(PermissionFlagsBits.Administrator) || messageAuthorIsOwner)) {
      const msg = yield* i18n.t("command.lang.permissionError");
      yield* sendMessage(channel, { content: msg });
      return;
    }
    if (!args || args.length === 0) {
      newLang = "";
    } else {
      newLang = args.join(" ");
    }
    const and = yield* i18n.t("general.and");
    const supportedLanguages = i18n.supportedLanguages();
    if (!supportedLanguages.includes(newLang)) {
      switch (supportedLanguages.length) {
        case 1:
          languages = supportedLanguages[0]!;
          break;
        case 2:
          languages = supportedLanguages.join(` ${and} `);
          break;
        default:
          languages = `${supportedLanguages
            .slice(0, -1)
            .map((langName) => `\`${langName}\``)
            .join(", ")} ${and} \`${supportedLanguages.slice(-1).join(",")}\``;
          break;
      }
      const msg = yield* i18n.t("command.lang.noSuchLanguage", { languages });
      yield* sendMessage(channel, { content: msg });
      return;
    }
    const settingsRepo = yield* SettingsRepository;
    yield* settingsRepo.setLang(message.guild, newLang);
    const successMsg = yield* i18n.t("command.lang.success", { lang: newLang });
    yield* sendMessage(channel, { content: successMsg });
  }),
});
