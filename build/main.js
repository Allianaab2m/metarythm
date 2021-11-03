"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const discord_music_player_1 = require("discord-music-player");
// dotenv初期設定
dotenv_1.default.config();
// botバージョン指定 そこまで意味はない
const bot_version = `0.1.0 Beta ${process.argv[2] ? '- Debug Mode' : ''}`;
// prefix
const prefix = 'm.';
// Clientオブジェクトの作成
const client = new discord_js_1.Client({
    intents: 32767,
});
// Playerオブジェクトの作成
const player = new discord_music_player_1.Player(client, {
    leaveOnEmpty: true,
    leaveOnStop: false,
    deafenOnJoin: true,
});
// bot準備完了時の処理
client.once('ready', () => {
    var _a;
    console.log('Ready!');
    console.log(`MetaRythm Ver${bot_version}`);
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
});
// メッセージ受信時の処理
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // bot,prefix無し,Guild以外のメッセージを弾く
    if (message.author.bot)
        return;
    if (!message.content.startsWith(prefix))
        return;
    if (!message.guild)
        return;
    // コマンドと引数を分割
    const [command, ...args] = message.content.slice(prefix.length).split(' ');
    let guildQueue = player.createQueue(message.guild.id);
    switch (command) {
        case 'play':
            const url = args[0];
            let queue = player.createQueue(message.guild.id);
            // ごめん，TypeScript as使うしか無かったんだ...
            yield queue.join((_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel); // TODO Embedで曲情報表示
            let song = yield queue.play(url).catch(() => {
                if (!guildQueue) {
                    queue.stop();
                }
            });
            break;
        case 'stop':
            guildQueue === null || guildQueue === void 0 ? void 0 : guildQueue.setPaused(!guildQueue.paused); // TODO Embedにする
            break;
        case 'skip':
            guildQueue === null || guildQueue === void 0 ? void 0 : guildQueue.skip(); // TODO Embedにする
            break;
        case 'disconnect':
            guildQueue.destroy();
            break;
        case 'queue':
            message.channel.send(guildQueue.songs.toString()); //TODO Embedにする
            break;
        case 'shuffle':
            guildQueue === null || guildQueue === void 0 ? void 0 : guildQueue.shuffle(); // TODO Embedにする
            break;
        default:
            break;
    }
}));
client.login(process.env.DISCORD_BOT_TOKEN);
