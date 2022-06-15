## Task Checking Process by Mentor

1. A student completes an assignment in a private repository.
2. The student creates and submits a Pull Request before the deadline.
   - The PR rules are specified [below](https://docs.app.rs.school/#/pull-request-review-process?id=Pull-Request-description-must-contain-the-following)
   - Penalties for deadline violations are listed [below](https://docs.app.rs.school/#/pull-request-review-process?id=Deadlines-for-Students)
3. Until the final grade is given by the mentor, the student can continue to implement remaining features
4. The mentor checks the PR, leaves his comments and recommendations on the quality of the code (copy-paste, magic numbers, project structure, etc.) and the implemented functionality. Leaves a comment with a preliminary score.
   - The score is set by the mentor based on the assessment criteria specified for each task
   - When giving a score, all implemented functionality must be taken into account. E.g. a student did not 100% fulfill the minimum (basic) requirements, but fulfilled some of the additional ones - all requirements must be taken into account
   - The mentor can set a preliminary score in advance, taking into account that the student will correct all the comments afterwards
5. The student addresses the comments within 5 days.
   - If the mentor's comment to the PR is pending the student's answer - the student writes the answer as a comment's reply
   - If the student has committed some changes, the student must leave a comment about what exactly has changed
6. Based on the results of the code review and corresponding changes, the mentor sets the final grade in Score (`RS APP > Submit-review`).
   - It is up to the mentor to decide whether to deduct points or not for the functionality implemented by the student after the deadline.
   - If the student has not addressed the mentor's comments, the mentor may further reduce the mark. The size of the penalty is at the discretion of the mentor, maximum -50 points.

## Pull Request Requirements (PR)

Pull Request is a place to discuss contributor's code. It should not be a monologue but rather a fruitful collaboration between a contributor and a reviewer. Stay professional, respect each other's time and efforts.

### Pull Request description must contain the following:

1. Task URL.
2. Screenshot showing the result of Task's completion. The screenshot is added to a Pull Request as an image attachment. To achieve that you can just dra-and-drop the screenshot to the Description text area.
3. Deployment URL of your application. For frontend - Website URL, for backend - API Endpoint URL. To create deployment you can use the following:
   - gh-pages (if you have access to a private RS School repo)
   - web hosting, like [netlify.com](https://app.netlify.com/drop) (if you don't have access to a private RS School repo or can't deploy to `gh-pages` because of permissions)
   - other static assets storage with web serving capabilities, like [S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
   - serverless or self-hosted solutions for your API (make sure URL is public and accessible by other people)
   - naming scheme: GitHub account name - Task name.
4. Submittion Date / Deadline Date.
5. Your self-check of Task's completion result and opinion on the achieved Score.

### Description Example

```
1. Task: https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md
2. Screenshot:
   ![](https://docs.app.rs.school/images/fancy-weather.png)
3. Deployment: https://chakapega-fancy-weather.netlify.com/
4. Done 28.05.2020 / deadline 31.05.2020
5. Score: 220 / 300
- Markup, design, UI (15/30)
  - [x] minimum page width at which it is displayed correctly – 320 рх (10)
  - [±] application's appearancecorresponds to the layout and/or its improved version (5/10)
  - [ ] aaplication works and looks correctly with any language (0)
- Section "Today's weather" displays the following data (15/20)
  - [x] use weather data and location (10)
  - [±] clock, refreshed each second (5/10)
 ...
```

### Pull Request must not contain the following:

- Commented code
- Leftover and/or irrelevant files, auto-generated code, node_modules, etc.

## Code Review Process Recommendations

For a more efficient process of code review of student PRs, it is recommended to conduct it in 2 stages:

- Review of the "Draft" version of the task. The student creates a PR when the "Draft" version is ready, which shows the main concept of the task and implements the main parts of the application. This version may not cover additional requirements.
- Review of the "Release" version of the task. This is a completed and refactored version of the task, which contains all the changes addressing the comments and suggestions mentioned during the review of the "Draft" version.

This approach solves several problems that are usually encountered when reviewing and implementing large tasks:

- Reducing the one-time review load on the mentor.
  - It is often quite difficult to carefully look into the entire code of the task in one go and clarify all the concepts that the student missed within the large code base.
  - It is often much easier to find time for 2 smaller reviews, although in general, the total time may be increased.
- Catching architectural mishaps at the very beginning, which lead to "expensive", in terms of refactoring, problems
- Learn how to work with Git and Github
- Motivation to meet the deadline

## Code Review Process Example

1. Code Review process can be started with a check of the PR format, the naming of the commits, and a sufficient number of them.

- [Commit Requirements](https://docs.app.rs.school/#/git-convention)
- [Pull Request Requirements](https://https://docs.app.rs.school/#/pull-request-review-process?id=Pull-Request-description-must-contain-the-following)

2. Next, clone the repository, install dependencies, and check if the project is buildable / runnable.

3. If the requirements included the use of a linter or tests, check for the presence of a prepared scripts to start, lint and/or test the app and whether errors occur after running them.

4. It is worth checking the overall functionality of the application, whether there are no errors in the console, whether requests are processed correctly, etc.

At this stage, you can pay attention to possible UI / UX problems:

- whether clickable elements are highlighted
- whether there is an overlap of elements / text
- possible recommendations for improving visual appearance of the app if there was no clearly defined design in the task

5. Now's the time to review the code itself. Here are some potential code quality improvement points:

### General

- DRY - if there are repeating pieces of code, it's better to put them in a separate class/function
- KISS - try to keep the structure simple and clear
- comments should explain the purpose of the code instead of describe it

```
Bad

# method to find min value
function findMinValue() {...}
```

- no code formatter used, which helps maintain the same code style across the team (e.g. prettier)
- it is better not to use abbreviations for naming variables / classes / functions, this will improve overall understanding and readability of the code

### HTML

- no alt attribute for the `img` tag, it is also recommended to set the height and width, which is useful when the image does not load for some reason
- lack or insufficient semantics
- redundant blocks

```html
<div class="container">
  <div class="wrapper">
    <ul>
      ...
    </ul>
  </div>
</div>
```

- use class names in kebab-case for HTML

```html
<!-- BAD -->
<div class="containerWrapper"></div>
```

```html
<!-- GOOD -->
<div class="container-wrapper"></div>
```

- if you need to make some kind of heading in the upper case in your HTML, it's better to do it with CSS
- using inline styles or JS code in HTML, i.e. in the form of an `onclick` function, is also a mistake

### CSS

- try to apply dynamic styles with CSS classes, not with the use of JS
- try to write styles with a small degree of nesting (no more than 2x) - this simplifies maintenance and eases refactoring of the style if necessary
- it is preferable to use the same units of measurement (`px`,`rem` or `em`) which makes it easier to introduce changes (when using preprocessors, you can write a function that will convert `px` to `rem`)

### JS

- use event delegation if applicable
- use parentheses for `if else / for` blocks
- magic numbers and magic strings - try to put them into separate constants
- use enums objects

```js
const KEY_CODES = {
	Space: 32,
	Enter: 13,
	...
}

if (key === KEY_CODES.Enter) {
  ...
}
```

- file size (large files are difficult to read and maintain, if the file is more than 200 - 400 lines, then you should think about splitting)
- monitor the degree of nesting of conditional blocks, blocks with a nesting level of 3 or more are difficult to read and perceive, perhaps they can be moved into a separate function
- try to use pure functions (they are better tested)
- use named arguments if the number of arguments is 3 or more, this allows you not to follow the order and when reading the code it is more clear what is passed to the function

```js
function insertElement({ parent, tag, class, value }){...}

insertElement({ parent: parentElement, tag: 'p', class: 'class', value: 'Some value' })
```

### Deadlines for Students

- Deadlines for all tasks are indicated in the course schedule.
- If student did not have time to turn in the assignment on time, mentor, at his own discretion, can apply the following penalties:
  - -10 score points if you are late up to 3 days, inclusive
  - -30% score percentage if you are late up to 7 days, inclusive
  - -70% score percentage if more than a week late
  - penalties can be omitted if there is a good reason (hospital, army training, etc.)
  - rounding occurs in favor of the student, when applying penalty coefficients

### Deadlines for Mentors

Mentor is expected to review student's work within one or two weeks of the student's submission. But the sooner the better. Deadline dates for students are indicated in the schedule.

## Recommended Links

- [How to write the perfect Pull Request](https://github.com/blog/1943-how-to-write-the-perfect-pull-request)
