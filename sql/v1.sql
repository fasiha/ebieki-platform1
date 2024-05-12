-- run as `sqlite3 ebieki.db < v1.sql`
create table
  _ebieki_db_state (schemaVersion integer not null unique);

insert into
  _ebieki_db_state (schemaVersion)
values
  (1);

create table
  user (
    id INTEGER PRIMARY KEY AUTOINCREMENT not null,
    name text not null unique
  );

-- for each (vocab, user), per-user vocab info
create table
  vocab (
    id INTEGER PRIMARY KEY AUTOINCREMENT not null,
    vocabKanji text not null,
    user text not null,
    customDefinition text not null, -- JSON. Totally free text
    jmdictCustomize text not null, -- also JSON. Which senses/subsenses are good/bad
    createdMillis integer not null,
    deviceId text not null,
    unique (user, createdMillis, vocabKanji, deviceId)
  );

-- for each (vocab, user), you can have a note, and I'm just going to keep all history
create table
  note (
    id INTEGER PRIMARY KEY AUTOINCREMENT not null,
    vocabKanji text not null,
    user text not null,
    note text not null,
    createdMillis integer not null,
    deviceId text not null,
    unique (user, createdMillis, vocabKanji, deviceId)
  );

-- each vocab can have multiple memory models for different quiz directions
create table
  ebisu (
    id INTEGER PRIMARY KEY AUTOINCREMENT not null,
    vocabKanji text not null,
    user text not null,
    direction text not null, -- `kanji->reading` or `kanji,reading->meaning` etc.
    model text not null, -- Ebisu model JSON
    modelTimeMillis integer not null, -- might be different from "createdMillis" below
    quizMeta text not null, -- JSON
    buried boolean not null,
    createdMillis integer not null,
    deviceId text not null,
    unique (
      user,
      createdMillis,
      vocabKanji,
      direction,
      deviceId
    )
  );

-- the above UNIQUE constraint will be helpful when we move to storage
-- on devices (long-term), because it'll be fast to find rows where
-- `createdMillis` is greater than some value. The following index will
-- be more useful for now, where the server will be telling the client
-- what vocab/direction a user knows.
create unique index learnedGroup on ebisu (
  user,
  vocabKanji,
  direction,
  createdMillis,
  deviceId
);

-- blob storage! To embed in `note`s
create table
  file (
    id INTEGER PRIMARY KEY AUTOINCREMENT not null,
    mime text not null,
    data blob not null,
    numBytes integer not null, -- of data
    sha256 text unique not null,
    uuid text unique not null, -- opaque signifier
    -- files can be "removed" and forwarded (like a big file replaced by compressed version)
    forwardedUuid text not null,
    --
    createdMillis integer not null,
    accessedMillis integer not null,
    timesAccessed integer not null
  );