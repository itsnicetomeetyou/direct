import { IInformationRegistrationSliceInitialState } from "@/typings";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

let initialState: IInformationRegistrationSliceInitialState = {
  personalInformation: {
    firstName: null,
    middleName: null,
    lastName: null,
    address: null,
    phoneNo: null,
  },
  academicInformation: {
    studentNo: null,
    specialOrderNo: null,
    lrn: null,
  },
};

export const informationRegistrationSlice = createSlice({
  name: "informationRegistration",
  initialState,
  reducers: {
    setPersonalInformationFirstName: (state, action: PayloadAction<string>) => {
      state.personalInformation.firstName = action.payload;
    },
    setPersonalInformationMiddleName: (state, action: PayloadAction<string>) => {
      state.personalInformation.middleName = action.payload;
    },
    setPersonalInformationLastName: (state, action: PayloadAction<string>) => {
      state.personalInformation.lastName = action.payload;
    },
    setPersonalInformationPhoneNumber: (state, action: PayloadAction<string>) => {
      state.personalInformation.phoneNo = action.payload;
    },
    setPersonalInformationAddress: (state, action: PayloadAction<string>) => {
      state.personalInformation.address = action.payload;
    },
    setAcademicInformationStudentNo: (state, action: PayloadAction<string>) => {
      state.academicInformation.studentNo = action.payload;
    },
    setAcademicInformationSpecialOrderNo: (state, action: PayloadAction<string>) => {
      state.academicInformation.specialOrderNo = action.payload;
    },
    setAcademicInformationLRN: (state, action: PayloadAction<string>) => {
      state.academicInformation.lrn = action.payload;
    },
    cleanUpInformationRegistration: (state) => {
      state = {
        personalInformation: {
          firstName: null,
          middleName: null,
          lastName: null,
          address: null,
          phoneNo: null,
        },
        academicInformation: {
          studentNo: null,
          specialOrderNo: null,
          lrn: null,
        },
      };
    },
  },
  extraReducers(builder) {},
});

export const {
  setAcademicInformationLRN,
  setAcademicInformationSpecialOrderNo,
  setAcademicInformationStudentNo,
  setPersonalInformationAddress,
  setPersonalInformationFirstName,
  setPersonalInformationLastName,
  setPersonalInformationMiddleName,
  setPersonalInformationPhoneNumber,
  cleanUpInformationRegistration,
} = informationRegistrationSlice.actions;
export default informationRegistrationSlice.reducer;
