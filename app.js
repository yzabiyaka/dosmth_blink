const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  // Todo: use better logging library
  console.log('Example app listening on port 3000!'); // eslint-disable-line no-console
});
