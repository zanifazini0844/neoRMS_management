import React from 'react';
import Login from './login/Login';
import Register from './registration/Register';

export const authRoutes = [
  {
    path: '/auth/sign-in',
    element: <Login />,
  },
  {
    path: '/auth/sign-up',
    element: <Register />,
  },
];

export default authRoutes;