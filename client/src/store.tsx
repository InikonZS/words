import { PayloadAction, configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
// ...

export interface CounterState {
value: number
}

const initialState: CounterState = {
    value: 0,
}

export const getData = createAsyncThunk(
    'get_data',
    async (arg: string) => {
      const response = await new Promise<{data:number, arg: string}>(res => setTimeout(()=>res({data:1234, arg: arg}), 1000));
      return response;
    }
  )

export const counterSlice = createSlice({
name: 'counter',
initialState,
reducers: {
    increment: (state) => {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
    console.log('wqer');
    state.value += 1
    },
    decrement: (state) => {
    state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
    state.value += action.payload
    },
},
extraReducers: (builder)=>{
    builder.addCase(getData.fulfilled, (state, action)=>{
        console.log('action', action);
        state.value+=1;
    })
}
})

export const store = configureStore({
    //middleware: [thunkMiddleware],
    reducer: {
        counter: counterSlice.reducer
    }
})



export const { increment, decrement, incrementByAmount } = counterSlice.actions
interface AppState{
    value: number
}
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export type AppDispatch = typeof store.dispatch;




