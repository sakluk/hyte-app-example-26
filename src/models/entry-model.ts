// Note: db functions are async and must be called with await from the controller
// How to handle errors in controller?
import promisePool from '../utils/database.js';
import type {RowDataPacket, ResultSetHeader} from 'mysql2';
import type {DiaryEntry} from '../types/index.js';

const listAllEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const [rows] = await promisePool.query<RowDataPacket[]>('SELECT * FROM DiaryEntries');
    return rows as DiaryEntry[];
  } catch (e) {
    const err = e as Error;
    console.error('error', err.message);
    return [];
  }
};

const listAllEntriesByUserId = async (id: number): Promise<DiaryEntry[]> => {
  try {
    const sql = 'SELECT * FROM DiaryEntries WHERE user_id = ?';
    const [rows] = await promisePool.execute<RowDataPacket[]>(sql, [id]);
    return rows as DiaryEntry[];
  } catch (e) {
    const err = e as Error;
    console.error('error', err.message);
    return [];
  }
};

const findEntryById = async (id: number): Promise<DiaryEntry | undefined> => {
  try {
    // prepared statement
    const [rows] = await promisePool.execute<RowDataPacket[]>('SELECT * FROM DiaryEntries WHERE entry_id = ?', [id]);

    // turvaton tapa, mahdollistaa sql-injektiohaavoittuvuuden:
    //const [rows] = await promisePool.query('SELECT * FROM DiaryEntries WHERE entry_id =' + id);

    //console.log('rows', rows);
    return rows[0] as DiaryEntry | undefined;
  } catch (e) {
    const err = e as Error;
    console.error('error', err.message);
    return undefined;
  }
};

const addEntry = async (entry: Omit<DiaryEntry, 'entry_id' | 'created_at'>): Promise<{entry_id: number}> => {
  const {user_id, entry_date, mood, weight, sleep_hours, notes} = entry;
  const sql = `INSERT INTO DiaryEntries (user_id, entry_date, mood, weight, sleep_hours, notes)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [user_id, entry_date, mood, weight, sleep_hours, notes];
  try {
    const [result] = await promisePool.execute<ResultSetHeader>(sql, params);
    //console.log('insert result', result);
    return {entry_id: result.insertId};
  } catch (e) {
    const err = e as Error;
    console.error('error', err.message);
    throw new Error(err.message);
  }
};

const removeEntryById = async (entryId: number, userId: number): Promise<number> => {
  const sql = 'DELETE from DiaryEntries WHERE entry_id = ? AND user_id = ?';
  const [result] = await promisePool.execute<ResultSetHeader>(sql, [entryId, userId]);
  //console.log('remove entry by id', result);
  return result.affectedRows;
};

export {listAllEntries, findEntryById, addEntry, listAllEntriesByUserId, removeEntryById};
