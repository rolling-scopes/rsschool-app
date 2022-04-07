[![Deploy](https://github.com/rolling-scopes/rsschool-app/actions/workflows/deploy.yaml/badge.svg?branch=master)](https://github.com/rolling-scopes/rsschool-app/actions/workflows/deploy.yaml)

<img src="https://www.rs.school/images/rs_school.svg" width="250px"/>

# RS School App

The [app.rs.school](https://app.rs.school) is a tool for the [RS School](https://rs.school) education process. It helps thousands students to become Front-end/Back-end/Mobile/Data Science engineers.

<img src="https://user-images.githubusercontent.com/618807/138608245-f00471ce-f982-4901-a32e-7246720ed13b.png" width="600px"/>

## Technology Overview

### Stack

- Language: [Typescript](https://www.typescriptlang.org/)
- Front-end: [Next.js](https://nextjs.org/) / [React](https://reactjs.org/)
- Back-end: [NestJS](https://nestjs.com/) and [Koa.js](https://koajs.com/) (deprecated backend) / [Node.js](https://nodejs.org/en/)
- End-to-end: [Playwright](https://playwright.dev/)
- Database: [PostgreSQL](https://www.postgresql.org/)
- Deployment: [Docker](https://www.docker.com/)

### Infrastructure

- Cloud: [AWS EC2](https://aws.amazon.com/ec2/), [AWS RDS](https://aws.amazon.com/rds/postgresql/), [AWS S3](https://aws.amazon.com/s3/), [AWS CloudWatch](https://aws.amazon.com/cloudwatch/)
- CI/CD: [Github Actions](https://github.com/rolling-scopes/rsschool-app/tree/master/.github/workflows)

## Getting Started

### Prerequisites

Please install the following software before starting development:

- [Git 2.10+](https://git-scm.com/downloads)
- [Node.js LTS](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Steps

- Clone [repository](https://github.com/rolling-scopes/rsschool-app)
- Run `npm install` (installs dependencies in the root folder and `client` / `server` folders.)
- Run `npm run db:up` (starts local database)
- Run `npm run db:restore` (restore a test DB snapshot)
- Make a copy of `server/.env.example` and `nestjs/.env.example` and rename it to `server/.env` and `nestjs/.env` respectively.
- Run `npm start` (starts application by running Next.js and REST API server)
- Open `https://localhost:3000` in a browser
- See more in [CONTRIBUTING](https://github.com/rolling-scopes/rsschool-app/blob/master/CONTRIBUTING.md) guide

### Running docs locally

- Install docsify globally: `npm i -g docsify`
- Run `docsify serve -p 4000 docs`

## Contributing

See [CONTRIBUTING](https://github.com/rolling-scopes/rsschool-app/blob/master/CONTRIBUTING.md) guide

## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/rolling-scopes/rsschool-app/graphs/contributors"><img src="https://opencollective.com/rsschool/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/rsschool/contribute)]

#### Individuals

<a href="https://opencollective.com/rsschool"><img src="https://opencollective.com/rsschool/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/rsschool/contribute)]

<a href="https://opencollective.com/rsschool/organization/0/website"><img src="https://opencollective.com/rsschool/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/rsschool/organization/1/website"><img src="https://opencollective.com/rsschool/organization/1/avatar.svg"></a>

## License

[Mozilla Public License 2.0](https://github.com/rolling-scopes/rsschool-app/blob/master/LICENSE)
