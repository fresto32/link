import {Severity, modelOptions, prop} from '@typegoose/typegoose';

@modelOptions({options: {allowMixed: Severity.ALLOW}})
export default class PromptSettings {
  @prop({required: true})
  text!: string;

  @prop()
  picture?: string;
}
