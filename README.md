# Bootcamper RESTful API

## Features

> CRUD (Create, Read, Update And Delete)

- Authentication with JWT (Reset Password with email)
  - Login (User/Admin)
  - Register
  - Forgot Password
- Admin Routes
  - CRUD operations for users
- Pagination and search where necessary
- API Security (NoSQL Injections, XSS Attacks, http param pollution etc)
- Many more Features ....

## API Documentation

Hosted on heroku: [Coming Soon]()

Extensive and testing documentation with postman: [Bootcamper API](https://documenter.getpostman.com/view/3377124/TVKBXd82)


## Requirement

- NodeJS
- MongoDB

## Configuration File

Create a config/.env then modify to your environment variables, mongodb uri, set your JWT_SECRET and SMTP variables

```ENV
NODE_ENV=development
PORT=3001

MONGO_URI=YOUR_URL

JWT_SECRET=YOUR_SECRET
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=
SMTP_PASSWORD=
FROM_EMAIL=noreply@bootcampe.com
FROM_NAME=Bootcamper Api
```

Email testing: use mailtrap for email testing, it's easy no stress.

## Installation

Install all npm dependecies

```console
npm install
```

Install nodemon globally

```console
npm install -g nodemon
```

## Start web server

```console
node run dev
```

## Developed by Avinash
