import {Severity, modelOptions, prop} from '@typegoose/typegoose';
import PromptSettings from './Prompt';

@modelOptions({options: {allowMixed: Severity.ALLOW}})
export default class OptionSettings extends PromptSettings {
  @prop({required: true})
  position!: {
    x: number;
    z: number;
  };

  @prop({required: true})
  isCorrectOption!: boolean;
}
