# Pod Workflow CLI

This tool allows you to work through Ember 3.x deprecations on your way to 4.x.

This assumes a few key assumptions and is highly opinionated (though PRs are welcome to make it more flexible for the greater Ember community):

1. Your app is organized using pods located in `app/pods`
2. You're using [lint-to-the-future](https://github.com/mansona/lint-to-the-future) or heavy uses of Eslint Ignore to identify and address Deprecations
3. You're wanting to update to Native Classes (this isn't completely necessary for 4.x but makes addressing some of the deprecations a bit easier)

## Installation

Install this package from npm using

```sh
yarn global add ember-pod-workflow-cli@latest
```

Then make sure you have installed/cached the various codemods (this prevents errors and speeds up execution of the workflow):

```sh
yarn global add ember-angle-brackets-codemod@latest ember-no-implicit-this-codemod@latest ember-native-class-codemod@latest
npx github:ember-codemods/es5-getter-ember-codemod # This will ask to install from github: select y (the command will likely error after that)
```

## Use

To use this CLI run:

```sh
pod-workflow upgrade-pod
```

This will interactively guide you through removing deprecations from a selected pod folder structure.

After completing work on deprecations in a pod you can create a quick PR template.

First set `POD_DASHBOARD` to the public URL of a pod workflow dashboard. Then run:

```sh
pod-workflow pr-description
```

This will copy a markdown flavored PR description with info about what has changed and what lint/deprecations are still left.

## Command Goals

1. [X] Prompt for pod to work on
2. [X] Show files to work on
3. [X] Run Codemods
    * [X] Run Angle Bracket Codemod
    * [X] Run No Implicit This Codemod
    * [X] ES5 Getter Codemod
    * [X] Run Native Class Codemod
4. [X] Prompt User to Commit Changes (check for changes)
5. [X] Remove lint ignore for files in selected pod
6. [X] Run Lint Fix
7. [X] Prompt For Commit
8. [X] Show Remaining Lint Errors
9. [ ] Show Components Used
10. [X] Prompt user to select which components they want to fix
    * Figure out by getting component info
    * List places where it is used outside of selected pod
11. [X] Repeat 3-7 on selected component paths