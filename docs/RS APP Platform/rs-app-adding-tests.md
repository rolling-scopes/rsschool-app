## Adding tests into RS APP (for trainers and admins only)

1. To add tests enter "Manage Tasks" page:
   ![Manage Tasks Page](https://docs.rs.school/images/rs-app-add-tests-1.png)

2. Then click "Add Task" button:
   ![Add Task Button1](https://docs.rs.school/images/rs-app-add-tests-2.png)

3. Fill in the form and save it:

   - "Name" - task title;
   - "Task Type" - select "RSAPP Test";
   - "Discipline" - select course-related discipline;
   - "Tags" - set tags (optional) to highlight which aspect of the course it is related to. For example, "javascript", "html/css", etc.;
   - "Description URL" - link to the task description;
   - "JSON Attributes" - copy JSON file's content with test settings, questions and possible answers (<span style="color:green_apple">[see below](https://docs.rs.school/#/rs-app-add-tests?id=json-attributes)</span>).

   ![RS APP Test Form](https://docs.rs.school/images/rs-app-add-tests-3.png)

4. In the course menu select "Course Tasks":
   ![Course Tasks](https://docs.rs.school/images/rs-app-add-tests-4.png)

5. Click "Add Task" button too:
   ![Add Task Button2](https://docs.rs.school/images/rs-app-add-tests-5.png)

6. Fill in the form again and save it:

   - "Task" - select the task you have just created;
   - "Task Type" - select "RSAPP Test";
   - "Checker" - select "Auto-Test";
   - "Task Owner" - select a person, who is responsible for this task;
   - "Start Date - End Date" - set a date of issuing the task and the deadline;
   - "Score" - set a maximum score a student can get for this task;
   - "Score Weight" - task weight (1 by default). It is needed for the manager of the course to correct it later, so do not change it.
     ![Adding Task Details](https://docs.rs.school/images/rs-app-add-tests-6.png)

7. The task is added! Go back to the course menu and select "Auto-Test" in order to check if the task has been added or not.
   ![Auto-Test Menu](https://docs.rs.school/images/rs-app-add-tests-7.png)
8. Select the test you have created in the drop-down list and check if anything wrong:
   ![Auto-Test Test Course](https://docs.rs.school/images/rs-app-add-tests-8.png)

### JSON Attributes

#### Parameters:

- "strictAttemptsMode" - strict mode by default, set "false" to switch off the strict mode.
- "maxAttemptsNumber" - in the strict mode, after a certain amount of submissions, a student gets 0; otherwise, a student can submit it as many times as possible, but the score will be divided by 2.
- "numberOfQuestions" - number of questions (it must be equal to the length of arrays of "answers" and "public"."questions").
- "tresholdPercentage" - the percentage a student needs to reach for the task to be accepted (otherwise he gets 0 and loses 1 trial).
- "public"."questions" - questions and answers. To add a multi-choice question, set "true" for "multiple".
- "answers" - an array of numbers of correct answers (the order of numbers must be equal to the order in "public"."questions"!).

NB! student's resubmission implies he/she gets the last score obtained; it is possible to get 0, finally.

#### An Example:

    {
        "public": {
            "tresholdPercentage": 70,
            "numberOfQuestions": 10,
            "maxAttemptsNumber": 2,
            "strictAttemptsMode": false,
            "questions": [
                {
                    "question": "Do you like html?",
                    "answers": ["Yes", "No", "Maybe"],
                    "multiple": false
                },
                {
                    "question": "What is css?",
                    "answers": ["Cascade style sheets", "cosmic super solutions", "cool super stuff"],
                    "multiple": true
                },
                {
                    "question": "What is not a css selector?",
                    "answers": ["<div>", "div", "a.a", "p<div>"],
                    "multiple": true
                }
            ]
        },
        "answers": [
            [0],
            [0, 2],
            [0, 3]
        ]
    }

#### [PRs for test functionality with added descriptions and examples](https://docs.rs.school/#/rs-app-add-tests?id=pr-%d1%8b-%d1%81-%d0%be%d0%bf%d0%b8%d1%81%d0%b0%d0%bd%d0%b8%d0%b5%d0%bc-%d0%b4%d0%be%d0%b1%d0%b0%d0%b2%d0%bb%d0%b5%d0%bd%d0%bd%d0%be%d0%b9-%d1%84%d1%83%d0%bd%d0%ba%d1%86%d0%b8%d0%be%d0%bd%d0%b0%d0%bb%d1%8c%d0%bd%d0%be%d1%81%d1%82%d0%b8-%d0%b4%d0%bb%d1%8f-%d1%82%d0%b5%d1%81%d1%82%d0%be%d0%b2-%d0%b8-%d0%bf%d1%80%d0%b8%d0%bc%d0%b5%d1%80%d0%b0%d0%bc%d0%b8)

- <span style="color:green_apple">[Basic example (see above)](https://github.com/rolling-scopes/rsschool-app/pull/530)</span>
- <span style="color:green_apple">[If you need pictures for tests](https://docs.rs.school/#/rs-app-add-tests)</span>
