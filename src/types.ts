import { ComponentResults } from './ember-tools/component-info';
import { DirectoryInformation } from './steps/get-pod-directory-information';

export interface AppContext {
  directoryInformation: DirectoryInformation;
  componentInfo: ComponentResults;
}

export interface UpgradePodArgs {
  baseDirectory: string;
  podDirectory?: string;
}
