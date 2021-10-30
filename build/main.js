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
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const dotenv_1 = __importDefault(require("dotenv"));
const adapter_1 = require("./adapter");
dotenv_1.default.config();
const bot_version = `0.1.0 Beta ${process.argv[2] ? '- Debug Mode' : ''}`;
const prefix = 'm.';
const client = new discord_js_1.Client({
    intents: 32767,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
client.once('ready', () => {
    var _a;
    console.log('Ready!');
    console.log(`MetaRythm Ver${bot_version}`);
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
});
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // bot,prefix無し,Guild以外のメッセージを弾く
    if (message.author.bot)
        return;
    if (!message.content.startsWith(prefix))
        return;
    if (!message.guild)
        return;
    const [command, ...args] = message.content.slice(prefix.length).split(' ');
    switch (command) {
        case 'play':
            const url = args[0];
            // url無い時，VCに入っていない時,videoIDが取れない時のコマンドは弾く
            if (!url) {
                message.channel.send('URLが指定されていないようです。'); // Embed
                return;
            }
            if (((_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel) === null) {
                message.channel.send('VCに入っていないようです。'); // Embed Ref1
                return;
            }
            if (!ytdl_core_1.default.validateURL(url)) {
                message.channel.send('URLが正しくないようです。'); // Embed
                return;
            }
            const authorVoiceChannel = (_b = message.member) === null || _b === void 0 ? void 0 : _b.voice.channel;
            if (!authorVoiceChannel) {
                message.channel.send('VCに入っていないようです。'); // Embed Ref1
                return;
            }
            const connection = (0, voice_1.joinVoiceChannel)({
                adapterCreator: (0, adapter_1.createDiscordJSAdapter)(authorVoiceChannel),
                channelId: authorVoiceChannel.id,
                guildId: authorVoiceChannel.guild.id,
                selfDeaf: true,
                selfMute: false,
            });
            const player = (0, voice_1.createAudioPlayer)();
            connection.subscribe(player);
            const stream = (0, ytdl_core_1.default)(ytdl_core_1.default.getURLVideoID(url), {
                filter: (format) => format.audioCodec === 'opus' && format.container === 'webm',
                quality: 'highest',
                highWaterMark: 32 * 1024 * 1024,
            });
            const resource = (0, voice_1.createAudioResource)(stream, {
                inputType: voice_1.StreamType.WebmOpus
            });
            player.play(resource);
            yield (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Playing, 10 * 1000);
            yield (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
            connection.destroy();
            break;
        default:
            break;
    }
}));
client.login(process.env.DISCORD_BOT_TOKEN);
