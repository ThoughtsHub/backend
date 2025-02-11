# Startup application

Process of creating a user:

GET /email/verify (query=email) -> OTP on email\
POST /email/verify (body=otp,email) -> OK, DIFF

POST /login/new (body=password,email,username) -> OK, logs in

Any error outside specified will have status code of `500`

## Routes

### POST /login

Logs the user

**Body:**

```sh
{
    username: string,
    password: string
}
```

**Response (If successful login) :**\
status code: `200`

```sh
{
    message: "user logged in succesfully",
    sessionId: string
}
```

**Response (unsuccesful login) :**

- username/password not given
  - status code: `400`
- password wrong
  - status code: `401`
- user blocked by admin
  - status code: `403`

`sessionId` will be available in cookies, if in `Web Browser`, or `Application`

### POST /login/new

Creates a user
**Body:**

```sh
{
    username: string,
    password: string,
    email: string
}
```

**Response (If successful signup) :**\
status code: `200`

```sh
{
    message: "user logged in succesfully",
    sessionId: string
}
```

**Response (unsuccesful login) :**

- username/password/email not given
  - status code: `400`
- username not available
  - status code: `409`
- email is not verified
  - status code: `401`
- email is already used by another user
  - status code: `409`
- password doesn't adhere rules
  - status code: `400`

`sessionId` will be available in cookies, if in `Web Browser`, or `Application`

### GET /email/verify

Sends a **OTP** to the requested email to be verified.
**Query :**

```sh
{
    email: string
}
```

**Response (If successful) :**\
status code: `200`

```sh
{
    message: "OTP sent",
}
```

**Response (If unsuccessful) :**

- No email given in query
  - status code: `400`
- couldn't generate otp (server error)
  - status code: `500`

### POST /email/verify

Verifies the **OTP** for the requested emaild.
**Body :**

```sh
{
    email: string,
    otp: string
}
```

**Response (If successful) :**\
status code: `200`

```sh
{
    message: "OTP verified",
    email: string
}
```

**Response (If unsuccessful) :**

- No email given
  - status code: `400`
- email already verified
  - status code: `200`
- invalid otp
  - status code: `401`
