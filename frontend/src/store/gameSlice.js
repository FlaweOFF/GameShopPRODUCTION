import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/apiService';

export const fetchFeaturedGames = createAsyncThunk(
  'games/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getFeaturedGames();
      return response.data.data || []; // Ensure we return an array
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch featured games');
    }
  }
);

export const fetchWeeklyDiscounts = createAsyncThunk(
  'games/fetchWeeklyDiscounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getWeeklyDiscounts();
      return response.data.data || []; // Ensure we return an array
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch weekly discounts');
    }
  }
);

export const fetchBestsellers = createAsyncThunk(
  'games/fetchBestsellers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getBestsellers();
      return response.data.data || []; // Ensure we return an array
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch bestsellers');
    }
  }
);

export const fetchGamesByCategory = createAsyncThunk(
  'games/fetchByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await apiService.getGamesByCategory(categoryId);
      return response.data.data || []; // Ensure we return an array
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch games by category');
    }
  }
);

export const fetchGameDetails = createAsyncThunk(
  'games/fetchDetails',
  async (gameId, { rejectWithValue }) => {
    if (!gameId) {
      return rejectWithValue('Game ID is missing');
    }
    
    try {
      const response = await apiService.getGameDetails(gameId);
      return response.data.data; // Return the game data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch game details');
    }
  }
);

const gameSlice = createSlice({
  name: 'games',
  initialState: {
    featuredGames: [],
    weeklyDiscounts: [],
    bestsellers: [],
    categoryGames: [],
    currentGame: {
      game: null,
      loading: 'idle',
      error: null
    },
    loading: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Featured Games
      .addCase(fetchFeaturedGames.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchFeaturedGames.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.featuredGames = action.payload;
      })
      .addCase(fetchFeaturedGames.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
        // Initialize as empty array if error
        state.featuredGames = [];
      })
      
      // Weekly Discounts
      .addCase(fetchWeeklyDiscounts.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchWeeklyDiscounts.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.weeklyDiscounts = action.payload;
      })
      .addCase(fetchWeeklyDiscounts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
        // Initialize as empty array if error
        state.weeklyDiscounts = [];
      })
      
      // Bestsellers
      .addCase(fetchBestsellers.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchBestsellers.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.bestsellers = action.payload;
      })
      .addCase(fetchBestsellers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
        // Initialize as empty array if error
        state.bestsellers = [];
      })
      
      // Category Games
      .addCase(fetchGamesByCategory.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchGamesByCategory.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.categoryGames = action.payload;
      })
      .addCase(fetchGamesByCategory.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
        // Initialize as empty array if error
        state.categoryGames = [];
      })
      
      // Game Details
      .addCase(fetchGameDetails.pending, (state) => {
        state.currentGame.loading = 'pending';
      })
      .addCase(fetchGameDetails.fulfilled, (state, action) => {
        state.currentGame.loading = 'succeeded';
        state.currentGame.game = action.payload;
        state.currentGame.error = null;
      })
      .addCase(fetchGameDetails.rejected, (state, action) => {
        state.currentGame.loading = 'failed';
        state.currentGame.error = action.payload;
      });
  },
});

export default gameSlice.reducer;