import {Severity, modelOptions, prop} from '@typegoose/typegoose';

@modelOptions({options: {allowMixed: Severity.ALLOW}})
export default class ResourcesSettings {
  @prop({required: true, type: () => [Item]})
  items!: Item[];
}

class Item {
  @prop({required: true})
  name!: string;

  @prop({required: true})
  source!: string;

  @prop()
  type?: string;
}
