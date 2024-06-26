const express = require('express');
const app = express();
const port = 5000;


app.get('/', (req, res) => {
  res.status(200).send(`Hello, from Node App on PORT: ${port}!`);
});


app.listen(port, () => {
  console.log(`App running on port :${port}`);
});

