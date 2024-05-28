import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface _EbiekiDbState {
  schemaVersion: number;
}

export interface Ebisu {
  buried: number;
  createdMillis: number;
  deviceId: string;
  direction: string;
  id: Generated<number>;
  model: string;
  modelTimeMillis: number;
  quizMeta: string;
  user: string;
  vocabKanji: string;
}

export interface File {
  accessedMillis: number;
  createdMillis: number;
  data: Buffer;
  forwardedUuid: string;
  id: Generated<number>;
  mime: string;
  numBytes: number;
  sha256: string;
  timesAccessed: number;
  uuid: string;
}

export interface JmdictVocab {
  createdMillis: number;
  id: Generated<number>;
  inWanikani: number;
  json: string;
  lessonPosition: number;
  level: number;
  vocabKanji: string;
}

export interface Note {
  createdMillis: number;
  deviceId: string;
  id: Generated<number>;
  note: string;
  user: string;
  vocabKanji: string;
}

export interface User {
  id: Generated<number>;
  name: string;
}

export interface Vocab {
  createdMillis: number;
  customDefinition: string;
  deviceId: string;
  id: Generated<number>;
  jmdictCustomize: string;
  user: string;
  vocabKanji: string;
}

export interface DB {
  _ebieki_db_state: _EbiekiDbState;
  ebisu: Ebisu;
  file: File;
  jmdictVocab: JmdictVocab;
  note: Note;
  user: User;
  vocab: Vocab;
}
