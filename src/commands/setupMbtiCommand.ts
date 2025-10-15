import { Telegraf, Context } from 'telegraf'
import { MESSAGE_TYPES, _sendMessage } from '../utils/sendMessage'
import { dataController, TableType, MbtiEntry } from '../utils/dataController'

const checkAndFormatMbtiString = (mbti: string): string | null => {
  const chars = mbti.toLowerCase()
  const valid =
    ['e', 'i', 'x'].includes(chars[0]) &&
    ['n', 's', 'x'].includes(chars[1]) &&
    ['f', 't', 'x'].includes(chars[2]) &&
    ['j', 'p', 'x'].includes(chars[3])

  if (!valid) return null

  // Format properly: uppercase for valid letters, lowercase for 'x'
  return chars
    .split('')
    .map((c) => (c === 'x' ? 'x' : c.toUpperCase()))
    .join('')
}

const printAllMbti = async (ctx: Context, mbtis: MbtiEntry[]) => {
  if (mbtis.length === 0) {
    await _sendMessage(ctx, MESSAGE_TYPES.text, `No MBTIs saved in this group yet.`)
    return
  }

  const list = mbtis.map((m) => `- ${m.userName}: ${m.mbti}`).join('\n')
  await _sendMessage(ctx, MESSAGE_TYPES.text, `All this group's MBTIs:\n${list}`)
}

const printHelp = async (ctx: Context) => {
  await _sendMessage(
    ctx,
    MESSAGE_TYPES.text,
    `List of commands:\n- /mbti help — Show this message\n- /mbti me — Show your MBTI\n- /mbti me XXXX — Add or change your MBTI`
  )
}

export const setupMbtiCommand = (bot: Telegraf<Context>) => {
  bot.command('mbti', async (ctx: Context) => {
    const chatId = String(ctx.chat?.id)
    const args = ctx.message?.text?.split(' ') ?? []

    // Load MBTI data for this chat
    const allMbti = dataController.getTable(chatId, TableType.MBTI)

    if (args.length === 1) {
      await printAllMbti(ctx, allMbti)
      return
    }

    const secondArg = args[1]?.toLowerCase()
    const thirdArg = args[2]

    switch (secondArg) {
      case 'help':
        await printHelp(ctx)
        break

      case 'me':
        if (!thirdArg) {
          const userId = String(ctx.from?.id)
          const userMbti = allMbti.find((m) => m.userId === userId)
          if (userMbti)
            await _sendMessage(ctx, MESSAGE_TYPES.text, `${userMbti.userName}, your MBTI is ${userMbti.mbti}.`)
          else await _sendMessage(ctx, MESSAGE_TYPES.text, `You don't have an MBTI set yet.`, { reply: true })
        } else {
          if (thirdArg.length !== 4) {
            await _sendMessage(ctx, MESSAGE_TYPES.text, `That's not an MBTI, baka.`, { reply: true })
            return
          }

          const formatted = checkAndFormatMbtiString(thirdArg)
          if (!formatted) {
            await _sendMessage(ctx, MESSAGE_TYPES.text, `That's not an MBTI, baka.`, { reply: true })
            return
          }

          // Remove old MBTI (if exists)
          await dataController.remove(chatId, TableType.MBTI, (entry) => entry.userId === String(ctx.from?.id))

          // Add new one
          await dataController.addMbti(chatId, String(ctx.from?.id), ctx.from?.first_name ?? 'Unknown', formatted)

          await _sendMessage(ctx, MESSAGE_TYPES.text, `${ctx.from?.first_name}'s MBTI is now ${formatted}`, {
            reply: true,
          })
        }
        break

      default:
        await _sendMessage(
          ctx,
          MESSAGE_TYPES.text,
          `Second argument can only be 'me' or 'help'.`,
          { reply: true }
        )
        break
    }
  })
}