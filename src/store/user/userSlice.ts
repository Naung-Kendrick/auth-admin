import type { TUser } from "@/types/TUser";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: {
    user: TUser | null;
    allUsers: TUser[];
} = {
    user: null,
    allUsers: [],
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, { payload }: PayloadAction<TUser>) => {
            state.user = payload;
        },

        setAllUsers: (state, { payload }: PayloadAction<TUser[]>) => {
            state.allUsers = payload;
        },

        clearUser: (state) => {
            state.user = null;
            state.allUsers = [];
        },
    }
});

export const { setUser, setAllUsers, clearUser } = userSlice.actions;
export default userSlice.reducer;