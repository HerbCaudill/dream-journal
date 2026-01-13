# Progress Log

This file tracks completed tasks and changes made to the codebase during ralph iterations.

Each entry should include:

- What was changed
- Why it was changed
- Any important notes for future work

---

## 2026-01-13: Created DreamEntry type

Created `src/types/index.ts` with the `DreamEntry` type containing:

- `id`: string - unique identifier
- `date`: string - date of the dream
- `content`: string - the dream text

This is the foundational type for the dream journal entries.

## 2026-01-13: Created entry parsing and serialization functions

Created `src/lib/entries.ts` with:

- `parseEntries(json)`: Parses JSON string into `DreamEntry[]`. Returns empty array for invalid/empty input. Validates each entry has required fields.
- `serializeEntries(entries)`: Serializes `DreamEntry[]` to JSON string.
- `getTodayDate()`: Returns current date in `YYYY-MM-DD` format.

Added comprehensive unit tests in `src/lib/entries.test.ts`.

Also:

- Added vitest as dev dependency
- Added `test`, `test:watch`, and `format` scripts to package.json

## 2026-01-13: Created IndexedDB helper to open database

Created `src/lib/indexedDb.ts` with:

- `openDatabase()`: Opens connection to IndexedDB database "dream-journal". Uses singleton pattern to return same connection on subsequent calls.
- `resetDatabase()`: Closes connection and resets singleton (for testing).
- Constants: `DB_NAME`, `DB_VERSION`, `ENTRIES_STORE`, `PENDING_STORE`.

The database has two object stores:

- `entries`: For caching dream entries locally (keyPath: "id")
- `pending`: For tracking changes made while offline (keyPath: "id")

Also:

- Added `fake-indexeddb` dev dependency for testing IndexedDB in Node
- Created `vitest.config.ts` with test setup file
- Created `src/test/setup.ts` to initialize fake-indexeddb
- Added comprehensive unit tests in `src/lib/indexedDb.test.ts`

## 2026-01-13: Added saveEntries and loadEntries IndexedDB helpers

Added two functions to `src/lib/indexedDb.ts`:

- `saveEntries(entries)`: Saves an array of `DreamEntry` to the `entries` object store. Clears existing entries first (full replacement).
- `loadEntries()`: Loads all entries from the `entries` object store. Returns empty array if none exist.

Added unit tests for both functions in `src/lib/indexedDb.test.ts` (4 new tests).

## 2026-01-13: Added pending changes IndexedDB helpers

Added `PendingChange` type to `src/types/index.ts`:

- `id`: string - unique identifier for the pending change
- `type`: "add" | "update" | "delete" - the type of change
- `entryId`: string - the ID of the affected entry
- `entry?`: DreamEntry - the entry data (optional, not needed for deletes)
- `timestamp`: number - when the change was made (for ordering)

Added three functions to `src/lib/indexedDb.ts`:

- `savePendingChange(change)`: Saves a pending change to the `pending` object store.
- `loadPendingChanges()`: Loads all pending changes, sorted by timestamp (oldest first).
- `clearPendingChanges()`: Clears all pending changes from the store.

These helpers enable offline-first functionality by tracking changes made while disconnected, so they can be synced to Google Drive when connectivity is restored.

Added 8 new unit tests in `src/lib/indexedDb.test.ts` (total now 27 tests).
