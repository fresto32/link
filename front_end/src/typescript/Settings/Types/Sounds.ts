export default interface SoundsSettings {
  itemSettings: ItemSettings[];
}

interface ItemSettings {
  name: string;
  sounds: string[];
  minDelta: number;
  volumeMin: number;
  volumeMax: number;
  rateMin: number;
  rateMax: number;
}
