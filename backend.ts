
import { GoogleGenAI } from "@google/genai";
import { User, Task, Transaction, TaskCategory, TaskSubmission } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface BrandingSettings {
  logoUrl: string;
  heroBannerUrl: string;
  siteName: string;
}

interface UserRecord extends User {
  passwordHash: string;
}

export class AdsprediaBackend {
  private static DB_KEY = 'adspredia_db';

  private static getDB(): { 
    users: Record<string, UserRecord>, 
    tasks: Task[], 
    submissions: TaskSubmission[],
    transactions: Transaction[],
    branding?: BrandingSettings
  } {
    const raw = localStorage.getItem(this.DB_KEY);
    const defaultDB = {
      users: {} as Record<string, UserRecord>,
      tasks: [] as Task[],
      submissions: [] as TaskSubmission[],
      transactions: [] as Transaction[],
      branding: {
        logoUrl: '',
        heroBannerUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1600&auto=format&fit=crop',
        siteName: 'AdsPredia'
      }
    };

    if (!raw) return defaultDB;

    try {
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || {},
        tasks: parsed.tasks || [],
        submissions: parsed.submissions || [],
        transactions: parsed.transactions || [],
        branding: parsed.branding || defaultDB.branding
      };
    } catch (e) {
      return defaultDB;
    }
  }

  private static saveDB(db: any) {
    localStorage.setItem(this.DB_KEY, JSON.stringify(db));
  }

  private static async hashPassword(password: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async initialize(defaultTasks: Task[]) {
    const db = this.getDB();
    let changed = false;
    if (db.tasks.length === 0) {
      db.tasks = defaultTasks;
      changed = true;
    }
    const rootEmail = 'admin@adspredia.site';
    if (!db.users[rootEmail]) {
      const hash = await this.hashPassword('admin123');
      db.users[rootEmail] = {
        id: 'admin_root',
        name: 'Root Administrator',
        email: rootEmail,
        coins: 0,
        balance: 0,
        referralCode: 'ADMIN001',
        referrals: 0,
        joinDate: new Date().toISOString().split('T')[0],
        loginStreak: 1,
        role: 'admin',
        passwordHash: hash,
        spinsToday: 0
      };
      changed = true;
    }
    if (changed) this.saveDB(db);
    return db.tasks;
  }

  static async register(name: string, email: string, password: string) {
    const db = this.getDB();
    const emailLower = email.toLowerCase();
    if (db.users[emailLower]) return { success: false, message: "Email already registered." };
    const hash = await this.hashPassword(password);
    const newUser: UserRecord = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email: emailLower,
      coins: 0, 
      balance: 0, 
      referralCode: 'REF' + Math.floor(Math.random() * 100000),
      referrals: 0, 
      joinDate: new Date().toISOString().split('T')[0], 
      loginStreak: 0,
      role: 'user', 
      passwordHash: hash, 
      spinsToday: 0
    };
    db.users[emailLower] = newUser;
    this.saveDB(db);
    return { success: true, user: newUser, message: "Account created! Start earning today." };
  }

  static async login(email: string, password: string) {
    const db = this.getDB();
    const user = db.users[email.toLowerCase()];
    if (!user) return { success: false, message: "No account found." };
    const hash = await this.hashPassword(password);
    if (user.passwordHash !== hash) return { success: false, message: "Incorrect password." };
    return { success: true, user, message: "Login successful!" };
  }

  static async claimDailyBonus(userId: string) {
    const db = this.getDB();
    const user = Object.values(db.users).find(u => u.id === userId);
    if (!user) return { success: false, message: "User not found" };

    const today = new Date().toISOString().split('T')[0];
    if (user.lastBonusDate === today) return { success: false, message: "Already claimed today" };

    const reward = 50; 
    user.coins = (user.coins || 0) + reward;
    user.balance = (user.balance || 0) + (reward / 1000);
    user.lastBonusDate = today;
    user.loginStreak = (user.loginStreak || 0) + 1;

    db.users[user.email.toLowerCase()] = user;
    
    db.transactions.push({
      id: 'tx_bonus_' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      type: 'bonus',
      amount: reward / 1000,
      status: 'completed',
      date: new Date().toISOString(),
      method: 'Daily Reward'
    });

    this.saveDB(db);
    return { success: true, user, reward, message: "Bonus claimed!" };
  }

  static async getTasks(): Promise<Task[]> { 
    return [...this.getDB().tasks]; 
  }
  
  static async saveTask(task: Task) {
    const db = this.getDB();
    const index = db.tasks.findIndex(t => t.id === task.id);
    if (index > -1) {
      db.tasks[index] = task;
    } else {
      db.tasks.unshift(task);
    }
    this.saveDB(db);
  }

  static async getSubmissions(userId?: string, creatorId?: string): Promise<TaskSubmission[]> {
    const db = this.getDB();
    let subs = db.submissions;
    if (userId) subs = subs.filter(s => s.workerId === userId);
    if (creatorId) {
      const myTaskIds = db.tasks.filter(t => t.creatorId === creatorId).map(t => t.id);
      subs = subs.filter(s => myTaskIds.includes(s.taskId));
    }
    return subs;
  }

  static async submitTask(submission: Omit<TaskSubmission, 'id' | 'submittedAt' | 'status'>) {
    const db = this.getDB();
    const task = db.tasks.find(t => t.id === submission.taskId);
    if (!task) return { success: false, message: "Task not found" };

    const newSub: TaskSubmission = {
      ...submission,
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    if (task.autoApprove) {
      newSub.status = 'approved';
      const worker = Object.values(db.users).find(u => u.id === submission.workerId);
      if (worker) {
        worker.coins = (worker.coins || 0) + submission.reward;
        worker.balance = (worker.balance || 0) + (submission.reward / 1000);
        db.users[worker.email.toLowerCase()] = worker;
        db.transactions.push({
            id: 'tx_earning_' + Math.random().toString(36).substr(2, 9),
            userId: worker.id,
            userName: worker.name,
            type: 'earning',
            amount: submission.reward / 1000,
            status: 'completed',
            date: new Date().toISOString(),
            method: task.category
        });
      }
      const taskIndex = db.tasks.findIndex(t => t.id === task.id);
      if (taskIndex > -1) {
          db.tasks[taskIndex].completions += 1;
          if (db.tasks[taskIndex].completions >= db.tasks[taskIndex].limit) {
              db.tasks[taskIndex].status = 'completed';
          }
      }
      db.submissions.unshift(newSub);
      this.saveDB(db);
      return { success: true, message: "Task approved instantly! Balance updated.", user: worker };
    }

    const aiResult = await this.verifyTaskSubmission(task, submission.proofText, submission.proofScreenshot);
    newSub.aiVerdict = aiResult.message;
    db.submissions.unshift(newSub);
    this.saveDB(db);
    return { success: true, message: "Submitted! Awaiting creator review." };
  }

  static async approveSubmission(submissionId: string) {
    const db = this.getDB();
    const subIndex = db.submissions.findIndex(s => s.id === submissionId);
    if (subIndex === -1) return { success: false, message: "Submission not found" };
    
    const sub = db.submissions[subIndex];
    if (sub.status !== 'pending') return { success: false, message: "Task already processed." };

    const workerRecord = Object.values(db.users).find(u => u.id === sub.workerId);
    if (!workerRecord) return { success: false, message: "Worker account could not be found." };

    sub.status = 'approved';
    workerRecord.coins = (workerRecord.coins || 0) + sub.reward;
    workerRecord.balance = (workerRecord.balance || 0) + (sub.reward / 1000);
    db.users[workerRecord.email.toLowerCase()] = workerRecord;

    db.transactions.push({
        id: 'tx_appr_pay_' + Math.random().toString(36).substr(2, 9),
        userId: workerRecord.id,
        userName: workerRecord.name,
        type: 'earning',
        amount: sub.reward / 1000,
        status: 'completed',
        date: new Date().toISOString(),
        method: 'Task Payout'
    });

    const taskIndex = db.tasks.findIndex(t => t.id === sub.taskId);
    if (taskIndex > -1) {
        db.tasks[taskIndex].completions += 1;
        if (db.tasks[taskIndex].completions >= db.tasks[taskIndex].limit) {
            db.tasks[taskIndex].status = 'completed';
        }
    }
    
    this.saveDB(db);
    return { success: true, message: "Success: Coins and Balance added to worker.", user: workerRecord };
  }

  static async rejectSubmission(submissionId: string) {
    const db = this.getDB();
    const subIndex = db.submissions.findIndex(s => s.id === submissionId);
    if (subIndex > -1) {
        db.submissions[subIndex].status = 'rejected';
        this.saveDB(db);
        return { success: true };
    }
    return { success: false };
  }

  static async verifyTaskSubmission(task: Task, proof: string, screenshotData?: string) {
    try {
      const parts: any[] = [{
        text: `Verifier for Adspredia. Analyze if this proof matches task: ${task.title}. Instructions: ${task.instructions.join(', ')}. Proof Text: ${proof}. Verdict format: VALID or INVALID with reason.`
      }];
      if (screenshotData) {
        const matches = screenshotData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
        if (matches) parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
      }
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts } });
      return { success: true, message: response.text || "No AI feedback" };
    } catch (e) { return { success: false, message: "AI verification failed." }; }
  }

  static async createTransaction(userId: string, type: Transaction['type'], amount: number, method?: string, status: Transaction['status'] = 'completed', accountNumber?: string, accountName?: string) {
      const db = this.getDB();
      const user = Object.values(db.users).find(u => u.id === userId);
      db.transactions.push({
          id: 'tx_' + Math.random().toString(36).substr(2, 9),
          userId, 
          userName: user?.name, 
          type, 
          amount, 
          status, 
          date: new Date().toISOString(),
          method,
          accountNumber,
          accountName
      });
      this.saveDB(db);
  }

  static async executeSpin(userId: string, winReward: number) {
    const db = this.getDB();
    const user = Object.values(db.users).find(u => u.id === userId);
    if (!user) return { success: false, message: "User not found" };

    const today = new Date().toISOString().split('T')[0];
    if (user.lastSpinDate === today && user.spinsToday >= 3) {
      return { success: false, message: "Daily spin limit reached" };
    }

    if (user.lastSpinDate !== today) {
      user.spinsToday = 0;
      user.lastSpinDate = today;
    }

    user.spinsToday += 1;
    user.coins = (user.coins || 0) + winReward;
    user.balance = (user.balance || 0) + (winReward / 1000);
    db.users[user.email.toLowerCase()] = user;

    if (winReward > 0) {
      db.transactions.push({
        id: 'tx_spin_' + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        type: 'spin',
        amount: winReward / 1000,
        status: 'completed',
        date: new Date().toISOString()
      });
    }
    this.saveDB(db);
    return { success: true, user, message: "Spin executed" };
  }

  static async getUser(email: string) { return this.getDB().users[email.toLowerCase()]; }
  
  static saveUser(user: User) {
      const db = this.getDB();
      const existing = db.users[user.email.toLowerCase()];
      if (existing) {
          db.users[user.email.toLowerCase()] = { ...existing, ...user };
          this.saveDB(db);
      }
  }

  static async getTransactions() { return this.getDB().transactions; }
  static async getBranding() { return this.getDB().branding!; }
  static async updateBranding(b: BrandingSettings) {
      const db = this.getDB();
      db.branding = b;
      this.saveDB(db);
  }
  static async getAllUsers() { return Object.values(this.getDB().users); }
  static async deleteUser(e: string) {
      const db = this.getDB();
      delete db.users[e.toLowerCase()];
      this.saveDB(db);
      return true;
  }
  static async updateUserFull(u: User) {
      const db = this.getDB();
      const key = u.email.toLowerCase();
      if (db.users[key]) {
          db.users[key] = { ...db.users[key], ...u, passwordHash: (db.users[key] as any).passwordHash };
          this.saveDB(db);
          return true;
      }
      return false;
  }

  static async updateTransactionStatus(id: string, s: Transaction['status']) {
      const db = this.getDB();
      const i = db.transactions.findIndex(t => t.id === id);
      if (i > -1) { 
        const tx = db.transactions[i];
        if (tx.status === 'completed') return false; 
        
        tx.status = s; 

        if (s === 'completed') {
           const user = Object.values(db.users).find(u => u.id === tx.userId);
           if (user) {
              if (tx.type === 'deposit') {
                user.balance = (user.balance || 0) + tx.amount;
                user.coins = (user.coins || 0) + Math.floor(tx.amount * 1000);
              } 
              db.users[user.email.toLowerCase()] = user;
           }
        } else if (s === 'rejected') {
            const user = Object.values(db.users).find(u => u.id === tx.userId);
            if (user && tx.type === 'withdrawal') {
                user.balance = (user.balance || 0) + tx.amount;
                user.coins = (user.coins || 0) + Math.floor(tx.amount * 1000);
                db.users[user.email.toLowerCase()] = user;
            }
        }
        this.saveDB(db); 
        return true; 
      }
      return false;
  }
  static async updateTaskStatus(id: string, s: any) {
      const db = this.getDB();
      const i = db.tasks.findIndex(t => t.id === id);
      if (i > -1) { db.tasks[i].status = s; this.saveDB(db); return true; }
      return false;
  }
  static async deleteTask(id: string) {
      const db = this.getDB();
      db.tasks = db.tasks.filter(t => t.id !== id);
      this.saveDB(db);
      return true;
  }
  static async getPlatformStats() {
      const db = this.getDB();
      const txs = db.transactions;
      return {
          totalUsers: Object.keys(db.users).length,
          totalPayouts: txs.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((s, t) => s + t.amount, 0),
          pendingWithdrawals: txs.filter(t => t.type === 'withdrawal' && t.status === 'pending').length,
          totalDeposits: txs.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0),
      };
  }
}
