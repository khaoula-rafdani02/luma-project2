import { create } from 'zustand'
import api from '../api/axiosInstance'

export const useCartStore = create((set, get) => ({
  cart: { items: [] },
  loading: false,

  // Load the cart (from API if logged in, otherwise from localStorage)
  fetchCart: async () => {
    const isAuthenticated = !!localStorage.getItem('token');
    set({ loading: true });

    try {
      if (isAuthenticated) {
        try {
          const { data } = await api.get('/client/cart');
          set({ cart: data, loading: false });
        } catch (err) {
          console.error("Failed to fetch authenticated cart", err);
          set({ cart: { items: [] }, loading: false });
        }
      } else {
        const localCart = localStorage.getItem('luma-guest-cart');
        const items = localCart ? JSON.parse(localCart) : [];
        set({ cart: { items }, loading: false });
      }
    } catch (err) {
      console.error("Unexpected cart fetch error", err);
      set({ loading: false });
    }
  },

  // Add an item to the cart
  addItem: async (product, variant, quantity) => {
    const isAuthenticated = !!localStorage.getItem('token');
    
    if (isAuthenticated) {
      try {
        await api.post('/client/cart/add', {
          product_id: product.id,
          product_variant_id: variant.id,
          quantity: quantity
        });
        await get().fetchCart();
      } catch (err) {
        console.error("Failed to add item on server", err);
        throw err;
      }
    } else {
      const currentItems = [...get().cart.items];
      const existingItemIndex = currentItems.findIndex(
        (item) => item.product_variant_id === variant.id
      );

      if (existingItemIndex > -1) {
        currentItems[existingItemIndex].quantity += quantity;
      } else {
        const tempId = 'guest_' + Math.random().toString(36).substr(2, 9);
        currentItems.push({
          id: tempId,
          product_id: product.id,
          product_variant_id: variant.id,
          quantity: quantity,
          product: product,
          variant: variant
        });
      }

      localStorage.setItem('luma-guest-cart', JSON.stringify(currentItems));
      set({ cart: { items: currentItems } });
    }
  },

  // Update item quantity
  updateQty: async (itemId, quantity) => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (isAuthenticated) {
      try {
        await api.put(`/client/cart/${itemId}`, { quantity });
        await get().fetchCart();
      } catch (err) {
        console.error("Failed to update item qty on server", err);
      }
    } else {
      const currentItems = get().cart.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity };
        }
        return item;
      });
      localStorage.setItem('luma-guest-cart', JSON.stringify(currentItems));
      set({ cart: { items: currentItems } });
    }
  },

  // Remove an item
  removeItem: async (itemId) => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (isAuthenticated) {
      try {
        await api.delete(`/client/cart/${itemId}`);
        await get().fetchCart();
      } catch (err) {
        console.error("Failed to remove item on server", err);
      }
    } else {
      const currentItems = get().cart.items.filter((item) => item.id !== itemId);
      localStorage.setItem('luma-guest-cart', JSON.stringify(currentItems));
      set({ cart: { items: currentItems } });
    }
  },

  // Clear cart (e.g. after order placement or logout)
  clearCart: () => {
    localStorage.removeItem('luma-guest-cart');
    set({ cart: { items: [] } });
  },

  // Sync guest cart to server after login
  syncCart: async () => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) return;

    const localCart = localStorage.getItem('luma-guest-cart');
    if (!localCart) return;

    try {
      const items = JSON.parse(localCart);
      for (const item of items) {
        await api.post('/client/cart/add', {
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity
        });
      }
      localStorage.removeItem('luma-guest-cart');
      await get().fetchCart();
    } catch (err) {
      console.error("Cart synchronization failed", err);
    }
  }
}));
