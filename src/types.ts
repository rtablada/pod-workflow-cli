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

export interface PrDescriptionArgs {
  baseDir: string;
  podDashboardUrl: string;
  outputOnly: boolean;
}
