import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

const normalizeUser = (data) => {
  if (!data) {
    return null;
  }

  // Backend response:
  // {
  //   success: true,
  //   token: "...",
  //   user: {
  //     _id: "...",
  //     name: "...",
  //     email: "...",
  //     role: "user",
  //     defaultAddress: {...}
  //   }
  // }

  if (data.user) {
    return {
      ...data.user,
      token: data.token
    };
  }

  // Already-normalized user
  return data;
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sikhArmyUser');

    if (!savedUser) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      // Fix old localStorage data if it was saved as:
      // { token, user: {...} }
      return normalizeUser(parsedUser);

    } catch (error) {
      console.error('Invalid saved user data:', error);
      localStorage.removeItem('sikhArmyUser');
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    const normalizedUser = normalizeUser(userData);

    console.log('Logged in user:', normalizedUser);

    setUser(normalizedUser);

    localStorage.setItem(
      'sikhArmyUser',
      JSON.stringify(normalizedUser)
    );
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sikhArmyUser');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};