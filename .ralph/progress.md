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

## 2026-01-13: Created useOfflineCache hook

Created `src/hooks/useOfflineCache.ts` - a React hook that provides an interface to the IndexedDB offline cache:

- **State**: `entries`, `pendingChanges`, `isLoading`, `error`, `hasPendingChanges`
- **Methods**:
  - `saveEntries(entries)`: Save entries to IndexedDB and update state
  - `addPendingChange(change)`: Add a pending change for offline sync
  - `clearPendingChanges()`: Clear all pending changes after successful sync

The hook loads entries and pending changes from IndexedDB on mount, providing loading state while the async operation completes.

Also:

- Added `@testing-library/react` and `jsdom` dev dependencies for hook testing
- Created `src/hooks/useOfflineCache.test.ts` with 10 comprehensive tests

## 2026-01-13: Created EntryForm component

Created `src/components/EntryForm.tsx` - the main form for entering dream journal entries:

- **Date input**: Defaults to today's date, user can change to record past dreams
- **Content textarea**: Large text area with placeholder "Describe your dream..."
- **Submit button**: Disabled until content is entered, button text "Save entry"
- **Minimal/calm aesthetic**: Uses muted colors, relaxed spacing, and subtle focus states

Props:

- `onSubmit({ date, content })`: Callback when form is submitted
- `disabled`: Optional prop to disable all inputs

Features:

- Trims whitespace from content before submitting
- Clears content after successful submission
- Prevents submission of empty/whitespace-only content

Also:

- Added `@testing-library/jest-dom` and `@testing-library/user-event` dev dependencies
- Created `src/components/EntryForm.test.tsx` with 10 comprehensive tests

## 2026-01-13: Created HomePage component

Created `src/pages/HomePage.tsx` - the main landing page for the dream journal app:

- **Title**: "Dream journal" in serif font with light weight
- **EntryForm**: Renders the EntryForm component for entering dreams
- **Layout**: Centered content with max-width constraint, responsive padding

Props:

- `onSubmit({ date, content })`: Callback passed through to EntryForm

Also:

- Created `src/pages/` directory for page components
- Created `src/pages/HomePage.test.tsx` with 3 tests covering rendering and submission

## 2026-01-13: Added routing to App.tsx

Updated `src/App.tsx` with react-router-dom routing:

- **Home route** (`/`): Renders HomePage with EntryForm
- **History route** (`/history`): Placeholder for future HistoryPage

Also:

- Added `react-router-dom` dependency
- handleSubmit currently logs to console; will be connected to useEntries hook in future task

## 2026-01-13: Created useEntries hook

Created `src/hooks/useEntries.ts` - a React hook for managing dream journal entries with full CRUD operations:

- **State**: `entries`, `isLoading`, `error`, `hasPendingChanges`
- **Methods**:
  - `addEntry(date, content)`: Creates a new entry, saves to cache, records pending change
  - `updateEntry(id, content)`: Updates an existing entry by ID
  - `deleteEntry(id)`: Deletes an entry by ID
  - `getEntryById(id)`: Returns an entry by ID (undefined if not found)

Key features:

- Entries are always sorted by date descending (newest first)
- Each mutation (add/update/delete) records a pending change for future sync
- Optimistic updates - state is updated immediately, then persisted to IndexedDB
- Uses `crypto.randomUUID()` for unique IDs

Also:

- Created `src/hooks/useEntries.test.ts` with 19 comprehensive tests covering all operations

## 2026-01-13: Added navigation button to history on HomePage

Added a "History" link to `src/pages/HomePage.tsx`:

- Uses `react-router-dom` Link component to navigate to `/history`
- Includes IconHistory from `@tabler/icons-react`
- Styled with muted color that transitions on hover
- Positioned below the EntryForm

Also:

- Added `@tabler/icons-react` dependency
- Updated `src/pages/HomePage.test.tsx` with MemoryRouter wrappers and a new test for the history link
