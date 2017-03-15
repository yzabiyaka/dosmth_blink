# Blink [![wercker status](https://app.wercker.com/status/8b53bf996a3fb29015bf656b95aa1866/s/master "wercker status")](https://app.wercker.com/project/byKey/8b53bf996a3fb29015bf656b95aa1866) [![codecov](https://codecov.io/gh/DoSomething/blink/branch/master/graph/badge.svg)](https://codecov.io/gh/DoSomething/blink)

:postbox: The DoSomething.org Message Bus.

## Development
#### Requirements
- [Node.js](https://nodejs.org/en/download/) v7.6+ for async/await support
- [Docker](https://www.docker.com/products/overview) with support
  of Compose file [v3](https://docs.docker.com/compose/compose-file/#/versioning)
- [Yarn](https://yarnpkg.com/en/) is optional, but recommended

#### Installation
Install dependencies `yarn install` or `npm install`

## Usage
- Launch RabbitMQ `docker-compose up`
- `npm start`
- Open `http://localhost:5050`

#### Available services
- `localhost:5672`: RabbitMQ AMQP
- [`localhost:15672`](http://localhost:15672): RabbitMQ management.
  Username: `blink`, password: `blink`.

## API Endpoints
### Core
| Endpoint                    | Description                 |
| --------------------------- | --------------------------- |
| `GET /`                     | Greetings                   |
| `GET /api`                  | List available API versions |
| `GET /api/v1`               | List V1 endpoints           |

## Tests

You can run all tests and checks at once:

```
$ npm run all-tests
```

Or execute them individually:

#### Code style

```
$ npm run lint
```

We follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript),
with minor [DoSomething](https://github.com/DoSomething/eslint-config) adjustments.

#### BDD Tests

```
$ npm test
```

BDD test uses the following utilities:
- [AVA](https://github.com/avajs/ava)
- [Chai](http://chaijs.com/), BDD/should flavor
- [Supertest](https://github.com/visionmedia/supertest)

#### Code coverage

```
$ npm coverage
```

- [NYC](https://github.com/istanbul/nyc)
- [Codecov](https://codecov.io/)
