import { configureStore } from '@reduxjs/toolkit';
import orderSliceReducer from './kiosk/orderSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      kioskOrder: orderSliceReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
