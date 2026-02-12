import { IRegisterSliceInitialState } from "@/typings";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

let initialState: IRegisterSliceInitialState = {
  input: {
    email: "",
    password: "",
    confirmPassword: "",
  },
};

export const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    setRegisterInputEmail: (state, action: PayloadAction<string>) => {
      state.input.email = action.payload;
    },
    setRegisterInputPassword: (state, action: PayloadAction<string>) => {
      state.input.password = action.payload;
    },
    setRegisterInputConfirmPassword: (state, action: PayloadAction<string>) => {
      state.input.confirmPassword = action.payload;
    },
    cleanUpRegisterInput: (state) => {
      state.input = {
        email: "",
        password: "",
        confirmPassword: "",
      };
    },
  },
  extraReducers(builder) {},
});

export const {
  setRegisterInputConfirmPassword,
  setRegisterInputEmail,
  setRegisterInputPassword,
  cleanUpRegisterInput,
} = registerSlice.actions;
export default registerSlice.reducer;
