# Dockerizing NodeJS-MySQL RestAPI Application

This documentation provides a comprehensive guide to setting up a Node.js REST API application using Express.js, Sequelize ORM, and MySQL database. 
We will go through the process of dockerizing a Node.js-MySQL REST API application. We cover creating a `Dockerfile` and `docker-compose.yml`, setting up and running the Node.js app and MySQL database in Docker containers. This guide helps you achieve efficient and scalable application deployment.

## Prerequisites
- Docker and Docker Compose installed on your machine.
- Basic understanding of Node.js, Express.js, and MySQL.
- Basic understanding of Docker and Docker Compose.

Let't setup the application step by step:

## Step 1: Set Up the Project

**Initialize a new Node.js project:**

```bash
mkdir my-rest-api
cd my-rest-api
npm init -y
```


`mkdir my-rest-api`: Creates a new directory named `my-rest-api`.

`cd my-rest-api`: Navigates into the `my-rest-api` directory.

`npm init -y`: Initializes a new Node.js project with default settings, creating a `package.json` file.

**Install the required packages:**

```bash
npm install express sequelize mysql2 body-parser nodemon
```


`express`: A minimal and flexible Node.js web application framework.

`sequelize`: A promise-based Node.js ORM for MySQL, Postgres, SQLite, and Microsoft SQL Server.

`mysql2`: A MySQL client for Node.js with a focus on performance.

`body-parser`: Middleware to parse incoming request bodies in a middleware before your handlers.

## Step 2: Create the File Structure 

**Create a folder structure as follows:**

```
├── Dockerfile
├── docker-compose.yml
├── .env
├── package.json
├── package-lock.json
├── index.js
├── models
│   └── index.js
│   └── user.js
└── routes
    └── user.js
```

## Step 3: Define Models

**Create the `index.js` file to initialize Sequelize:**

**`models/index.js`**
```javascript
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

This file initializes Sequelize, reads all model files, and loads them into the `db` object. It also handles the connection to the database based on the configuration in `config.json`.

**Define the User model:**

**`models/user.js`**
```javascript
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    }
  });

  return User;
};
```

This file defines a User model with two fields: `username` and `email`, both of which are strings and cannot be null.

## Step 4: Set Up Routes

**Create a route for users:**

  **`routes/user.js`**
  ```javascript
  const express = require('express');
  const router = express.Router();
  const db = require('../models');

  // Create a new user
  router.post('/', async (req, res) => {
    try {
      const user = await db.User.create(req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all users
  router.get('/', async (req, res) => {
    try {
      const users = await db.User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user by id
  router.get('/:id', async (req, res) => {
    try {
      const user = await db.User.findByPk(req.params.id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user by id
  router.put('/:id', async (req, res) => {
    try {
      const user = await db.User.findByPk(req.params.id);
      if (user) {
        await user.update(req.body);
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete user by id
  router.delete('/:id', async (req, res) => {
    try {
      const user = await db.User.findByPk(req.params.id);
      if (user) {
        await user.destroy();
        res.json({ message: 'User deleted' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;
  ```

- **POST `/users`**: Creates a new user using data from the request body.
- **GET `/users`**: Retrieves all users from the database.
- **GET `/users/:id`**: Retrieves a single user by their ID.
- **PUT `/users/:id`**: Updates a user's data based on their ID using data from the request body.
- **DELETE `/users/:id`**: Deletes a user by their ID.

## Step 5: Create the Main Application File

**Set up the Express app:**

**`app.js`**
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use('/users', userRoutes);

// Sync database and start server
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
```

- `express()`: Initializes an Express application.
- `bodyParser.json()`: Middleware to parse JSON request bodies.
- `app.use('/users', userRoutes)`: Mounts the user routes at the `/users` path.
- `db.sequelize.sync()`: Syncs all defined models to the database.
- `app.listen(PORT)`: Starts the server on the specified port.

## Step 6: Create the Dockerfile

Create `Dockerfile` with the following contents:

```Dockerfile
# Use the official Node.js image as a base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 5000
```

## Step 7: Create a compose file for MySQL and the App

The docker-compose.yml file is used to define and run multi-container Docker applications. This file describes the services, networks, and volumes needed to run the application.

Create `docker-compose.yml` to run `MySQL` container and the NodeJS `App` container on the specified port:

```yaml
version: '3.8'

services:
  db:
    image: mysql:latest
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: my_db
      MYSQL_USER: myuser
      MYSQL_PASSWORD: mypassword
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      DB_USERNAME: myuser
      DB_PASSWORD: mypassword
      DB_NAME: my_db
      DB_HOST: db
      PORT: 5000
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules
    command: npm start

volumes:
  db_data:
```

- The `docker-compose.yml` file defines two services: a MySQL database (`db`) and a Node.js application (`app`).
- The `db` service uses the official MySQL image and sets up the database with specified environment variables.
- The `app` service builds a Docker image from the current directory, maps necessary ports, sets environment variables, and ensures it starts after the db service.
- Volumes are used to persist database data and manage the application code and dependencies.

This setup allows you to run the Node.js application and MySQL database together, with all configurations and dependencies managed in a single file.


## Step 8: Run the Application

1. **Build and Start the Containers**

   Navigate to the project directory and run the following command:

   ```bash
   docker-compose up --build
   ```

   This command will build the Docker images and start the containers as defined in the `docker-compose.yml` file.

2. **Access the Application**

   Once the containers are up and running, you can access the application at `http://localhost:5000/users`. You can now use tools like Postman or curl to test the following endpoints:

- **POST /users**: Create a new user.
- **GET /users**: Get all users.
- **GET /users/:id**: Get a user by ID.
- **PUT /users/:id**: Update a user by ID.
- **DELETE /users/:id**: Delete a user by ID.


## Conclusion

By following this guide, you have successfully set up a Node.js REST API application using Express.js, Sequelize ORM, and MySQL database. The application is fully Dockerized, making it easy to deploy and manage the services. This setup ensures that your application can be developed, tested, and deployed consistently across different environments.