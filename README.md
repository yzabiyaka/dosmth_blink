# Blink [![wercker status](https://app.wercker.com/status/8b53bf996a3fb29015bf656b95aa1866/s/master "wercker status")](https://app.wercker.com/project/byKey/8b53bf996a3fb29015bf656b95aa1866) [![codecov](https://codecov.io/gh/DoSomething/blink/branch/master/graph/badge.svg)](https://codecov.io/gh/DoSomething/blink)

:postbox: The DoSomething.org Message Bus.

## Development
### Requirements
- [Node.js](https://nodejs.org/en/download/) v7.6+ for async/await support
- [Yarn](https://yarnpkg.com/en/) is optional, but recommended

### Installation
1. Install dependencies `yarn install` or `npm install`
2. Run `npm start` to start Express.js app

## Usage
- `npm start`
- Open `https://localhost:5050`

## API Endpoints
### Core
| Endpoint                    | Description                 |
| --------------------------- | --------------------------- |
| `GET /`                     | Greetings                   |
| `GET /api`                  | List available API versions |
| `GET /api/v1`               | List V1 endpoints           |


## Tests

To execute code style checks and BDD tests, run:

```
$ npm test
```

We follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript),
with minor [DoSomething](https://github.com/DoSomething/eslint-config) adjustments.

BDD test coverage uses the following utilities:
- [AVA](https://github.com/avajs/ava)
- [Chai](http://chaijs.com/), BDD/should flavor
- [Supertest](https://github.com/visionmedia/supertest)
