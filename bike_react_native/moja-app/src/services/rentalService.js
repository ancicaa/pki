const BASE_URL = 'http://172.20.10.4:3000';

export const fetchMyRentals = async (username) => {
  try {
    const response = await fetch(`${BASE_URL}/iznajmljivanja?korisnik=${username}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('fetchMyRentals error:', error);
    return [];
  }
};

export const createRental = async (rental) => {
    try {
      const res = await fetch(`${BASE_URL}/iznajmljivanja`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rental),
      });
  
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`createRental failed: ${res.status} ${text}`);
      }
  
      return await res.json();
    } catch (e) {
      console.error('createRental error:', e);
      return null;
    }
  };