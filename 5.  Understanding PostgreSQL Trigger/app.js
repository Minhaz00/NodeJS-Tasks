const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');

const app = express();

app.use(bodyParser.json());
app.use('/students', require('./routes/students'));
app.use('/grades', require('./routes/grades'));

db.sequelize.sync().then(() => {
  console.log('Database synchronized');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
