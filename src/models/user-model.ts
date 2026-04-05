import promisePool from '../utils/database.js';
import type {RowDataPacket, ResultSetHeader} from 'mysql2';
import type {User} from '../types/index.js';


// TODO: lisää modelit ja muokkaa kontrollerit reiteille:
// GET /api/users/:id - get user by id

// GET /api/users - list all users
const listAllUsers = async (): Promise<User[]> => {
  const sql = 'SELECT username, created_at FROM Users';
  const [rows] = await promisePool.query<RowDataPacket[]>(sql);
  return rows as User[];
};

// POST /api/users - add a new user
const addUser = async (user: Omit<User, 'user_id' | 'created_at' | 'user_level'>): Promise<{user_id: number}> => {
  const {username, password, email} = user;
  const sql = `INSERT INTO Users (username, password, email)
               VALUES (?, ?, ?)`;
  const params = [username, password, email];
  try {
    const [result] = await promisePool.execute<ResultSetHeader>(sql, params);
    //console.log('insert result', result);
    return {user_id: result.insertId};
  } catch (e) {
    const err = e as Error;
    console.error('error', err.message);
    throw new Error(err.message);
  }
};

// Huom: virheenkäsittely puuttuu, mutta sen voi tehdä myös kontrollerissa
const findUserByUsername = async (username: string): Promise<User | undefined> => {
  const sql = 'SELECT * FROM Users WHERE username = ?';
  const [rows] = await promisePool.execute<RowDataPacket[]>(sql, [username]);
  return rows[0] as User | undefined;
};

export {findUserByUsername, addUser, listAllUsers};
