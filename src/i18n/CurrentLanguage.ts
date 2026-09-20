import { Context } from "effect";

export class CurrentLanguage extends Context.Service<CurrentLanguage, string>()("CurrentLanguage") {}
