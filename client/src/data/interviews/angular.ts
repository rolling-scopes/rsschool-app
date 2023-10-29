import { InterviewTemplate } from './types';

export const angularTemplate: InterviewTemplate = {
  name: 'Angular interview ',
  examplesUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/angular/modules/interview/questions.md',
  categories: [
    {
      id: 3000,
      name: 'General',
      questions: [
        { id: 3001, name: 'What is Angular and what is it used for?' },
        { id: 3002, name: 'What is Angular CLI and what are its main features?' },
        { id: 3003, name: 'What is a module in Angular, and what is its role in an application?' },
        {
          id: 3004,
          name: 'What is inter-component communication in Angular?(e.g., @Input/@Output, services with Observables, etc.).',
        },
        {
          id: 3005,
          name: 'Shadow DOM in Angular',
        },
      ],
    },
    {
      id: 3010,
      name: 'Components',
      questions: [
        {
          id: 3011,
          name: 'What are Components in Angular, and how are they the foundation of an application structure?',
        },
        {
          id: 3012,
          name: "How do you configure a component's selector, template, and style using the @Component decorator?",
        },
        {
          id: 3013,
          name: 'How would you explain the component lifecycle and its main methods (e.g., ngOnInit, ngOnChanges, ngOnDestroy)?',
        },
        {
          id: 3014,
          name: 'How does two-way data binding work in Angular, and how does it differ from one-way data binding?',
        },
        { id: 3015, name: 'Standalone components.' },
        { id: 3016, name: 'What are ViewChild and ViewChildren?' },
        { id: 3017, name: 'What is the difference between ElementRef and Renderer2?' },
        { id: 3018, name: 'How do HostBinding and HostListener decorators work?' },
      ],
    },
    {
      id: 3020,
      name: 'Directives',
      questions: [
        { id: 3021, name: 'What are "Directives" in Angular, and what are they used for?' },
        {
          id: 3022,
          name: 'How do you create and use a custom directive? Explain the use of the "@Directive" decorator',
        },
        {
          id: 3023,
          name: 'What is the difference between structural and attribute directives? Please provide examples.',
        },
        { id: 3024, name: 'Explain *ngIf and *ngFor and their usage.' },
        { id: 3025, name: 'What is the difference between *ngIf and [hidden]?' },
        {
          id: 3026,
          name: 'What is the purpose of *ngSwitch, *ngSwitchCase, and *ngSwitchDefault, and how do you use them?',
        },
        { id: 3027, name: 'What is the difference between *ngStyle and *ngClass?' },
        { id: 3028, name: 'What is *ngContainer and what is it used for? Provide an example.' },
        { id: 3029, name: 'How do you create custom structural directives using <ng-template>?' },
      ],
    },
    {
      id: 3030,
      name: 'Pipe',
      questions: [
        { id: 3031, name: 'What is a Pipe, and what is its purpose in Angular?' },
        { id: 3032, name: 'Can you provide examples of some built-in pipes (e.g., date, uppercase, lowercase)?' },
        { id: 3033, name: 'What is the difference between Pure and Impure pipes. How do they affect performance?' },
        { id: 3034, name: 'How do you use multiple pipes simultaneously?' },
        { id: 3034, name: 'How do you pass parameters to a Pipe to change behavior or format data?' },
        {
          id: 3034,
          name: 'What are the advantages of using Async pipes. How do you apply them with Observable or Promise?',
        },
        { id: 3034, name: 'How does the process of registering a custom pipe in a module occur?' },
      ],
    },
    {
      id: 3040,
      name: 'Routing',
      questions: [
        { id: 3041, name: 'What is Routing in Angular, and what is it used for?' },
        { id: 3042, name: 'How do you configure a basic routing system using RouterModule and <router-outlet>?' },
        { id: 3043, name: 'How do you use route parameters and queryParams to pass and retrieve data in routes?' },
        { id: 3044, name: 'Can you provide an example of using child routes?' },
        { id: 3045, name: 'What are the preloading strategies, and how do you use them?' },
        { id: 3046, name: 'How do you use Route Guards (e.g., CanActivate and CanDeactivate) to protect routes?' },
        {
          id: 3047,
          name: 'What is ActivatedRoute, and how do you apply it to get information about the current route?',
        },
      ],
    },
    {
      id: 3050,
      name: 'RxJS',
      questions: [
        { id: 3051, name: 'Define the concept of RxJS and its usage in Angular' },
        { id: 3052, name: 'What are Observable, Observer, and Subscriptions?' },
        { id: 3053, name: 'What is the difference between Observable and Promise?' },
        {
          id: 3054,
          name: 'Can you provide examples of basic RxJS operators in Angular (e.g., map, filter, catchError, switchMap)?',
        },
        { id: 3055, name: 'What are Subject and BehaviorSubject, and how are they used in Angular?' },
        { id: 3056, name: 'How would you explain the concepts of Hot and Cold Observables?' },
        { id: 3057, name: 'How do you properly unsubscribe from an Observable?' },
      ],
    },
    {
      id: 3060,
      name: 'Dependency Injection',
      questions: [
        { id: 3061, name: 'What is Dependency Injection, and what are its objectives in Angular?' },
        { id: 3062, name: 'How do you create a service and use it in components for dependency injection?' },
        {
          id: 3063,
          name: 'What is the difference between "providedIn: root", "providedIn: any", and registering a provider in the "providers" section of NgModule?',
        },
        { id: 3064, name: 'What are useClass, useValue, and useFactory? How are they used when creating providers?' },
        { id: 3065, name: 'Explain the concept of Injector and provider hierarchy.' },
        { id: 3066, name: 'What is a DI token, and how do you use it for dependency injection?' },
        {
          id: 3067,
          name: 'How do you use @Optional, @Self, and @SkipSelf decorators to control dependency injection and their handling?',
        },
        {
          id: 3068,
          name: 'How do you inject dependencies based on conditions or by different provided implementations?',
        },
      ],
    },
    {
      id: 3070,
      name: 'Forms',
      questions: [
        { id: 3071, name: 'What is the difference between Template-driven Forms and Reactive Forms?' },
        { id: 3072, name: 'What are FormControl, FormGroup, and FormArray in the context of Reactive Forms?' },
        {
          id: 3073,
          name: 'What are the differences in working with validation for Template-driven Forms and Reactive Forms?',
        },
        { id: 3074, name: 'How do you implement custom validators for forms?' },
        { id: 3075, name: 'How can you retrieve and process data from forms after submission?' },
        { id: 3076, name: 'What is two-way data binding in the context of Template-driven Forms?' },
        { id: 3077, name: 'How do you track the change state of forms or form controls (e.g., touched, dirty)?' },
      ],
    },
    {
      id: 3080,
      name: 'Lazy Loading',
      questions: [
        { id: 3081, name: 'What is Lazy loading, and what is its purpose in Angular applications?' },
        { id: 3082, name: 'How do you configure lazy loading for a specific module?' },
        { id: 3083, name: 'What changes to the routing system are necessary to support lazy loading?' },
        { id: 3084, name: 'What are the advantages of using lazy loading in your application?' },
      ],
    },
    {
      id: 3090,
      name: 'Modules',
      questions: [
        { id: 3091, name: 'What is a Module in Angular, and what role does it play in an application?' },
        { id: 3092, name: 'Can you explain the structure of a module and its metadata?' },
        {
          id: 3093,
          name: 'How can you separate functionality into different modules and connect them to the main application module?',
        },
      ],
    },
    {
      id: 3100,
      name: 'HTTP',
      questions: [
        { id: 3101, name: 'What is HttpClientModule, and why is it important in Angular applications?' },
        { id: 3102, name: "How can you make HTTP requests using Angular's HttpClient?" },
        {
          id: 3103,
          name: 'Can you explain the difference between Observables and Promises in handling HTTP responses?',
        },
        { id: 3104, name: 'How can you handle errors during HTTP requests in Angular?' },
        {
          id: 3105,
          name: 'What are some techniques to optimize HTTP requests and handle caching considerations for Angular applications?',
        },
        { id: 3106, name: 'What is the purpose of HttpInterceptor in Angular, and how does it work?' },
      ],
    },
    {
      id: 3110,
      name: 'Tests (Testing)',
      questions: [
        {
          id: 3111,
          name: 'What types of Testing does Angular support (e.g., unit tests, integration tests, e2e tests)?',
        },
        {
          id: 3112,
          name: 'What are the main tools and libraries used by Angular for testing (Jasmine, Karma, and Protractor)?',
        },
        { id: 3113, name: 'What is TestBed, and how is it used to set up a testing environment?' },
        { id: 3114, name: 'How do you test Angular components using ComponentFixture and DebugElement?' },
        { id: 3115, name: 'How do you test directives and pipes in Angular?' },
        { id: 3116, name: 'How do you mock and stub dependencies in tests for services?' },
        {
          id: 3117,
          name: 'What are async, fakeAsync, and tick, and how are they used when testing asynchronous code?',
        },
      ],
    },
    {
      id: 3120,
      name: 'Coding task',
      questions: [{ id: 3121, name: 'Small Angular app: component, service, pipe, directives...' }],
    },
  ],
};
