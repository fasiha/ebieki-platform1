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
    kanji text not null, -- vocab
    user text not null,
    customDefinition text not null, -- like totally free
    jmdictCustomize text not null, -- which senses/subsenses are good/bad
    unique (kanji, user)
  );

-- for each (vocab, user), you can have a note, and I'm just going to keep all history
create table
  note (
    id INTEGER PRIMARY KEY AUTOINCREMENT not null,
    kanji text not null, -- vocab
    user text not null,
    note text not null,
    createdMillis integer not null,
    unique (kanji, user, createdMillis)
  );

-- each vocab can have multiple memory models for different quiz directions
create table
  ebisu (
    id INTEGER PRIMARY KEY AUTOINCREMENT not null,
    kanji text not null, -- vocab
    user text not null,
    direction text not null, -- `kanji->reading` or `kanji,reading->meaning` etc.
    data text not null, -- json
    createdMillis integer not null,
    unique (kanji, user, direction, createdMillis)
  );

-- blob storage! To embed in `note`s
create table
  file (
    id INTEGER PRIMARY KEY AUTOINCREMENT not null,
    mime text not null,
    data blob not null,
    uuid text unique not null, -- opaque signifier
    sha256 text unique not null,
    createdMillis integer not null,
    accessedMillis integer not null,
    timesAccessed integer not null
  );