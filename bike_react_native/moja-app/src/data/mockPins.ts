export type PinType = 'bike' | 'parking';

export type BikeInfo = {
  address: string;
  bikeType: 'Električni' | 'Klasični';
  pricePerMinute: number;
  battery: number; 
};

export type ParkingInfo = {
  address: string;
  distanceMeters: number; 
};

export type MapPin = {
  id: string;
  type: PinType;
  latitude: number;
  longitude: number;
  label?: string; 
  bikeInfo?: BikeInfo;
  parkingInfo?: ParkingInfo;
};

export const MOCK_PINS: MapPin[] = [
  {
    id: 'b1',
    type: 'bike',
    latitude: 44.8068,
    longitude: 20.4698,
    label: '100',
    bikeInfo: {
      address: 'Cara Nikolaja 91',
      bikeType: 'Električni',
      pricePerMinute: 12,
      battery: 75,
    },
  },
  {
    id: 'b2',
    type: 'bike',
    latitude: 44.8039,
    longitude: 20.4732,
    bikeInfo: {
      address: 'Njegoševa 24',
      bikeType: 'Električni',
      pricePerMinute: 12,
      battery: 62,
    },
  },
  {
    id: 'b3',
    type: 'bike',
    latitude: 44.8019,
    longitude: 20.4709,
    bikeInfo: {
      address: 'Topolska 18',
      bikeType: 'Klasični',
      pricePerMinute: 8,
      battery: 100, // klasični → uvek 100%
    },
  },
  {
    id: 'b4',
    type: 'bike',
    latitude: 44.8082,
    longitude: 20.4748,
    bikeInfo: {
      address: 'Bulevar Kralja Aleksandra 73',
      bikeType: 'Električni',
      pricePerMinute: 15,
      battery: 41,
    },
  },
  {
    id: 'p1',
    type: 'parking',
    latitude: 44.8057,
    longitude: 20.4710,
    parkingInfo: { address: 'Prote Mateje 10', distanceMeters: 150 },
  },
  {
    id: 'p2',
    type: 'parking',
    latitude: 44.8045,
    longitude: 20.4668,
    parkingInfo: { address: 'Kralja Milutina 10', distanceMeters: 320 },
  },
  {
    id: 'p3',
    type: 'parking',
    latitude: 44.8006,
    longitude: 20.4686,
    parkingInfo: { address: 'Kneginje Zorke 32', distanceMeters: 90 },
  },
  {
    id: 'p4',
    type: 'parking',
    latitude: 44.8069,
    longitude: 20.4716,
    parkingInfo: { address: 'Beogradska 1', distanceMeters: 150 },
  },
  {
    id: 'p5',
    type: 'parking',
    latitude: 44.8095,
    longitude: 20.4678,
    parkingInfo: { address: 'Resavska 2', distanceMeters: 320 },
  },
];

