# File Management Platform

## Overview

This project is a simple platform for uploading and viewing files. It includes user authentication, file management functionalities, and utilizes technologies such as Nodejs, MongoDB, and background processing.

## Features

- User authentication via token
- Upload a new file
- List all uploaded files with pagination
- Change permission of a file
- View a file
- Generate thumbnails for images

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing file metadata.
- **Redis**: In-memory data structure store for caching and session management.
- **Sharp**: Library for image processing and thumbnail generation.

## Installation

1. Clone the repository:
``bash
git clone *repository-url*

2. Navigate to the project directory:
``bash
cd *project-directory*

3. Install the dependeccis:
``bash
npm install

4. Set up environment variables(create a .env file):
``plaintext
MONGO_URL=*your-mongo-uri*
REDIS_URL=*your-redis-url*
JWT_SECRET=*your-jwt-secret*

5. Start the server
``bash
npm start

## Usage

### Authentication

- **Registration**:POST /api/auth/register
- **Login**:POST /api/auth/login

### File Management

- **Upload a File**:POST /api/files/upload
- **List Files**:GET /api/files
- **Change File Permission**:PATCH /api/files/:id/permission
- **View a File**:GET /api/files/:id

## Documentation

### Redis Client

The ***RedisClient*** class located in the ***utils/redis.js*** file provides methods to interact with the Redis database:

- **isAlive()**: Checks if the Redis connection is alive.
- **get(key)**: Retrieves the value associated with the key.
- **set(key, value, duration)**: Stores a value with an expiration time.
- **del(key)**: Deletes the value associated with the key.

### DB Client

The ***DBClient*** class located in the ***utils/db.js*** file provides methods to interact with the MongoDB database:

- **isAlive()**: Returns true if the connection to MongoDB is successful, otherwise false.
- **nbUsers()**: Returns the number of documents in the users collection.
- **nbFiles**: Returns the number of documents in the files collection.

#### Example Usage

You can use the dbClient instance as follows:

## Contributing

Contributions are welcome! Pleae follow these steps:

1. Fork the repository
2. Create a new branch (eg., feature/my-feature).
3. Make your cchanges.
4. Submit a pull request.

## License

This projecct is licensed udner the ALX License.

## Acknowlegements

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [Sharp](https://sharp.pixelplumbing.com/)
