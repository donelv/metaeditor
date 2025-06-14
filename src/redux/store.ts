import { configureStore } from '@reduxjs/toolkit'

// import metagraphReducer from './brands-reducer'
import metagraphReducer from './metagraph-reducer'

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // immutableCheck: { warnAfter: 128 },
      serializableCheck: {
        // ignoredActions: ['printers/connectPrintersToMqtt/fulfilled'],
        // warnAfter: 128,
      },
    }),
  reducer: {
    metagraphPage: metagraphReducer,
  },
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
