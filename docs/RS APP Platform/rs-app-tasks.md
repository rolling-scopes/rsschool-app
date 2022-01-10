# Submission of tasks in the RS School App

Most of the tasks after they are completed have to be submitted to RS School App **before the deadline**:

- Auto-checkable tasks are to be submitted on the AutoTest page. Tasks that are checked automatically: tests, algorithmic tasks, codewars tasks.
- In the case of Cross-Check task checking, you need to submit a link to your work on the Cross-check: Submit page before the deadline. The link can be submitted several times - the last one is saved. After submitting a link to the completed work, it can be completed until the deadline. If you not submit your work, you will get 0.

## Tests

- Tests submitted in [ RS School App](https://app.rs.school /) could be solved after authorization in the application.
- The minimum passing score is usually 90% of the maximum possible number of points.
- You can take the test as many times as specified, the last result is counted.
- If specified, you can take the test more times, but the score for the test will be reduced by 2 times.
- The result of passing the test will be displayed immediately, it will be added to the score page the next day after passing.

## Algorithmic tasks

- [Example of a task](https://github.com/AlreadyBored/basic-js)
- The scores for these tasks are summed up in the total score with a coefficient from 0.1 to 0.5 (a maximum of 50 points can be obtained for solving one task).
- Copying solutions ⇒ expelling. Think thoroughly before submitting someone else's code for the sake of getting 10 points. We do not require the solution of all tasks.
- If during the interview you do not know how you had solved the task ⇒ coping detected ⇒ expelling.
- If during the interview you know how you solved the task, but you cannot solve a simpler task ⇒ coping detected ⇒ expelling.

#### Will it be possible to resubmit algorithmic tasks?

You can submit, as many times as you want, but before the deadline.

#### How to find an error during solving algorithmic tasks?

- console.log() input parameters at the beginning of the solution
- you can run only one test to reduce the number of logs
  mocha ./test/<TEST NAME>.test.js
  or
  npm run test ./test/task-name.test.js
- You can comment out everything in the test except for the test that falls
- You can configure the debug in VSC and track step by step what is wrong https://code.visualstudio.com/docs/nodejs/nodejs-debugging
- You can use this service to visually view the code http://pythontutor.com/javascript.html#mode=edit

## Codewars

Some tasks require solving several tasks on the site https://www.codewars.com/

After you fullfilling the task, log in to the RS School App https://app.rs.school/, select **Auto-Test**, select **Codewars {Task Name}** from the drop-down list, click **Submit**. The result of the check is displayed on the right.

You can submit a task as many times as you want, each subsequent submission overwrites the previous one.

Your username on the Codewars website should be the same as the GitHub nickname you had registered in the RS School App. If the specified username on Codewars is busy, add the ending -rss to your GitHub nickname. You can change the username to codewars by following the link https://www.codewars.com/users/edit

![edit username](images/rs-app-tasks-1.jpg)

## Cross-check

Description in a separate [file](cross-check-flow.md)

### CodeJam

CodeJam is a task which description is unknown in advance, and a limited time is allowed for execution (from 60 minutes to 48 hours)..
For example, on Friday at 21:00, everyone receives a link with a task that takes 48 hours to complete.

## FAQ

### What should I do if I can't pass the Test on time or pass the task?

Skip and try to complete the rest of the tasks for the maximum score.

### Is it allowable to take the tasks solution from the Internet?

You may take the idea, but not to make an exact copy of the solution
