import type { TGetMessagesRes, TMessage, TMessageRes } from "@/types/TMessage";
import { apiSlice } from "../apiSlice";
import { setMessages } from "./messageSlice";

const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMessage: builder.mutation<TMessageRes, Partial<TMessage>>({
      query: ({ receiverId, message }) => ({
        url: "/messages",
        method: "POST",
        body: { receiverId, message },
      }),
    }),

    getAllMessages: builder.query<TGetMessagesRes, string>({
      query: (receiverId) => ({
        url: `/messages/${receiverId}`,
        method: "GET",
      }),

      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setMessages(data.messages));
        } catch (err) {
          console.log("get messages error >>>", err);
        }
      },
    }),
  }),
});

export const { 
  useCreateMessageMutation, 
  useGetAllMessagesQuery,
  useLazyGetAllMessagesQuery, 
} = messageApi;