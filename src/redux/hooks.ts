import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, AppStore, RootState } from './store'

// import { useCallback } from 'react'
// import { AsyncThunkAction, unwrapResult } from '@reduxjs/toolkit'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()

// import { useAppDispatch } from '@root/store';

// export const useUnwrapAsyncThunk = () => {
//   const dispatch = useAppDispatch()
//   return useCallback(
//     <R extends any>(asyncThunk: AsyncThunkAction<R, any, any>): Promise<R> =>
//       dispatch(asyncThunk).then(unwrapResult),
//     [dispatch]
//   )
// }
