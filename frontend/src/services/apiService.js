const API_URL = process.env.REACT_APP_API_URL || '/api';

const apiService = {
  // Games
  getFeaturedGames: async () => {
    try {
      const response = await fetch(`${API_URL}/games/featured`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured games');
      }
      return { data: await response.json() };
    } catch (error) {
      console.error('Error fetching featured games:', error);
      throw error;
    }
  },
  
  getWeeklyDiscounts: async () => {
    try {
      const response = await fetch(`${API_URL}/games/discounts`);
      if (!response.ok) {
        throw new Error('Failed to fetch weekly discounts');
      }
      return { data: await response.json() };
    } catch (error) {
      console.error('Error fetching weekly discounts:', error);
      throw error;
    }
  },
  
  getBestsellers: async () => {
    try {
      const response = await fetch(`${API_URL}/games/bestsellers`);
      if (!response.ok) {
        throw new Error('Failed to fetch bestsellers');
      }
      return { data: await response.json() };
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      throw error;
    }
  },
  
  getGamesByCategory: async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/games/category/${categoryId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch games for category ${categoryId}`);
      }
      return { data: await response.json() };
    } catch (error) {
      console.error('Error fetching games by category:', error);
      throw error;
    }
  },
  
  getGameDetails: async (gameId) => {
    if (!gameId) {
      throw new Error('Game ID is required');
    }
    
    try {
      const response = await fetch(`${API_URL}/games/${gameId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch details for game ${gameId}`);
      }
      return { data: await response.json() };
    } catch (error) {
      console.error('Error fetching game details:', error);
      throw error;
    }
  },
  
  // Categories
  getCategories: async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return { data: await response.json() };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  // Orders
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      return { data: await response.json() };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  // Game scraper
  scrapeGame: async (gameUrl) => {
    try {
      const response = await fetch(`${API_URL}/admin/scrape-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: gameUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to scrape game data');
      }
      
      return { data: await response.json() };
    } catch (error) {
      console.error('Error scraping game:', error);
      throw error;
    }
  },
};

export default apiService;