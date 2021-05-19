import { Bot } from "bot"
import { Message, MessageEmbed } from "discord.js"
import { Command } from "../modules/command"

export default class Roll extends Command {
	constructor(client: Bot) {
		super(client);
	}
	help = {
		show: true,
		name: "roll",
		usage: `${this.prefix}roll [args]`,
		category: "Utility"
	}
	async run(client: Bot, message: Message, args: string[], language: language) {
		const msgauthor: string = message.author.username;
		//register args and variables

		var rollarga: string = args[0];
		var rollargb: string = args[1];
		const rollargerror: string = args[2];
		var rolltype: number = 0;
		var dicetype = "wx";
		var rollargs;

		if (args[0]) rollarga = rollarga.toLowerCase();
		if (args[1]) rollargb = rollargb.toLowerCase();

		if (!args[1] && args[0]) if (rollarga[0] !== "w" && rollarga[0] !== "d") {
			if (rollarga.includes("w")) {
				rollargs = rollarga.split("w");
				rollarga = rollargs[0];
				rollargb = `w${rollargs[1]}`;
				args[1] = rollargb;
			} else if (rollarga.includes("d")) {
				rollargs = rollarga.split("d");
				rollarga = rollargs[0];
				rollargb = `w${rollargs[1]}`;
				args[1] = rollargb;
			}
		}

		var rollcountcur = 0;
		var rollcountmax = "0";

		var gotDefault = false;
		var gotStringConverted = false;
		var detectedDiceType = false;
		var detectedOnlyOneArg = false;


		//validify arguments

		if (args[2]) return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.tooManyArgs + rollargerror);


		//two arguments
		var checkregex: RegExp = /w|d/;

		if (args[0] && args[1]) {
			if (checkregex.test(rollarga) && checkregex.test(rollargb)) return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.doubleDiceType);
			if (!checkregex.test(rollarga) && !checkregex.test(rollargb)) return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.doubleRollCount);

			//process two arguments
			if ((rollarga.indexOf("w") == 0) || (rollarga.indexOf("d") == 0)) {
				var dicetype = rollarga
				var rollcountmax = rollargb
			} else if ((rollargb.indexOf("w") == 0) || (rollargb.indexOf("d") == 0)) {
				var dicetype = rollargb
				var rollcountmax = rollarga
			} else return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.schroedingersArgument);
		}

		//process single argument

		if (args[0] && !args[1]) {

			var detectedOnlyOneArg = true

			if (rollarga.indexOf("w") == 0) {
				var dicetype = rollarga
				rollcountmax = "1"
				var detectedDiceType = true
			} else if (rollarga.indexOf("d") == 0) {
				var dicetype = rollarga
				rollcountmax = "1"
				var detectedDiceType = true
			} else {
				rolltype = 6
				rollcountmax = rollarga
			}
		}

		//no argument: insert default

		if (!args[0]) {
			rolltype = 6;
			var gotDefault = true;
			rollcountmax = "1";
		}

		//convert String dicetype to Const rolltype

		if (rolltype == 0 && dicetype == "wx") return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.noDiceType);

		if (rolltype == 0 && dicetype == "w0") return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.noSides);

		if (rolltype == 0 && dicetype == "d0") return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.noSides);

		if (rolltype == 0) {
			rolltype = parseInt(dicetype.substr(1));
			var gotStringReadyToConvert = true;
		}

		if (rolltype == 0) return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.rolltypeUndefined + " \n" + "gotDefault = " + gotDefault + "\n" + "gotStringReadyToConvert = " + gotStringReadyToConvert + "\n" + "detectedOnlyOneArg = " + detectedOnlyOneArg + "\n" + "detectedDiceType = " + detectedDiceType);

		if (rollcountmax == "0") {
			const plaintext = language.command.roll.results.noDice.plaintext.replace("{msgauthor}", msgauthor);
			const embed = new MessageEmbed()
				.setColor(0x36393E)
				.setDescription('<:info_1:498285998346731530> ' + language.command.roll.results.noDice.embed)
				.setFooter("@" + msgauthor);
			return message.channel.send("*" + plaintext + "*", embed);
		}
		//@ts-ignore
		if (isNaN(rollcountmax)) return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.rollcountNotNumeric)
		//roll the dice and display the result
		var rollresult: string = "";
		let useEmotes: boolean;
		var rollcount: number = parseInt(rollcountmax, 10);
		let result: number[] = await client.random.ints(1, rolltype, rollcount);
		result.forEach((num: number) => {
			if (rolltype < 10) {
				useEmotes = true;
				rollcountcur++;
				switch (num) {
					case 1:
						rollresult += "<:dice1:601727730320670721> ";
						break;
					case 2:
						rollresult += "<:dice2:601730229513355284> ";
						break;
					case 3:
						rollresult += "<:dice3:601730229563686921> ";
						break;
					case 4:
						rollresult += "<:dice4:601730229538390017> ";
						break;
					case 5:
						rollresult += "<:dice5:601730229781790720> ";
						break;
					case 6:
						rollresult += "<:dice6:601730229597372416> ";
						break;
					case 7:
						rollresult += "<:dice7:601730229119090700> ";
						break;
					case 8:
						rollresult += "<:dice8:601730229211496454> ";
						break;
					case 9:
						rollresult += "<:dice9:601730229337063425> ";
						break;
				}
				//		}
			} else {
				//separated numbers
				useEmotes = false;
				rollcountcur++;
				rollresult += (num);

				if (parseInt(rollcountmax) != rollcountcur) {
					rollresult += " | ";
				}
			} //else
		}) //forEach(num)
		//is the response too long?

		if (parseInt(rollcountmax) > 70) {
			return message.channel.send("<:warn_3:498277726604754946> " + language.command.roll.errors.tooManyDice)
		}

		//response

		if (rollcountmax == "1") {
			const plaintext = language.command.roll.results.singleDice.replace("{rolltype}", rolltype.toString());
			const embed = new MessageEmbed()
				.setColor(0x36393E)
				.setFooter("@" + msgauthor);
			if (useEmotes) {
				embed.setDescription(rollresult);
			} else {
				embed.setAuthor(rollresult);
			}

			return message.channel.send(plaintext, embed);
		} else {
			const plaintext = language.command.roll.results.multiDice.replace("{rolltype}", rolltype.toString()).replace("{rollcountmax}", rollcountmax.toString());
			const embed = new MessageEmbed()
				.setColor(0x36393E)
				.setFooter("@" + msgauthor);
			if (useEmotes) {
				embed.setDescription(rollresult);
			} else {
				embed.setAuthor(rollresult);
			}

			return message.channel.send(plaintext, embed);
		}

	}
}