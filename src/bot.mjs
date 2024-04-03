import OpenAI from 'openai'
import { Bot, session } from 'grammy'
import { freeStorage } from '@grammyjs/storage-free'

/**
 * @typedef {import('grammy').Context} Context
 * @typedef {import('@grammyjs/types').Chat} Chat
 * @typedef {import('grammy').SessionFlavor} SessionFlavor
 *
 * @typedef {{thread_id?: string} & Chat} SessionData
 * @typedef {Context & SessionFlavor<SessionData>} BotContext
 */

export const {
  OPENAI_API_KEY: apiKey,
  OPENAI_ASSISTANT_ID: assistant_id,

  // Telegram bot token from t.me/BotFather
  TELEGRAM_BOT_TOKEN: token,

  // Secret token to validate incoming updates
  TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(':').pop(),
} = process.env

const openai = new OpenAI({ apiKey })

// Default grammY bot instance
export const bot = /** @type {Bot<BotContext>} */ new Bot(token)

const safe = bot.errorBoundary(console.error)

const storage = freeStorage(bot.token)

safe.command('start', async ctx => {
  if (!ctx.match.startsWith('bizChat')) return
  const id = ctx.match.slice(7) // strip `bizChat`
  const session = await storage.read(id)
  await Promise.allSettled([
    openai.beta.threads.del(session?.thread_id),
    storage.delete(id),
  ])
  return ctx.reply(`Thread deleted`)
})

safe.use(session({ storage, initial: () => ({}) }))

// Sample handler for a simple echo bot
safe.on('business_message', async ctx => {
  if (!ctx.session.thread_id) {
    const name = [ctx.chat.title, ctx.chat.first_name, ctx.chat.last_name]
      .filter(Boolean)
      .join(' ')
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: `Меня зовут ${name}`,
        },
      ],
      metadata: ctx.chat,
    })
    ctx.session.thread_id = thread.id
  }
  const metadata = {
    date: ctx.msg.date,
    message_id: ctx.msg.message_id,
  }
  // Get information about the business connection.
  const conn = await ctx.getBusinessConnection()
  // Check who sent this message.
  if (ctx.from.id === conn.user.id)
    return openai.beta.threads.messages.create(ctx.session.thread_id, {
      content: ctx.msg.text,
      role: 'assistant',
      metadata,
    })
  // Your customer sent this message.
  await openai.beta.threads.messages.create(ctx.session.thread_id, {
    content: ctx.msg.text,
    role: 'user',
    metadata,
  })
  await ctx.replyWithChatAction('typing')
  const interval = setInterval(() => ctx.replyWithChatAction('typing'), 5_000)
  const stream = openai.beta.threads.runs
    .stream(ctx.session.thread_id, { assistant_id, metadata })
    .on('textDone', content => {
      clearInterval(interval)
      return ctx.reply(content.value, { parse_mode: 'Markdown' })
    })
  await stream.done()
})
