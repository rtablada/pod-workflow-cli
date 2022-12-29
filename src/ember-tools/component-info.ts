import unusedComponentsUtils from 'ember-unused-components/lib/utils';
import analyser from 'ember-unused-components/lib/analyser';
import ComponentUsedInfo from '../models/component-used-info';
import { relativePathToProjectBase } from '../utils';

export type ComponentResults = Record<string, ComponentInfo>;

export interface ComponentInfo {
  key: string;
  name: string;
  type: 'component';
  parentKey: string;
  subComponentKeys: SubComponentKeys;
  isSubComponent: boolean;
  stats: Stats;
  occurrences: Occurrence[];
  filePaths: string[];
  fileType: string;
}

interface Occurrence {
  file: string;
  fileType: string;
  type: 'curly' | 'angle';
  lines: string[];
  key: string;
}

interface Stats {
  count: number;
  js: number;
  curly: number;
  angle: number;
  componentHelper: number;
}

type SubComponentKeys = Record<string, boolean>;

export function getComponentInfo(): ComponentResults {
  const config = unusedComponentsUtils.getConfig({ path: '/' });
  analyser.mapComponents(config);
  analyser.scanProject(config);

  return analyser.components;
}

export function findComponentsUsedInPaths(
  componentResults: ComponentResults,
  podFileFullPaths: string[]
): ComponentUsedInfo[] {
  const relativePaths = podFileFullPaths.map((filePath) => `./${relativePathToProjectBase(filePath)}`);

  return Object.keys(componentResults)
    .map((componentPath) => {
      const componentInfo = componentResults[componentPath];

      return new ComponentUsedInfo(componentInfo, relativePaths);
    })
    .filter((result) => result.isUsedInPaths);
}
