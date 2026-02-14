import type {
  TDeleteRes,
  TGetAllUsersRes,
  TLoginUserRes,
  TUpdatePasswordReq,
  TUpdateUserPasswordReq,
  TUpdateUserRoleReq,
  TUser,
  TUserRes,
} from "@/types/TUser";
import { apiSlice } from "../apiSlice";
import { setAllUsers, setUser } from "./userSlice";
import Cookies from 'js-cookie';

const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<TUserRes, Partial<TUser>>({
      query: ({ name, email, password, phone }) => ({
        url: "/users/register",
        method: "POST",
        body: { name, email, password, phone },
      }),
    }),

    loginUser: builder.mutation<TLoginUserRes, Partial<TUser>>({
      query: ({ email, password }) => ({
        url: "/users/login",
        method: "POST",
        body: { email, password },
      }),

      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
            const { data } = await queryFulfilled;
            Cookies.set("access_token", data.accessToken, { expires: 7 });
            dispatch(setUser(data.user));
        } catch (err) {
            console.log("Login error >>>", err);
        }
      }
    }),

    getUserById: builder.query<TUserRes, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
    }),

    updateUserInfo: builder.mutation<TUserRes, Partial<TUser>>({
      query: ({ name, email, phone, active }) => ({
        url: "/users",
        method: "PATCH",
        body: { name, email, phone, active },
      }),

      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
            const { data } = await queryFulfilled;
            dispatch(setUser(data.user));
        } catch (err) {
            console.log("Update user info error >>>", err);
        }
      }
    }),

    updateUserPwd: builder.mutation<TUserRes, TUpdatePasswordReq>({
      query: ({ oldPassword, newPassword }) => ({
        url: "/users/update-pwd",
        method: "PATCH",
        body: { oldPassword, newPassword },
      }),
    }),

    updateUserAvatar: builder.mutation<TUserRes, FormData>({
      query: (formData) => ({
        url: "/users/update-avatar",
        method: "PATCH",
        body: formData,
      }),

      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
            const { data } = await queryFulfilled;
            dispatch(setUser(data.user));
        } catch (err) {
            console.log("Update avatar error >>>", err);
        }
      }
    }),

    getAllUsersByAdmin: builder.query<TGetAllUsersRes, void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["User"],

      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
            const { data } = await queryFulfilled;
            dispatch(setAllUsers(data.users));
        } catch (err) {
            console.log("Get all users by admin error >>>", err);
        }
      }
    }),

    updateUserRole: builder.mutation<TUserRes, TUpdateUserRoleReq>({
      query: ({ userId, role }) => ({
        url: "/users/update-role",
        method: "PATCH",
        body: { userId, role },
      }),
      invalidatesTags: ["User"],
    }),

    updateUserPwdByAdmin: builder.mutation<TUserRes, TUpdateUserPasswordReq>({
      query: ({ userId, newPassword }) => ({
        url: "/users/update-pwd-admin",
        method: "PATCH",
        body: { userId, newPassword },
      }),
    }),

    deleteUser: builder.mutation<TDeleteRes, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useGetUserByIdQuery,
    useUpdateUserInfoMutation,
    useUpdateUserPwdMutation,
    useUpdateUserAvatarMutation,
    useGetAllUsersByAdminQuery,
    useUpdateUserRoleMutation,
    useUpdateUserPwdByAdminMutation,
    useDeleteUserMutation,
} = userApi;