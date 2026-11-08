export type Coord = {
  latitude: number;
  longitude: number;
  /** Unix ms when the point was recorded. */
  timestamp: number;
};

export type Poop = {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
};

export type Rating = 1 | 2 | 3 | 4 | 5;

export type Walk = {
  id: string;
  startedAt: number;
  endedAt: number | null;
  route: Coord[];
  distanceKm: number;
  steps: number;
  poops: Poop[];
  rating: Rating | null;
  note: string;
};
