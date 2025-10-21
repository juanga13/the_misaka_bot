import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

// ===== Types =====

export enum TableType {
  BIRTHDAY = 'birthday',
  ANIME_AIRING = 'animeAiringUpdate',
  TODOS = 'todos',
  MBTI = 'mbti',
}

export interface BirthdayEntry {
  userId: string
  userName: string
  date: string // format: dd/mm
  customMessage?: string
}

export interface AnimeAiringEntry {
  name: string
  lastEpisode: number
  malId: number
}

export interface TodoEntry {
  text: string
  checked: boolean
}

export interface MbtiEntry {
  userId: string
  userName: string
  mbti: string
}

export interface ChatData {
  [TableType.BIRTHDAY]: BirthdayEntry[]
  [TableType.ANIME_AIRING]: AnimeAiringEntry[]
  [TableType.TODOS]: TodoEntry[]
  [TableType.MBTI]: MbtiEntry[]
}

export interface DatabaseSchema {
  [chatId: string]: ChatData
}

// ===== Controller =====

export class DataController {
  private db: Low<DatabaseSchema>

  constructor(path = 'data.json') {
    const adapter = new JSONFile<DatabaseSchema>(path)
    this.db = new Low(adapter, {})
  }

  async init(): Promise<void> {
    await this.db.read()
    this.db.data ||= {}
  }

  // ✅ Ensure structure for chat exists
  private ensureChat(chatId: string): void {
    if (!this.db.data![chatId]) {
      this.db.data![chatId] = {
        [TableType.BIRTHDAY]: [],
        [TableType.ANIME_AIRING]: [],
        [TableType.TODOS]: [],
        [TableType.MBTI]: [],
      }
    }
  }

  // ✅ Get full data for one chat
  getChat(chatId: string): ChatData {
    this.ensureChat(chatId)
    return this.db.data![chatId]
  }

  // ✅ Generic table getter
  getTable<T extends TableType>(chatId: string, table: T): ChatData[T] {
    this.ensureChat(chatId)
    return this.db.data![chatId][table]
  }

  // ✅ Generic adder
  async add<T extends TableType>(chatId: string, table: T, record: ChatData[T][number]): Promise<void> {
    this.ensureChat(chatId)
    this.db.data![chatId][table].push(record as any)
    await this.db.write()
  }

  // ✅ Generic remover with predicate
async remove<T extends TableType>(
  chatId: string,
  table: T,
  predicate: (record: ChatData[T][number], index: number) => boolean
): Promise<void> {
  this.ensureChat(chatId)
  const tableData = this.db.data![chatId][table]
  this.db.data![chatId][table] = tableData.filter((r, i) => !predicate(r, i)) as unknown as ChatData[T]
  await this.db.write()
}

  // ✅ Read all
  async readAll(): Promise<DatabaseSchema> {
    await this.db.read()
    return this.db.data!
  }

  // ✅ Write all (replace)
  async writeAll(newData: DatabaseSchema): Promise<void> {
    this.db.data = newData
    await this.db.write()
  }

  // ===== Specific helpers =====

  async addBirthday(chatId: string, userId: string, userName: string, date: string): Promise<void> {
    const exists = this.getTable(chatId, TableType.BIRTHDAY).some(b => b.userName === userName)
    if (!exists) {
      await this.add(chatId, TableType.BIRTHDAY, { userId, userName, date })
    }
  }

  async addAnime(chatId: string, name: string, lastEpisode: number, malId: number): Promise<void> {
    const exists = this.getTable(chatId, TableType.ANIME_AIRING).some(a => a.malId === malId)
    if (!exists) {
      await this.add(chatId, TableType.ANIME_AIRING, { name, lastEpisode, malId })
    }
  }

  async addTodo(chatId: string, text: string, checked = false): Promise<void> {
    await this.add(chatId, TableType.TODOS, { text, checked })
  }

  async addMbti(chatId: string, userId: string, userName: string, mbti: string): Promise<void> {
    await this.add(chatId, TableType.MBTI, { userId, userName, mbti })
  }
}

// Export singleton instance
export const dataController = new DataController()