// Author: 7100 //

import Cookies from 'js-cookie';

const defaultOptions = {
  expires: 30, 
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

export const setCookie = (name, value, options = {}) => {
  Cookies.set(name, value, { ...defaultOptions, ...options });
};

export const getCookie = (name) => {
  return Cookies.get(name);
};

export const removeCookie = (name, options = {}) => {
  Cookies.remove(name, { ...defaultOptions, ...options });
};

export const hasCookie = (name) => {
  return Cookies.get(name) !== undefined;
};

export const setObjectCookie = (name, value, options = {}) => {
  setCookie(name, JSON.stringify(value), options);
};

export const getObjectCookie = (name) => {
  const cookie = getCookie(name);
  if (!cookie) return null;
  
  try {
    return JSON.parse(cookie);
  } catch (error) {
    console.error(`Error parsing cookie ${name}:`, error);
    return null;
  }
};