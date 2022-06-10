import Dexie from 'dexie'

const db = new Dexie('__aggregation_db__')

export async function createTable(key: string) {
  db.close()
  db.version(Math.round(db.verno + 1)).stores({
    __self__: key,
  })
  await db.open()

  const table = db.table('__self__')

  return {
    table,
    async bulkAdd(arr: any[]) {
      await table.bulkAdd(arr)
    },
  }
}

export function destroyTable() {
  db.version(1).stores({
    __self__: null,
  })
}
