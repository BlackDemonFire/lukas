import { Bot } from './bot';
import { start } from './startclient';

const client: Bot = start()

client.login(client.config.token);