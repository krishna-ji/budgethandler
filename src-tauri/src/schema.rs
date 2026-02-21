use rusqlite::Connection;

/// Runs all table-creation statements inside a single transaction.
/// Each table is created with `IF NOT EXISTS` so this is safe to run
/// on every application launch (idempotent migration).
pub fn initialize_schema(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "
        BEGIN;

        -- Categories must be created first because Transactions and Budgets
        -- reference it via foreign keys.
        CREATE TABLE IF NOT EXISTS categories (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL UNIQUE,
            type        TEXT    NOT NULL CHECK(type IN ('Income', 'Expense'))
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            date        TEXT    NOT NULL,                          -- ISO-8601 date string (YYYY-MM-DD)
            type        TEXT    NOT NULL CHECK(type IN ('Income', 'Expense')),
            category_id INTEGER NOT NULL,
            amount      REAL    NOT NULL CHECK(amount >= 0),
            description TEXT    NOT NULL DEFAULT '',
            created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (category_id) REFERENCES categories(id)
                ON DELETE RESTRICT
        );

        CREATE TABLE IF NOT EXISTS budgets (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id     INTEGER NOT NULL,
            planned_amount  REAL    NOT NULL CHECK(planned_amount >= 0),
            month           INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
            year            INTEGER NOT NULL CHECK(year >= 2000),
            FOREIGN KEY (category_id) REFERENCES categories(id)
                ON DELETE CASCADE,
            UNIQUE(category_id, month, year)                      -- one budget per category per month
        );

        COMMIT;
        ",
    )
    .map_err(|e| format!("Failed to initialize database schema: {}", e))
}

/// Seeds a minimal set of default categories so the app is usable
/// on first launch. Silently ignores duplicates (INSERT OR IGNORE).
pub fn seed_default_categories(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Room Revenue',   'Income');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Food & Beverage','Income');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Events',         'Income');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Other Income',   'Income');

        INSERT OR IGNORE INTO categories (name, type) VALUES ('Kitchen',        'Expense');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Bar',            'Expense');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Staff Wages',    'Expense');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Utilities',      'Expense');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Maintenance',    'Expense');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Supplies',       'Expense');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Marketing',      'Expense');
        INSERT OR IGNORE INTO categories (name, type) VALUES ('Other Expense',  'Expense');
        ",
    )
    .map_err(|e| format!("Failed to seed default categories: {}", e))
}
