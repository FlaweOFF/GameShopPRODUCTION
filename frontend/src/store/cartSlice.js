import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0
  },
  reducers: {
    addToCart: (state, action) => {
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      if (existingItemIndex >= 0) {
        // Item already exists, update it
        state.items[existingItemIndex] = action.payload;
      } else {
        // Add new item
        state.items.push(action.payload);
      }
      
      // Recalculate total
      state.total = state.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    },
    removeFromCart: (state, action) => {
      // Remove item by id
      state.items = state.items.filter(item => item.id !== action.payload);
      
      // Recalculate total
      state.total = state.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    }
  }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;