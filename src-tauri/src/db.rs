use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

/// Thread-safe wrapper around the SQLite connection.
/// Tauri manages this as shared state across all IPC commands.
pub struct AppDatabase {
    pub conn: Mutex<Connection>,
}

impl AppDatabase {
    /// Opens (or creates) the SQLite database at the given path.
    /// Returns a Result so the caller can handle errors gracefully
    /// instead of panicking (Rule 2).
    pub fn open(db_path: &PathBuf) -> Result<Self, String> {
        // Ensure the parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| {
                format!("Failed to create database directory: {}", e)
            })?;
        }

        let conn = Connection::open(db_path).map_err(|e| {
            format!("Failed to open SQLite database at {:?}: {}", db_path, e)
        })?;

        // Enable WAL mode for better concurrent read performance
        conn.execute_batch("PRAGMA journal_mode=WAL;")
            .map_err(|e| format!("Failed to set WAL mode: {}", e))?;

        // Enable foreign key enforcement
        conn.execute_batch("PRAGMA foreign_keys=ON;")
            .map_err(|e| format!("Failed to enable foreign keys: {}", e))?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}
