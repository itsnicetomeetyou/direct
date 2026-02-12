import { configureStore } from "@reduxjs/toolkit";
import { authApiSlice } from "./auth/authApiSlice";
import { loginSlice } from "./auth/loginSlice";
import { informationRegistrationSlice } from "./auth/informationRegistrationSlice";
import { dashboardApiSlice } from "./dashboardApiSlice";
import { registerSlice } from "./auth/registerSlice";
import { documentApiSlice } from "./documentApiSlice";
import { documentSlice } from "./documentSlice";
import { statisticsApiSlice } from "./statisticsApiSlice";
import { profileApiSlice } from "./profileApiSlice";

const store = configureStore({
  reducer: {
    loginReducer: loginSlice.reducer,
    informationRegistrationReducer: informationRegistrationSlice.reducer,
    registerReducer: registerSlice.reducer,
    documentReducer: documentSlice.reducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [dashboardApiSlice.reducerPath]: dashboardApiSlice.reducer,
    [documentApiSlice.reducerPath]: documentApiSlice.reducer,
    [statisticsApiSlice.reducerPath]: statisticsApiSlice.reducer,
    [profileApiSlice.reducerPath]: profileApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat([
      authApiSlice.middleware,
      dashboardApiSlice.middleware,
      documentApiSlice.middleware,
      statisticsApiSlice.middleware,
      profileApiSlice.middleware,
    ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
