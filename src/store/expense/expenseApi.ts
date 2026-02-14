import type { TExpense, TExpenseRes, TGetAllExpensesReq, TGetAllExpensesRes } from "@/types/TExpense";
import { apiSlice } from "../apiSlice";
import type { TDeleteRes } from "@/types/TUser";
import { extractQuery } from "@/utils/services";

const expenseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createExpense: builder.mutation<TExpenseRes, Partial<TExpense>>({
      query: ({ description, remark, qty, unit, amount, categoryId, date }) => ({
        url: "/expenses",
        method: "POST",
        body: { description, remark, qty, unit, amount, categoryId, date },
      }),
      invalidatesTags: ["Expense"],
    }),

    updateExpense: builder.mutation<TExpenseRes, Partial<TExpense>>({
      query: ({ _id, description, remark, qty, unit, amount, date }) => ({
        url: `/expenses/${_id}`,
        method: "PATCH",
        body: { description, remark, qty, unit, amount, date },
      }),
      invalidatesTags: ["Expense"],
    }),

    getAllExpenses: builder.query<TGetAllExpensesRes, TGetAllExpensesReq>({
      query: (query) => ({
        url: `/expenses?${extractQuery(query)}`,
        method: "GET",
      }),
      providesTags: ["Expense"],
    }),

    deleteExpense: builder.mutation<TDeleteRes, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense"],
    }),
  }),
});

export const {
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
    useGetAllExpensesQuery,
} = expenseApi;