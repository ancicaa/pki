const BASE_URL = 'http://172.20.10.4:3000';

export const loginUser = async (korisnickoIme, lozinka) => {
  try {
    const response = await fetch(
      `${BASE_URL}/users?username=${korisnickoIme}`
    );
    const users = await response.json();

    if (users.length === 0) {
      return { success: false, message: 'Pogrešno korisničko ime ili lozinka.' };
    }

    const user = users[0];

    if (user.password !== lozinka) {
      return { success: false, message: 'Pogrešno korisničko ime ili lozinka.' };
    }

    if (user.role !== 'user') {
      return { success: false, message: 'Nemate pristup mobilnoj aplikaciji.' };
    }

    return { success: true, user };

  } catch (error) {
    return { success: false, message: 'Nije moguće povezati se sa serverom.' };
  }
};

export const registerUser = async (userData) => {
  try {
    const checkResponse = await fetch(
      `${BASE_URL}/users?username=${userData.korisnickoIme}`
    );
    const existing = await checkResponse.json();

    if (existing.length > 0) {
      return { success: false, message: 'Korisničko ime već postoji.' };
    }

    const newUser = {
      ...userData,
      role: 'user'
    };

    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    const created = await response.json();
    return { success: true, user: created };

  } catch (error) {
    return { success: false, message: 'Nije moguće povezati se sa serverom.' };
  }
};

export const fetchUserById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/users/${id}`);
    if (!res.ok) throw new Error(`fetchUserById failed: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('fetchUserById error:', e);
    return null;
  }
};

export const changePassword = async (userId, newPassword) => {
  try {
    const res = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`changePassword failed: ${res.status} ${txt}`);
    }

    return await res.json();
  } catch (e) {
    console.error('changePassword error:', e);
    return null;
  }
};
export const changePasswordWithVerify = async (userId, oldPass, newPass) => {
  const user = await fetchUserById(userId);
  if (!user) return { ok: false, reason: 'USER_NOT_FOUND' };

  if ((user.password ?? '') !== oldPass) {
    return { ok: false, reason: 'OLD_PASSWORD_WRONG' };
  }

  const updated = await changePassword(userId, newPass);
  if (!updated) return { ok: false, reason: 'SAVE_FAILED' };

  return { ok: true, user: updated };
};