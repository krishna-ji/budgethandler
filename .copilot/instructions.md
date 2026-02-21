Act as an expert Full-Stack Desktop Application Developer specializing in Tauri, Rust, React (TypeScript), and local databases.

I am building a comprehensive, local-first Desktop Application for Hotel Financial Management & Expense Tracking. I want to build this using standard enterprise-grade architectural patterns, ensuring strict separation between the frontend UI and the Rust backend logic.

### 1. Technology Stack
* **Framework:** Tauri v2
* **Frontend:** React (TypeScript) with Vite
* **Styling:** Tailwind CSS + Shadcn UI (for premium, accessible, ready-to-use components like Data Tables, Dropdowns, and Cards).
* **Data Visualization:** Recharts (for responsive, interactive graphs).
* **Backend/Database:** Rust with SQLite (using the `rusqlite` or `sqlx` crate) for local, offline-first data storage.

### 2. Database Schema (SQLite)
Please design the Rust structs and SQLite schema for the following:
* **Transactions Table:** `id`, `date`, `type` (Income/Expense), `category_id` (Foreign Key), `amount`, `description`, `created_at`.
* **Categories Table:** `id`, `name`, `type` (Income/Expense).
* **Budgets Table:** `id`, `category_id` (Foreign Key), `planned_amount`, `month`, `year`.

### 3. Core Features & Modules to Implement

**Module A: The Dashboard (Frontend)**
* A high-level statistical overview comparing "Planned Budget" vs. "Actual Spending".
* A filter to toggle the view by specific periods: **Weekly**, **Fortnightly (14-days)**, and **Monthly**.
* Top-level metric cards: Total Income, Total Expenses, and Net Savings (with conditional formatting: green for positive, red for negative).
* A data table showing a breakdown by category, calculating the "Difference" (Actual - Planned).

**Module B: The Ledger / Data Entry**
* A robust data entry form to log transactions.
* **Dependent Dropdowns:** If the user selects "Expense" as the Type, the Category dropdown should dynamically fetch and display only Expense categories from the database. 
* A paginated, searchable data table displaying all past transactions.

**Module C: Interactive Analytics (Recharts)**
* **Fortnightly Trend Bar Chart:** A clustered bar chart showing Income vs. Expense grouped by 14-day intervals.
* **Expense Breakdown:** A Donut/Pie chart showing the distribution of expenses across categories (Kitchen, Bar, Staff, etc.).

**Module D: Settings & Configuration**
* A UI to add, edit, or delete Categories.
* A UI to set the "Planned" budget amounts for each category per month.

### 4. UI/UX & Design Guidelines
* The application should have a clean, modern "SaaS" aesthetic.
* Use a unified color palette (e.g., Slate/Gray for layout, Blue for Income, Orange/Red for Expenses).
* Remove heavy borders; rely on white space, padding, and subtle shadows for elevation.
* Include a Dark Mode toggle.

### 5. Your Task
Please break down the development process into logical steps. 
1. Start by providing the Tauri initialization commands and the required dependencies (Cargo.toml and package.json).
2. Write the Rust backend code to initialize the SQLite database and create the tables.
3. Write the Rust Tauri commands (CRUD operations) that the frontend will call.
4. Provide the React component code for the Dashboard and the Recharts visualization.