import { registeredUsers } from '../data/mockUsers';

// Simulacija API delay-a
const simulateApiCall = (callback, delay = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(callback());
    }, delay);
  });
};

// Login
export const loginUser = async (korisnickoIme, lozinka) => {
  return await simulateApiCall(() => {
    const user = registeredUsers.find(
      u => u.korisnickoIme === korisnickoIme && u.lozinka === lozinka
    );
    return user ? { success: true, user } : { success: false, message: 'Pogrešni podaci' };
  });
};

// Registracija
export const registerUser = async (userData) => {
  return await simulateApiCall(() => {
    const existingUser = registeredUsers.find(
      u => u.korisnickoIme === userData.korisnickoIme || u.email === userData.email
    );

    if (existingUser) {
      return { success: false, message: 'Korisničko ime ili email već postoje' };
    }

    const newUser = {
      id: registeredUsers.length + 1,
      ...userData
    };

    registeredUsers.push(newUser);
    return { success: true, user: newUser };
  });
};