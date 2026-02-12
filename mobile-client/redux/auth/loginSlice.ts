import { ILoginSliceInitialState } from "@/typings";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

let initialState: ILoginSliceInitialState = {
  input: {
    email: "",
    password: "",
  },
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setLoginEmailInput: (state, action: PayloadAction<string>) => {
      state.input.email = action.payload;
    },
    setLoginPasswordInput: (state, action: PayloadAction<string>) => {
      state.input.password = action.payload;
    },
    cleanUpLoginInput: (state) => {
      state.input = {
        email: "",
        password: "",
      };
    },
  },
  extraReducers: (builder) => {},
});

export const { setLoginEmailInput, setLoginPasswordInput, cleanUpLoginInput } = loginSlice.actions;
export default loginSlice.reducer;
