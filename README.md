# Pod Workflow CLI

This tool allows you to work through Ember 3.x deprecations on your way to 4.x.

This assumes a few key assumptions and is highly opinionated (though PRs are welcome to make it more flexible for the greater Ember community):

1. Your app is organized using pods located in `app/pods`
2. You're using [lint-to-the-future](https://github.com/mansona/lint-to-the-future) or heavy uses of Eslint Ignore to identify and address Deprecations
3. You're wanting to update to Native Classes (this isn't completely necessary for 4.x but makes addressing some of the deprecations a bit easier)

## Command Goals

1. [X] Prompt for pod to work on
2. [X] Show files to work on
3. [] Run Codemods
    * [X] Run Angle Bracket Codemod
    * [X] Run No Implicit This Codemod
    * [X] ES5 Getter Codemod
    * [X] Run Native Class Codemod
4. [] Prompt User to Commit Changes (check for changes)
5. [] Remove lint ignore for files in selected pod
6. [] Run Lint Fix
7. [] Prompt For Commit
8. [] Show Remaining Lint Errors
9. [] Show Components Used
10. [] Prompt user to select which components they want to fix
    * Figure out by getting component info
    * List places where it is used outside of selected pod
11. [] Repeat 3-7 on selected component paths