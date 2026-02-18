import type { TMessage } from "@/types/TMessage";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: {
  messages: TMessage[];
  onlineUserIds: string[];
} = {
  messages: [],
  onlineUserIds: [],
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages: (state, { payload }: PayloadAction<TMessage[]>) => {
      state.messages = payload;
    },

    setNewMessage: (state, { payload }: PayloadAction<TMessage>) => {
      state.messages = [...state.messages, payload];
    },

    setOnlineUserIds: (state, { payload }: PayloadAction<string[]>) => {
      state.onlineUserIds = payload;
    },
  },
});

export const { setMessages, setNewMessage, setOnlineUserIds } = messageSlice.actions;
export default messageSlice.reducer;