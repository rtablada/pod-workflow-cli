export interface LintRemainingLog {
  path: string;
  lintErrors: string[];
}

export interface ComponentUpgradeLog {
  componentName: string;
}

export interface UpgradeLog {
  upgradeType: 'upgrade-pod' | 'upgrade-path' | 'upgrade-component';
  completedAt?: Date;
  id: string;
  path: string;
  baseGitSha: string;

  componentsUpdated: ComponentUpgradeLog[];

  remainingLintErrors: LintRemainingLog[];
}
