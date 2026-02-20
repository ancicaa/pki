const BASE_URL = 'http://172.20.10.4:3000';

export const fetchMapPins = async () => {
  try {
    const [bikesRes, parkingsRes] = await Promise.all([
      fetch(`${BASE_URL}/bikes`),
      fetch(`${BASE_URL}/parkings`)
    ]);

    const bikes = await bikesRes.json();
    const parkings = await parkingsRes.json();

    const bikePins = bikes
      .filter(b => b.status === 'Dostupan' && b.latitude && b.longitude)
      .map(b => ({
        id: `b${b.id}`,
        type: 'bike',
        latitude: b.latitude,
        longitude: b.longitude,
        bikeInfo: {
          bikeId: b.id,
          address: b.adresa ?? '',
          bikeType: b.tip,
          pricePerMinute: b.cena,
          battery: b.baterija ?? 100,
        }
      }));

    const parkingPins = parkings.map(p => ({
      id: `p${p.id}`,
      type: 'parking',
      latitude: p.latitude,
      longitude: p.longitude,
      parkingInfo: {
        address: p.adresa ?? '',
        distanceMeters: 0,
      }
    }));

    return [...bikePins, ...parkingPins];

  } catch (error) {
    console.error('fetchMapPins error:', error);
    return [];
  }
};

export const fetchAvailableBikes = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bikes?status=Dostupan`);
      const bikes = await res.json();
  
      return bikes
        .filter(b => b?.id != null)
        .map(b => ({
          id: String(b.id),          
          label: `#${b.id} (${b.tip ?? 'bicikl'})`, 
          raw: b,                     
        }));
    } catch (error) {
      console.error('fetchAvailableBikes error:', error);
      return [];
    }
  };

  export const setBikeStatus = async (bikeId, status) => {
    try {
      const res = await fetch(`${BASE_URL}/bikes/${bikeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
  
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`setBikeStatus failed: ${res.status} ${text}`);
      }
  
      return await res.json();
    } catch (error) {
      console.error('setBikeStatus error:', error);
      return null;
    }
  };
  export const fetchBikeById = async (bikeId) => {
    try {
      const res = await fetch(`${BASE_URL}/bikes/${bikeId}`);
      if (!res.ok) throw new Error(`fetchBikeById failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('fetchBikeById error:', e);
      return null;
    }
  };

  export const createProblemReport = async (report) => {
    try {
      const res = await fetch(`${BASE_URL}/prijavljeni_problemi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
  
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`createProblemReport failed: ${res.status} ${txt}`);
      }
  
      return await res.json();
    } catch (e) {
      console.error('createProblemReport error:', e);
      return null;
    }
  };