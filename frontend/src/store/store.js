import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import categoryReducer from './categorySlice';
import cartReducer from './cartSlice';

export default configureStore({
  reducer: {
    games: gameReducer,
    categories: categoryReducer,
    cart: cartReducer,
  },
});