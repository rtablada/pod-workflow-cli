import { pascalCase } from '../utils';
import { ComponentInfo } from '../ember-tools/component-info';

export default class ComponentUsedInfo {
  componentInfo: ComponentInfo;
  usesInCurrentPaths: string[];
  usesInOtherPaths: string[];

  constructor(componentInfo: ComponentInfo, relativePaths: string[]) {
    this.componentInfo = componentInfo;

    const occuranceInfo = componentInfo.occurrences.reduce(
      (accum, occurance) => {
        if (relativePaths.includes(occurance.file)) {
          accum.usesInCurrentPaths = [...accum.usesInCurrentPaths, occurance.file];
        } else {
          accum.usesInOtherPaths = [...accum.usesInOtherPaths, occurance.file];
        }

        return accum;
      },
      { usesInCurrentPaths: [], usesInOtherPaths: [] }
    );

    this.usesInCurrentPaths = occuranceInfo.usesInCurrentPaths;
    this.usesInOtherPaths = occuranceInfo.usesInOtherPaths;
  }

  get isUsedInPaths() {
    return this.usesInCurrentPaths.length !== 0;
  }

  get prettyComponentName() {
    return `<${this.componentInfo.name.split('/').map(pascalCase).join('::')} />`;
  }
}
