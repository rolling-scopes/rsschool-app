# Submission of tasks in the RS School App

Most of the tasks, after they are completed, have to be submitted to RS School App **before the deadline**:

- Auto-checkable tasks are to be submitted on the Auto-Test page. Tasks that are checked automatically: tests, algorithmic tasks, codewars tasks.
- In case of Cross-Check task checking, you need to submit a link to your work in the `Cross-check: Submit` page before the deadline. The link can be submitted several times - the last one is saved. After submitting a link to the completed work, it can be edited/completed until the deadline. If you do not submit your work, you will get 0.

## Tests

- Tests submitted in <span style="color:green_apple">[RS School App](https://app.rs.school/)</span> could be solved after authorization in the application.
- The minimum passing score is usually 90% of the maximum possible number of points.
- You can take the test as many times as specified, the last result is counted.
- If specified, you can try the test even more times, but the score for the test will be twice lower.
- The result of passing the test will be displayed immediately, it will be added to the score page next day after passing.

## Algorithmic tasks

- <span style="color:green_apple">[Example of the task](https://github.com/AlreadyBored/basic-js)</span>
- The scores of these tasks are summed up and contribute to the total score with a coefficient from 0.1 to 0.5 (a maximum of 50 points can be obtained for solving one task).
- Copying solutions ⇒ expulsion. Think thoroughly before submitting someone else's code for the sake of getting 10 points. We do not require the solution of all tasks.
- If you do not know how you had solved the task during the interview ⇒ copying detected ⇒ expulsion.
- If you know how you had solved the task during the interview, but you cannot solve a simpler task ⇒ copying detected ⇒ expulsion.

#### Will it be possible to resubmit algorithmic tasks?

You can submit, as many times as you want, but before the deadline.

#### How to find an error during solving algorithmic tasks?

- console.log() input parameters at the beginning of the solution
- you can run only one test to reduce the number of logs
  `mocha ./test/<TEST NAME>.test.js`
  or
  `npm run test ./test/task-name.test.js`
- You can comment out everything in the test except for the test that fails
- You can configure the debug in VSC and track what is wrong step by step <span style="color:green_apple">[https://code.visualstudio.com/docs/nodejs/nodejs-debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)</span>
- You can use this service to visually see the code <span style="color:green_apple">[http://pythontutor.com/javascript.html#mode=edit](http://pythontutor.com/javascript.html#mode=edit)</span>

## Codewars

Some tasks require solving several tasks on the website <span style="color:green_apple">[https://www.codewars.com/](https://www.codewars.com/)</span>

After you complete the task, log in to the RS School App <span style="color:green_apple">[https://app.rs.school/](https://app.rs.school/)</span>, select **Auto-Test**, select **Codewars {Task Name}** from the drop-down list, click **Submit**. The result of the check is displayed on the right.

You can submit a task as many times as you want, each subsequent submission overwrites the previous one.

Your username on the Codewars website should be the same as the GitHub nickname you had registered in the RS School App. If the specified username on Codewars is busy, add the ending -rss to your GitHub nickname. You can change the username to codewars by following the link <span style="color:green_apple">[https://www.codewars.com/users/edit](https://www.codewars.com/users/edit)</span>

![edit username](images/rs-app-tasks-1.jpg)

## Cross-check

Description in a separate <span style="color:green_apple">[file](https://docs.rs.school/#/cross-check-flow)</span>

### CodeJam

CodeJam is a task whose description is unknown in advance, and a limited time is given for execution (from 60 minutes to 48 hours).
For example, on Friday at 21:00, everyone receives a link with a task that takes 48 hours to complete.

## FAQ

### What should I do if I can't pass the test/task on time?

Skip and try to complete the rest of the tasks for the maximum score.

### Is it allowable to take the solution of the task from the Internet?

You may take the idea, but do not copy the solution.
