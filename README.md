# Files Manager

## Description
Files Manager is a simple platform for uploading and viewing files. This project is built using Node.js, Express, MongoDb, Redis, and Bull for background processing. It aims to demonstrate user authentication, file management, and image thumbnail generation.

## Features
- User authentication via token
- List all uploaded files
- Upload new files
- Change new files
- View files
- Generate thumbnails for images

## Technologies Used
- **Node.js**: JavaScript runtime for server-side programming
- **Express**: Web framework for building APIs
- **MongoDB**: NoSQL database for storing file data
- **Redis**: In-memory data structure store for caching
- **Bull**: Queue library for hangling background jobs
- **Mocha**: Testing framework for running tests
- **Nodemon**: Tool for authomatically restarting the server during development
- **Image-thumbnail**: Library for generating image thumbnails
- **Mime-types**: Library for hangling MIME types

## Installation
1. Clone the repository:
```bash
  git clone <repository-url>
```
2. Navigate to the project directory:
```bash
  cd files_manager
```
3. Install dependecies:
```bash
  npm install
```

## Usage

##### Start the server
To start the server, run:
```bash
  npm run startt-server
```

#### Start the worker
To start the background worker, run:
```bash
  npm run start-worker
```

#### Run Tests
To run tests, use:
```bash
  npm test
```

## API Endpoints
* #### POST /auth/login
  Authenticate user and recieve a token
* #### GET/files
  Retrieve a list of all files
* #### POST/files/upload
  Upload a new file
* #### GET/files/:id
  Permissions of specific file.
* #### GET/files/:id/thumbnail
  Generate and retrieve thumbnail for an image

## Requirements
* Ubuntu 18.04 LTS
* Node.js version 12.x.x
* Code is linted using ESLint.

## Linting
To check for linting issues, run:
```bash
npm run lint
```

## Authors

| Name             | GitHub Profile                                       | X Profile                                 |
|------------------|------------------------------------------------------|-------------------------------------------|
| Frank W.     Ugwu| [yourusername](https://github.com/realfrankiewilson) |  [@frankwilies](https://x.com/frankwilies)|
| Loubna           | [coauthorusername](https://github.com/Loubnaa1)      |  [@loubna](loubnaaddress)                 |


