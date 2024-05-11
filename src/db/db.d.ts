import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface _EbiekiDbState {
  schemaVersion: number;
}

export interface Ebisu {
  createdMillis: number;
  data: string;
  direction: string;
  id: Generated<number>;
  kanji: string;
  user: string;
}

export interface File {
  accessedMillis: number;
  createdMillis: number;
  data: Buffer;
  id: Generated<number>;
  mime: string;
  sha256: string;
  timesAccessed: number;
  uuid: string;
}

export interface Note {
  createdMillis: number;
  id: Generated<number>;
  kanji: string;
  note: string;
  user: string;
}

export interface User {
  id: Generated<number>;
  name: string;
}

export interface Vocab {
  customDefinition: string;
  id: Generated<number>;
  jmdictCustomize: string;
  kanji: string;
  user: string;
}

export interface DB {
  _ebieki_db_state: _EbiekiDbState;
  ebisu: Ebisu;
  file: File;
  note: Note;
  user: User;
  vocab: Vocab;
}
