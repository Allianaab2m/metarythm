import { Client, GuildChannelResolvable }from 'discord.js'
import dotenv from 'dotenv'
import { Player, Queue } from 'discord-music-player'


// dotenv初期設定
dotenv.config()

// botバージョン指定 そこまで意味はない
const bot_version = `0.1.0 Beta ${process.argv[2] ? '- Debug Mode' : ''}`

// prefix
const prefix = 'm.'

// Clientオブジェクトの作成
const client = new Client({
   intents: 32767,
})

// Playerオブジェクトの作成
const player = new Player(client, {
   leaveOnEmpty: true,
   leaveOnStop: false,
   deafenOnJoin: true,
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
   let guildQueue: Queue = player.createQueue(message.guild.id)

   switch (command) {
      case 'play':
         const url = args[0]
         let queue = player.createQueue(message.guild.id)

         // ごめん，TypeScript as使うしか無かったんだ...
         await queue.join(message.member?.voice.channel as GuildChannelResolvable) // TODO Embedで曲情報表示
         let song = await queue.play(url).catch(() => {
            if (!guildQueue) {
               queue.stop()
            }
         })
         break

      case 'stop':
         guildQueue?.setPaused(!guildQueue.paused) // TODO Embedにする
         break

      case 'skip':
         guildQueue?.skip() // TODO Embedにする
         break

      case 'disconnect':
         guildQueue.destroy()
         break

      case 'queue':
         message.channel.send(guildQueue.songs.toString()) //TODO Embedにする
         break
      
      case 'shuffle':
         guildQueue?.shuffle() // TODO Embedにする
         break

      default:
         break
   }
})

client.login(process.env.DISCORD_BOT_TOKEN)