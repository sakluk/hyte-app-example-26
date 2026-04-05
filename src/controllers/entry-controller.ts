import type {Request, Response} from 'express';
import {
  //listAllEntries,
  findEntryById,
  addEntry,
  listAllEntriesByUserId,
  removeEntryById,
} from '../models/entry-model.js';

const getEntries = async (req: Request, res: Response) => {
  // haetaan kaikkien käyttäjien merkinnät
  //const result = await listAllEntries();
  // haetaan kirjautuneen (token) käyttäjän omat merkinnät
  const result = await listAllEntriesByUserId(req.user!.user_id);
  res.json(result);
};

const getEntryById = async (req: Request, res: Response) => {
  const entry = await findEntryById(Number(req.params.id));
  if (entry) {
    res.json(entry);
  } else {
    res.sendStatus(404);
  }
};

const postEntry = async (req: Request, res: Response) => {

  const {entry_date, mood, weight, sleep_hours, notes} = req.body;
  // user property (& id) is added to req by authentication middleware
  const user_id = req.user!.user_id;

  // TODO: replace with validation middleware in entry
  if (entry_date && (weight || mood || sleep_hours || notes) && user_id) {
    const result = await addEntry({user_id, ...req.body});
    if (result.entry_id) {
      res.status(201);
      res.json({message: 'New entry added.', ...result});
    } else {
      res.status(500);
      res.json(result);
    }
  } else {
    res.sendStatus(400);
  }
};

const putEntry = (req: Request, res: Response) => {
  // placeholder for future implementation
  res.sendStatus(200);
};

const deleteEntry = async (req: Request, res: Response) => {
  const affectedRows = await removeEntryById(Number(req.params.id), req.user!.user_id);
  if (affectedRows > 0) {
    res.json({message: 'entry deleted'});
  } else {
    res.status(404).json({message: 'entry not found'});
  }
};

export {getEntries, getEntryById, postEntry, putEntry, deleteEntry};
