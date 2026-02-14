import type { TUserRes } from "@/types/TUser";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { setUser } from "./user/userSlice";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get("access_token") || "";
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    },
  }),
  tagTypes: ["User", "Category", "Expense"],
  endpoints: (builder) => ({
    loadUser: builder.query<TUserRes, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),

      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch (err) {
          console.log("Load user error >>>", err);
        }
      },
    }),
  }),
});

export const { useLoadUserQuery } = apiSlice;