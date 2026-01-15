
export enum TaskCategory {
  SPIN = 'Spin & Income',
  YOUTUBE = 'YouTube',
  SOCIAL = 'Social Media',
  WEBSITE = 'Website Visit',
  APP = 'App Engagement'
}

export interface User {
  id: string;
  name: string;
  email: string;
  coins: number;
  balance: number;
  referralCode: string;
  referrals: number;
  joinDate: string;
  lastBonusDate?: string;
  loginStreak: number;
  role: 'admin' | 'user' | 'advertiser'; // Added advertiser role
  spinsToday: number;
  lastSpinDate?: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  description: string;
  reward: number;
  instructions: string[];
  status: 'available' | 'paused' | 'removed' | 'completed';
  creatorId: string;
  completions: number;
  limit: number;
  link: string;
  autoApprove: boolean; // New property for instant verification
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  workerId: string;
  workerName: string;
  proofText: string;
  proofScreenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reward: number;
  aiVerdict?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'referral' | 'bonus' | 'spin';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  method?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface AuthState {
  user: null | User;
  isAuthenticated: boolean;
}
