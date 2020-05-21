export default interface ResourcesSettings {
  items: Item[];
}

interface Item {
  name: string;
  source: string;
  type?: string;
}
