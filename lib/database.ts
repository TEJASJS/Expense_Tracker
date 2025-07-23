import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:tejas2003@localhost:5432/expense_tracker',
  ssl: false
});

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  hashed_password: string;
  created_at: string;
}

export interface DatabaseExpense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  person: string;
  wallet_id?: string;
  tags: string[];
  is_recurring: boolean;
  recurring_type?: 'daily' | 'weekly' | 'monthly';
  next_due?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBudget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseGoal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWallet {
  id: string;
  name: string;
  owner_id: string;
  shared_with: string[];
  type: 'personal' | 'shared' | 'family';
  balance: number;
  currency: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        email text UNIQUE NOT NULL,
        hashed_password text NOT NULL,
        created_at timestamptz DEFAULT now()
      )
    `);

    // Create wallets table (must be created before expenses due to foreign key)
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        shared_with uuid[] DEFAULT '{}',
        type text NOT NULL CHECK (type IN ('personal', 'shared', 'family')),
        balance decimal(10,2) DEFAULT 0,
        currency text DEFAULT 'USD',
        description text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);

    // Create expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount decimal(10,2) NOT NULL,
        category text NOT NULL,
        description text NOT NULL,
        date date NOT NULL,
        person text NOT NULL DEFAULT 'Self',
        wallet_id uuid REFERENCES wallets(id) ON DELETE SET NULL,
        tags text[] DEFAULT '{}',
        is_recurring boolean DEFAULT false,
        recurring_type text CHECK (recurring_type IN ('daily', 'weekly', 'monthly')),
        next_due date,
        receipt_url text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);

    // Create budgets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category text NOT NULL,
        monthly_limit decimal(10,2) NOT NULL,
        alert_threshold integer DEFAULT 80,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE(user_id, category)
      )
    `);

    // Create goals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name text NOT NULL,
        description text,
        target_amount decimal(10,2) NOT NULL,
        current_amount decimal(10,2) DEFAULT 0,
        deadline date NOT NULL,
        category text NOT NULL,
        is_completed boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Database operations
export const db = {
  // Initialize database
  async init() {
    await initializeDatabase();
  },

  // Users
  async createUser(user: { name: string; email: string; password: string }) {
    const client = await pool.connect();
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const result = await client.query(
        'INSERT INTO users (name, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
        [user.name, user.email, hashedPassword]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getUserByEmail(email: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  },

  // Expenses
  async getExpenses(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async createExpense(expense: Omit<DatabaseExpense, 'id' | 'created_at' | 'updated_at'>) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO expenses (user_id, amount, category, description, date, person, wallet_id, tags, is_recurring, recurring_type, next_due, receipt_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        expense.user_id, expense.amount, expense.category, expense.description,
        expense.date, expense.person, expense.wallet_id, expense.tags,
        expense.is_recurring, expense.recurring_type, expense.next_due, expense.receipt_url
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async updateExpense(id: string, updates: Partial<DatabaseExpense>) {
    const client = await pool.connect();
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [id, ...Object.values(updates), new Date().toISOString()];
      
      const result = await client.query(`
        UPDATE expenses 
        SET ${setClause}, updated_at = $${values.length}
        WHERE id = $1 
        RETURNING *
      `, values);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async deleteExpense(id: string) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM expenses WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  },

  // Budgets
  async getBudgets(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM budgets WHERE user_id = $1',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async createBudget(budget: Omit<DatabaseBudget, 'id' | 'created_at' | 'updated_at'>) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO budgets (user_id, category, monthly_limit, alert_threshold, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [budget.user_id, budget.category, budget.monthly_limit, budget.alert_threshold, budget.is_active]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async updateBudget(id: string, updates: Partial<DatabaseBudget>) {
    const client = await pool.connect();
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [id, ...Object.values(updates), new Date().toISOString()];
      
      const result = await client.query(`
        UPDATE budgets 
        SET ${setClause}, updated_at = $${values.length}
        WHERE id = $1 
        RETURNING *
      `, values);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async deleteBudget(id: string) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM budgets WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  },

  // Goals
  async getGoals(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM goals WHERE user_id = $1',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async createGoal(goal: Omit<DatabaseGoal, 'id' | 'created_at' | 'updated_at'>) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO goals (user_id, name, description, target_amount, current_amount, deadline, category, is_completed)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [goal.user_id, goal.name, goal.description, goal.target_amount, goal.current_amount, goal.deadline, goal.category, goal.is_completed]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async updateGoal(id: string, updates: Partial<DatabaseGoal>) {
    const client = await pool.connect();
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [id, ...Object.values(updates), new Date().toISOString()];
      
      const result = await client.query(`
        UPDATE goals 
        SET ${setClause}, updated_at = $${values.length}
        WHERE id = $1 
        RETURNING *
      `, values);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async deleteGoal(id: string) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM goals WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  },

  // Wallets
  async getWallets(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM wallets WHERE owner_id = $1 OR $1 = ANY(shared_with)',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async createWallet(wallet: Omit<DatabaseWallet, 'id' | 'created_at' | 'updated_at'>) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO wallets (name, owner_id, shared_with, type, balance, currency, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [wallet.name, wallet.owner_id, wallet.shared_with, wallet.type, wallet.balance, wallet.currency, wallet.description]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async updateWallet(id: string, updates: Partial<DatabaseWallet>) {
    const client = await pool.connect();
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [id, ...Object.values(updates), new Date().toISOString()];
      
      const result = await client.query(`
        UPDATE wallets 
        SET ${setClause}, updated_at = $${values.length}
        WHERE id = $1 
        RETURNING *
      `, values);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async deleteWallet(id: string) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM wallets WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  }
};

// Initialize database on module load
db.init().catch(console.error);