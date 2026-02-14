import type { TCategory, TCategoryRes, TGetAllCategoriesRes } from "@/types/TCategory";
import { apiSlice } from "../apiSlice";
import type { TDeleteRes } from "@/types/TUser";

const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<TCategoryRes, Partial<TCategory>>({
      query: ({ title, description, type }) => ({
        url: "/categories",
        method: "POST",
        body: { title, description, type },
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<TCategoryRes, Partial<TCategory>>({
      query: ({ _id, title, description }) => ({
        url: `/categories/${_id}`,
        method: "PATCH",
        body: { title, description },
      }),
      invalidatesTags: ["Category"],
    }),

    getAllCategories: builder.query<TGetAllCategoriesRes, void>({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<TDeleteRes, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useGetAllCategoriesQuery,
} = categoryApi;