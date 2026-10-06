// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
// };

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState,
//   reducers: {
//     addToCart: (state, action) => {
//       const item = action.payload;
//       const existItem = state.cartItems.find((x) => x.productId === item.productId);
//       if (existItem) {
//         state.cartItems = state.cartItems.map((x) =>
//           x.productId === existItem.productId ? item : x
//         );
//       } else {
//         state.cartItems.push(item);
//       }
//       localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
//     },
//     removeFromCart: (state, action) => {
//       state.cartItems = state.cartItems.filter((x) => x.productId !== action.payload);
//       localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
//     },
//     clearCart: (state) => {
//       state.cartItems = [];
//       localStorage.removeItem('cartItems');
//     }
//   },
// });

// export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
// export default cartSlice.reducer;


import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: JSON.parse(localStorage.getItem('cartItems')) || []
};

const cartSlice = createSlice({
  name: 'cart',

  initialState,

  reducers: {

    addToCart: (state, action) => {

      const existingItem = state.cartItems.find(
        item => item.productId === action.payload.productId
      );

      if (existingItem) {
        existingItem.qty += action.payload.qty || 1;
      } else {
        state.cartItems.push(action.payload);
      }

      localStorage.setItem(
        'cartItems',
        JSON.stringify(state.cartItems)
      );
    },


    buyNow: (state, action) => {

      state.cartItems = [
        {
          ...action.payload,
          qty: 1
        }
      ];

      localStorage.setItem(
        'cartItems',
        JSON.stringify(state.cartItems)
      );
    },


    removeFromCart: (state, action) => {

      state.cartItems = state.cartItems.filter(
        item => item.productId !== action.payload
      );

      localStorage.setItem(
        'cartItems',
        JSON.stringify(state.cartItems)
      );
    },


    updateQuantity: (state, action) => {

      const item = state.cartItems.find(
        item => item.productId === action.payload.productId
      );

      if (item) {
        item.qty = action.payload.qty;
      }

      localStorage.setItem(
        'cartItems',
        JSON.stringify(state.cartItems)
      );
    },


    clearCart: (state) => {

      state.cartItems = [];

      localStorage.removeItem('cartItems');
    }

  }
});

export const {
  addToCart,
  buyNow,
  removeFromCart,
  updateQuantity,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;