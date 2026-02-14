import type { TUser } from "./TUser";

export enum ExpenseType {
  INCOME = "INCOME",
  OUTCOME = "OUTCOME",
}

export type TCategory = {
  _id: string;
  title: string;
  description?: string;
  type: ExpenseType;
  userId: string | TUser;
  createdAt: string;
  updatedAt: string;
};

export type TCategoryRes = {
    success: boolean;
    category: TCategory;
}

export type TGetAllCategoriesRes = {
    success: boolean;
    categories: TCategory[];
}