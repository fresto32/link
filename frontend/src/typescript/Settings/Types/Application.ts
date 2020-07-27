import ResourcesSettings from './Resources';
import WorldSettings from './World';

export default interface ApplicationSettings {
  config: Config;
  resources: ResourcesSettings;
  world: WorldSettings;
}
