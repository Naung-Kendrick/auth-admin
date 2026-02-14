import type { ExpenseType, TCategory } from "./TCategory";
import type { TUser } from "./TUser";

export type TExpense = {
  _id: string;
  type: ExpenseType;
  description: string;
  remark?: string;
  qty: number;
  unit?: string;
  amount: number;
  totalAmount: number;
  categoryId: string | TCategory;
  userId: string | TUser;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type TExpenseRes = {
    success: boolean;
    expense: TExpense;
}

export type TGetAllExpensesReq = {
  type?: ExpenseType;
  categoryId?: string; 
  page?: number;
  limit?: number;
  filterBy?: "date" | "dateRange" | "month";
  date?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
}

export type TGetAllExpensesRes = {
    success: boolean;
    expenses: TExpense[];
}

export type TGetAllExpensesByAdminReq = {
  type?: ExpenseType;
  userId?: string;
  page?: string;
  limit?: string;
}