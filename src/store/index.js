import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import { persistStore } from "redux-persist";

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);
export default store;
