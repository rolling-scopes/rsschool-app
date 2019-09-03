**Pre Requirements**:

- [NodeJS](https://nodejs.org/en/) version 8 and higher
- [**Docker**](https://docs.docker.com/v17.12/install/) and [**Docker Compose**](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads) 2.10+
- [Yarn](https://yarnpkg.com/en/docs/install) 1.0+

Currently all rsschool related sources are placed at one repository.
So firstly let's copy that to our local machine:

```
git clone https://github.com/rolling-scopes/rsschool-app.git
```

After that we need to run database and pass connection related params to a server part.

## Database

```
git clone git@github.com:rolling-scopes/rsschool-scripts.git
cd rsschool-scripts/development
docker-compose up
```

## API
Go to **server** folder and execute the following commands:

```
touch .env
## database related configuration
echo RSSHCOOL_API_PG_HOST='localhost' >> .env
echo RSSHCOOL_API_PG_USERNAME='rs_master' >> .env
echo RSSHCOOL_API_PG_PASSWORD='12345678' >> .env
echo RSSHCOOL_API_ADMIN_USERNAME='admin' >> .env
echo RSSHCOOL_API_ADMIN_PASSWORD='supersecret' >> .env
```

After that go to the project's root and run:

```
yarn install
npm run start
```

Don't forget to read appropriate contributing guides:  

- [Client](https://github.com/rolling-scopes/rsschool-app/blob/master/client/CONTRIBUTING.md)  
- [Server](https://github.com/rolling-scopes/rsschool-app/blob/master/server/CONTRIBUTING.md)
