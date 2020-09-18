import {prop} from '@typegoose/typegoose';

export default class PromptSettings {
  @prop({required: true})
  text!: string;

  @prop()
  picture?: string;
}
