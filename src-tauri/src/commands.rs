use crate::db::AppDatabase;
use crate::models::{
    Budget, BudgetRow, Category, CategorySummary, DashboardSummary, TransactionRow,
};
use tauri::State;

// ═══════════════════════════════════════════════════════════════════
//  CATEGORY COMMANDS
// ═══════════════════════════════════════════════════════════════════

/// Returns every category in the database.
#[tauri::command]
pub fn get_categories(db: State<'_, AppDatabase>) -> Result<Vec<Category>, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, name, type FROM categories ORDER BY type, name")
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                category_type: row.get(2)?,
            })
        })
        .map_err(|e| format!("Failed to query categories: {}", e))?;

    let mut categories = Vec::new();
    for row in rows {
        categories.push(row.map_err(|e| format!("Row read error: {}", e))?);
    }
    Ok(categories)
}

/// Returns categories filtered by type ("Income" or "Expense").
/// This powers the dependent dropdown on the transaction form.
#[tauri::command]
pub fn get_categories_by_type(
    db: State<'_, AppDatabase>,
    tx_type: String,
) -> Result<Vec<Category>, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare("SELECT id, name, type FROM categories WHERE type = ?1 ORDER BY name")
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let rows = stmt
        .query_map([&tx_type], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                category_type: row.get(2)?,
            })
        })
        .map_err(|e| format!("Failed to query categories by type: {}", e))?;

    let mut categories = Vec::new();
    for row in rows {
        categories.push(row.map_err(|e| format!("Row read error: {}", e))?);
    }
    Ok(categories)
}

/// Inserts a new category. Returns the newly created category.
#[tauri::command]
pub fn add_category(
    db: State<'_, AppDatabase>,
    name: String,
    tx_type: String,
) -> Result<Category, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    conn.execute(
        "INSERT INTO categories (name, type) VALUES (?1, ?2)",
        rusqlite::params![&name, &tx_type],
    )
    .map_err(|e| format!("Failed to add category: {}", e))?;

    let id = conn.last_insert_rowid();

    Ok(Category {
        id,
        name,
        category_type: tx_type,
    })
}

/// Deletes a category by id. Will fail if transactions reference it
/// (ON DELETE RESTRICT).
#[tauri::command]
pub fn delete_category(db: State<'_, AppDatabase>, id: i64) -> Result<(), String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    let affected = conn
        .execute("DELETE FROM categories WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| format!("Failed to delete category: {}", e))?;

    if affected == 0 {
        return Err(format!("No category found with id {}", id));
    }
    Ok(())
}

/// Updates an existing category's name and type.
#[tauri::command]
pub fn update_category(
    db: State<'_, AppDatabase>,
    id: i64,
    name: String,
    tx_type: String,
) -> Result<Category, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    let affected = conn
        .execute(
            "UPDATE categories SET name = ?1, type = ?2 WHERE id = ?3",
            rusqlite::params![&name, &tx_type, id],
        )
        .map_err(|e| format!("Failed to update category: {}", e))?;

    if affected == 0 {
        return Err(format!("No category found with id {}", id));
    }

    Ok(Category {
        id,
        name,
        category_type: tx_type,
    })
}

// ═══════════════════════════════════════════════════════════════════
//  TRANSACTION COMMANDS
// ═══════════════════════════════════════════════════════════════════

/// Inserts a new transaction record. Returns the auto-generated id.
#[tauri::command]
pub fn add_transaction(
    db: State<'_, AppDatabase>,
    date: String,
    tx_type: String,
    category_id: i64,
    amount: f64,
    description: String,
) -> Result<i64, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    conn.execute(
        "INSERT INTO transactions (date, type, category_id, amount, description)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![&date, &tx_type, category_id, amount, &description],
    )
    .map_err(|e| format!("Failed to add transaction: {}", e))?;

    Ok(conn.last_insert_rowid())
}

/// Returns transactions joined with their category name.
/// Optionally filtered by date range. Ordered by date descending.
#[tauri::command]
pub fn get_transactions(
    db: State<'_, AppDatabase>,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Vec<TransactionRow>, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    // Build the query dynamically based on which filters are provided
    let base = "SELECT t.id, t.date, t.type, t.category_id, c.name, t.amount,
                       t.description, t.created_at
                FROM transactions t
                JOIN categories c ON t.category_id = c.id";

    let (query, params): (String, Vec<Box<dyn rusqlite::types::ToSql>>) =
        match (&start_date, &end_date) {
            (Some(s), Some(e)) => (
                format!("{} WHERE t.date >= ?1 AND t.date <= ?2 ORDER BY t.date DESC", base),
                vec![Box::new(s.clone()), Box::new(e.clone())],
            ),
            (Some(s), None) => (
                format!("{} WHERE t.date >= ?1 ORDER BY t.date DESC", base),
                vec![Box::new(s.clone())],
            ),
            (None, Some(e)) => (
                format!("{} WHERE t.date <= ?1 ORDER BY t.date DESC", base),
                vec![Box::new(e.clone())],
            ),
            (None, None) => (
                format!("{} ORDER BY t.date DESC", base),
                vec![],
            ),
        };

    let mut stmt = conn
        .prepare(&query)
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();

    let rows = stmt
        .query_map(param_refs.as_slice(), |row| {
            Ok(TransactionRow {
                id: row.get(0)?,
                date: row.get(1)?,
                transaction_type: row.get(2)?,
                category_id: row.get(3)?,
                category_name: row.get(4)?,
                amount: row.get(5)?,
                description: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .map_err(|e| format!("Failed to query transactions: {}", e))?;

    let mut transactions = Vec::new();
    for row in rows {
        transactions.push(row.map_err(|e| format!("Row read error: {}", e))?);
    }
    Ok(transactions)
}

/// Deletes a transaction by id.
#[tauri::command]
pub fn delete_transaction(db: State<'_, AppDatabase>, id: i64) -> Result<(), String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    let affected = conn
        .execute(
            "DELETE FROM transactions WHERE id = ?1",
            rusqlite::params![id],
        )
        .map_err(|e| format!("Failed to delete transaction: {}", e))?;

    if affected == 0 {
        return Err(format!("No transaction found with id {}", id));
    }
    Ok(())
}

// ═══════════════════════════════════════════════════════════════════
//  BUDGET COMMANDS
// ═══════════════════════════════════════════════════════════════════

/// Inserts or updates a budget for a given (category, month, year).
/// Uses SQLite's ON CONFLICT / upsert syntax.
#[tauri::command]
pub fn upsert_budget(
    db: State<'_, AppDatabase>,
    category_id: i64,
    month: i32,
    year: i32,
    planned_amount: f64,
) -> Result<Budget, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    conn.execute(
        "INSERT INTO budgets (category_id, planned_amount, month, year)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT (category_id, month, year)
         DO UPDATE SET planned_amount = excluded.planned_amount",
        rusqlite::params![category_id, planned_amount, month, year],
    )
    .map_err(|e| format!("Failed to upsert budget: {}", e))?;

    // Retrieve the upserted row
    let mut stmt = conn
        .prepare(
            "SELECT id, category_id, planned_amount, month, year
             FROM budgets
             WHERE category_id = ?1 AND month = ?2 AND year = ?3",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let budget = stmt
        .query_row(
            rusqlite::params![category_id, month, year],
            |row| {
                Ok(Budget {
                    id: row.get(0)?,
                    category_id: row.get(1)?,
                    planned_amount: row.get(2)?,
                    month: row.get(3)?,
                    year: row.get(4)?,
                })
            },
        )
        .map_err(|e| format!("Failed to fetch upserted budget: {}", e))?;

    Ok(budget)
}

/// Returns all budgets for a given month/year, joined with category names.
#[tauri::command]
pub fn get_budgets(
    db: State<'_, AppDatabase>,
    month: i32,
    year: i32,
) -> Result<Vec<BudgetRow>, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT b.id, b.category_id, c.name, b.planned_amount, b.month, b.year
             FROM budgets b
             JOIN categories c ON b.category_id = c.id
             WHERE b.month = ?1 AND b.year = ?2
             ORDER BY c.name",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let rows = stmt
        .query_map(rusqlite::params![month, year], |row| {
            Ok(BudgetRow {
                id: row.get(0)?,
                category_id: row.get(1)?,
                category_name: row.get(2)?,
                planned_amount: row.get(3)?,
                month: row.get(4)?,
                year: row.get(5)?,
            })
        })
        .map_err(|e| format!("Failed to query budgets: {}", e))?;

    let mut budgets = Vec::new();
    for row in rows {
        budgets.push(row.map_err(|e| format!("Row read error: {}", e))?);
    }
    Ok(budgets)
}

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD / ANALYTICS COMMANDS
// ═══════════════════════════════════════════════════════════════════

/// Returns aggregated income, expense, and net savings for a date range.
/// Powers the top-level metric cards on the Dashboard.
#[tauri::command]
pub fn get_dashboard_summary(
    db: State<'_, AppDatabase>,
    start_date: String,
    end_date: String,
) -> Result<DashboardSummary, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT
                COALESCE(SUM(CASE WHEN type = 'Income'  THEN amount ELSE 0 END), 0) AS total_income,
                COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS total_expense
             FROM transactions
             WHERE date >= ?1 AND date <= ?2",
        )
        .map_err(|e| format!("Failed to prepare dashboard query: {}", e))?;

    let summary = stmt
        .query_row(rusqlite::params![&start_date, &end_date], |row| {
            let income: f64 = row.get(0)?;
            let expense: f64 = row.get(1)?;
            Ok(DashboardSummary {
                total_income: income,
                total_expense: expense,
                net_savings: income - expense,
            })
        })
        .map_err(|e| format!("Failed to compute dashboard summary: {}", e))?;

    Ok(summary)
}

/// Returns per-category aggregated totals for a date range, filtered by type.
/// Powers the Recharts donut chart and the Planned vs. Actual table.
#[tauri::command]
pub fn get_category_summary(
    db: State<'_, AppDatabase>,
    start_date: String,
    end_date: String,
    tx_type: String,
) -> Result<Vec<CategorySummary>, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|e| format!("Database lock error: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT t.category_id, c.name, COALESCE(SUM(t.amount), 0) AS total
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.date >= ?1 AND t.date <= ?2 AND t.type = ?3
             GROUP BY t.category_id
             ORDER BY total DESC",
        )
        .map_err(|e| format!("Failed to prepare category summary query: {}", e))?;

    let rows = stmt
        .query_map(
            rusqlite::params![&start_date, &end_date, &tx_type],
            |row| {
                Ok(CategorySummary {
                    category_id: row.get(0)?,
                    category_name: row.get(1)?,
                    total_amount: row.get(2)?,
                })
            },
        )
        .map_err(|e| format!("Failed to query category summary: {}", e))?;

    let mut summaries = Vec::new();
    for row in rows {
        summaries.push(row.map_err(|e| format!("Row read error: {}", e))?);
    }
    Ok(summaries)
}
