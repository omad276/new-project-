import { User } from '../types/index.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// In-memory database (mock)
// In production, replace with MongoDB using the same interface

interface Database {
  users: Map<string, User>;
  refreshTokens: Map<string, { userId: string; expiresAt: Date }>;
}

const db: Database = {
  users: new Map(),
  refreshTokens: new Map(),
};

// Initialize with a default admin user
async function initializeDb() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser: User = {
    id: uuidv4(),
    email: 'admin@upgreat.sa',
    password: adminPassword,
    fullName: 'System Admin',
    fullNameAr: 'مدير النظام',
    phone: '+966500000000',
    role: 'admin',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.users.set(adminUser.email.toLowerCase(), adminUser);
  console.log('📦 Mock database initialized with admin user');
}

// User operations
export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    return db.users.get(email.toLowerCase()) || null;
  },

  async findById(id: string): Promise<User | null> {
    for (const user of db.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  },

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.users.set(user.email.toLowerCase(), user);
    return user;
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    for (const [email, user] of db.users.entries()) {
      if (user.id === id) {
        const updatedUser = {
          ...user,
          ...updates,
          updatedAt: new Date(),
        };
        db.users.set(email, updatedUser);
        return updatedUser;
      }
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
    for (const [email, user] of db.users.entries()) {
      if (user.id === id) {
        db.users.delete(email);
        return true;
      }
    }
    return false;
  },

  async findAll(): Promise<User[]> {
    return Array.from(db.users.values());
  },

  async findByRole(role: string): Promise<User[]> {
    return Array.from(db.users.values()).filter((user) => user.role === role);
  },

  async emailExists(email: string): Promise<boolean> {
    return db.users.has(email.toLowerCase());
  },
};

// Refresh token operations
export const RefreshTokenModel = {
  async save(token: string, userId: string, expiresAt: Date): Promise<void> {
    db.refreshTokens.set(token, { userId, expiresAt });
  },

  async find(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const data = db.refreshTokens.get(token);
    if (!data) return null;
    if (data.expiresAt < new Date()) {
      db.refreshTokens.delete(token);
      return null;
    }
    return data;
  },

  async delete(token: string): Promise<void> {
    db.refreshTokens.delete(token);
  },

  async deleteAllForUser(userId: string): Promise<void> {
    for (const [token, data] of db.refreshTokens.entries()) {
      if (data.userId === userId) {
        db.refreshTokens.delete(token);
      }
    }
  },
};

// Initialize database
initializeDb().catch(console.error);

export default db;
