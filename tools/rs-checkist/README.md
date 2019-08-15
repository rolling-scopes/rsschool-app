# rs-checkist
[![rs-checkist](./icons/agent.png)&nbsp; ![Rolling Scopes School](./icons/rs_school_js.png)](https://rs.school/js/index.html)

This is command line tool with set of parsers for Rolling Scopes School

## Developing

Run script that you can see below in order to run build server in watch mode:

```
npm run dev
```

Create `.env` file that should contains any credentials that could be used:

```
STAGE="dev" | or "prod"
CODEWARS_TOKEN="TOKEN_FOR_THE_CODEWARS_API"
RSSCHOOL_API_TOKEN="TOKEN_FOR_THE_RSSCHOOL_API"
```

For updating scores from Google Spread Sheets `gss-creds.json` file should also be created. It must contain the next info:
```json
{
  "type": "service_account",
  "project_id": "PROJECT_ID",
  "private_key_id": "PRIVATE_KEY_ID",
  "private_key": "PRIVATE_KEY",
  "client_email": "CLIENT_EMAIL",
  "client_id": "CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "CLIENT_CERT_URL"
}
```

For adding new service you should make several things:
1. Add parameters for this service into `/src/constants/services.ts`. You can watch over the `/src/interfaces/Service.ts` to see required and optional parameters. Add needed parameters for new service in that interface.
2. If an access could be gotten through a token, put it into `/src/constants/tokens.ts`.
3. Add parsing method into `/src/methods` that should contain the next required properties:
    ```typescript
    token: string,
    queryParameters: QueryParameters,
    linkPrefix: string,
    targetParameter: string,
    callback: Function,
    targetName: string,
    addtitonal: [],
    ```
4. Add the rule for processing the data have gotten to `/src/rules`.
5. Add the rule for calculate a score to `/src/scores`.

## Services

1. Codewars
2. Codecademy
3. Google Spread Sheets (RS School Tests)
4. Htmlacademy?

## Build

Run script that you can see below in order to build script:

```
$ npm run dev
```

Output bundle file: `{PATH_TO_REPO}/rs-chekist/dist/rs-chekist.js`.

## Usage

In order to update scores use the next syntax:

```
$ npm start u <service>
```

or

```
$ node {PATH_TO_FILE}rs-checkist.js u <service>
```

For example:

```
$ npm start u codewars
```

If you would like to get an error log (with wrong students service accounts names), you can specify additional parameter with path where log file could be appear:

```
$ npm start u codewars ./
```

**Credits:**

*Picture of agent is made by [Setyo Ari Wibowo](https://thenounproject.com/term/secret-agent/1085385/), ID*
