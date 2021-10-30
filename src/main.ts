import { Client, VoiceChannel, StageChannel }from 'discord.js'
import { entersState, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType, AudioPlayer  } from '@discordjs/voice'
import ytdl from 'ytdl-core'
import dotenv from 'dotenv'
import { createDiscordJSAdapter } from './adapter'

// dotenv初期設定
dotenv.config()

// botバージョン指定 そこまで意味はない
const bot_version = `0.1.0 Beta ${process.argv[2] ? '- Debug Mode' : ''}`

// prefix
const prefix = 'm.'

// Clientオブジェクトの作成
const client = new Client({
   intents: 32767,
   partials: ['MESSAGE', 'CHANNEL', 'REACTION']
})

// bot準備完了時の処理
client.once('ready', () => {
   console.log('Ready!')
   console.log(`MetaRythm Ver${bot_version}`)
   console.log(`Logged in as ${client.user?.tag}`)
})

// メッセージ受信時の処理
client.on('messageCreate', async (message) => {
   // bot,prefix無し,Guild以外のメッセージを弾く
   if (message.author.bot) return
   if (!message.content.startsWith(prefix)) return
   if (!message.guild) return

   // コマンドと引数を分割
   const [command, ...args] = message.content.slice(prefix.length).split(' ')
   switch (command) {
      case 'play':
         const url = args[0]
         // url無い時，VCに入っていない時,videoIDが取れない時のコマンドは弾く
         if (!url) {
            message.channel.send('URLが指定されていないようです。') // Embed
            return
         }
         if (message.member?.voice.channel === null) {
            message.channel.send('VCに入っていないようです。') // Embed Ref1
            return
         }
         if (!ytdl.validateURL(url)) {
            message.channel.send('URLが正しくないようです。') // Embed
            return
         }
         // StageChannelだった時困るのでasで強制変換
         const authorVoiceChannel = message.member?.voice.channel as VoiceChannel

         // connection作成(D.js Jpの記事参照)
         const connection = joinVoiceChannel({
            adapterCreator: createDiscordJSAdapter(authorVoiceChannel),
            channelId: authorVoiceChannel.id,
            guildId: authorVoiceChannel.guild.id,
            selfDeaf: true,
            selfMute: false,
         })

         const player: AudioPlayer = createAudioPlayer()
         connection.subscribe(player)

         const stream = ytdl(ytdl.getURLVideoID(url), {
            filter: (format) => format.audioCodec === 'opus' && format.container === 'webm',
            quality: 'highest',
            highWaterMark: 32 * 1024 * 1024,
         })

         const resource = createAudioResource(stream, {
            inputType: StreamType.WebmOpus
         })

         player.play(resource)

         await entersState(player, AudioPlayerStatus.Playing, 10 * 1000)
         await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000)

         connection.destroy()
         break

      default:
         break
   }
})

client.login(process.env.DISCORD_BOT_TOKEN)