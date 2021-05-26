import * as chalk from "chalk";
export class Logger {
    logSilly: boolean;
    logEval: boolean;
    logError: boolean;
    constructor(logopts: config["logging"]) {
        Object.assign(this, logopts)
    }
    log(...args) {
        if (!this.logSilly) return
        console.log(chalk.blueBright(...args))
    }
    eval(user: string, code: string) {
        if (!this.logEval) return
        console.log(chalk.green(user) + " evaled " + chalk.whiteBright(code))
    }
    evalOut(user: string, code: string, result: any) {
        if (!this.logEval) return
        console.log(chalk.green(user) + " evaled " + chalk.whiteBright(code)+ "\n" + chalk.yellow(typeof result) + ": " + chalk.greenBright(result))
    }
    evalError(user: string, code: string, err: string) {
        if (!this.logEval) return
        console.log(chalk.green(user) + " evaled " + chalk.whiteBright(code) + "\n" + chalk.red(err))
    }
    error(e: Error) {
        if (!this.logError) return
        console.error(chalk.red(e));
    }
}