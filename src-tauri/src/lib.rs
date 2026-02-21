mod commands;
mod db;
mod models;
mod schema;

use db::AppDatabase;
use std::path::PathBuf;
use tauri::Manager;

/// Resolves the SQLite database path inside the OS-appropriate app data directory.
/// Falls back to a local path if the Tauri resolver is unavailable.
fn resolve_db_path(app: &tauri::App) -> PathBuf {
    let base = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."));
    base.join("budget_handler.db")
}

/// A simple health-check command the frontend can call to verify the
/// backend is alive and the database is accessible.
#[tauri::command]
fn health_check(db: tauri::State<'_, AppDatabase>) -> Result<String, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;
    let mut stmt = conn
        .prepare("SELECT COUNT(*) FROM categories")
        .map_err(|e| format!("Query error: {}", e))?;
    let count: i64 = stmt
        .query_row([], |row| row.get(0))
        .map_err(|e| format!("Query error: {}", e))?;
    Ok(format!(
        "Database OK — {} categories loaded",
        count
    ))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 1. Resolve the database file path
            let db_path = resolve_db_path(app);
            log::info!("Database path: {:?}", db_path);

            // 2. Open the database connection (Rule 3: managed state)
            let database = AppDatabase::open(&db_path).map_err(|e| {
                log::error!("DB open failed: {}", e);
                Box::<dyn std::error::Error>::from(e)
            })?;

            // 3. Run schema migrations
            {
                let conn = database
                    .conn
                    .lock()
                    .map_err(|e| Box::<dyn std::error::Error>::from(e.to_string()))?;
                schema::initialize_schema(&conn).map_err(|e| {
                    log::error!("Schema init failed: {}", e);
                    Box::<dyn std::error::Error>::from(e)
                })?;
                schema::seed_default_categories(&conn).map_err(|e| {
                    log::error!("Seed failed: {}", e);
                    Box::<dyn std::error::Error>::from(e)
                })?;
            }

            // 4. Hand the database to Tauri's managed state
            app.manage(database);

            log::info!("Budget Handler backend initialised successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            health_check,
            // Categories
            commands::get_categories,
            commands::get_categories_by_type,
            commands::add_category,
            commands::update_category,
            commands::delete_category,
            // Transactions
            commands::add_transaction,
            commands::get_transactions,
            commands::delete_transaction,
            // Budgets
            commands::upsert_budget,
            commands::get_budgets,
            // Dashboard / Analytics
            commands::get_dashboard_summary,
            commands::get_category_summary,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

