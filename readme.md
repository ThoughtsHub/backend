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

### GET /logout

Logs the user out

**Not expecting anything from user**

**Response (success):**
status code: `204`

### POST /uploads

Upload an `Image`, `File`, `Document` anything on this in a form field with **name** `file`

**Body :**

```sh
{
    name: string,
    file: Full file here
}
```

**Response (success) :**
status code: `201`

```sh
{
    message: "File uploaded",
    file: Object({
        handle: string,
        url: string
    })
}
```

**Response (!success) :**

- any error
  - status code: `500`

### GET /uploads

gives all the uploads the user has ever done

**Query :**

```sh
{
    offset: integer | 0
}
```

**Response (success) :**
status code: `200`

```sh
{
    message: "Your uploads",
    uploads: [{
            url: string,
            filename: string,
            name: string,
            ext: string, # extension
            handle: string,
            createdAt: Date,
            updatedAt: Date
        }]
}
```

### GET /uploads/:filename

gives you the file if you put filename after /uploads
or status code: `404`

### PATCH /uploads

modify the name of the file, filename would not be change by this, just the `name` field of the file

**Body :**

```sh
{
    name: string,
    handle: string
}
```

**Response (success) :**
status code: `200`

```sh
{
    message: "Updated"
}
```

**Response (!success) :**

- `name` or `handle` is not given
  - status code: `400`
- `file` does not belong to `user`
  - status code: `403`

### DELETE /uploads/:handle

deletes the uploaded file with the specified `handle`

**Params :**

```sh
{
    handle: string
}
```

**Response (success) :**
status code: `204`
_No body_

**Response (!success) :**

- `file` does not belong to `user`
  - status code: `403`

### GET /profile

gets the profile of the **logged in** user

**Response (success) :**
status code: `200`

```sh
{
    username: string,
    pfp: string,
    firstName: string,
    middleName: string,
    lastName: string,
    displayName: string,
    age: integer,
    about: string,
    handle: string,
    likes: integer,
    followers: integer,
    following: integer,
    groups: integer,
    news: integer,
    articles: integer,
    posts: integer,
    forums: integer,
    booksIssued: integer,
    wallet: integer,
    education: []
}
```

### GET /profile/:username

gets the profile of the specified `username`

**Params :**

```sh
{
    username: string
}
```

**Response (success) :**
status code: `200`

```sh
{
    username: string,
    pfp: string,
    firstName: string,
    middleName: string,
    lastName: string,
    displayName: string,
    age: integer,
    about: string,
    handle: string,
    likes: integer,
    followers: integer,
    following: integer,
    groups: integer,
    news: integer,
    articles: integer,
    posts: integer,
    forums: integer,
    booksIssued: integer,
    wallet: integer,
    education: []
}
```

**Response (!success) :**

- invalid username
  - status code: `400`

### PATCH /profile

updates the content of profile with given parameters

**Body :**

```sh
{
    firstName: string,
    middleName: string,
    lastName: string,
    pfp: string,
    displayName: string,
    about: string,
    age: integer
}
```

**Response (success) :**
status code: `200`

```sh
{
    message: "Profile Updated"
}
```

All error result in status code of `500`

### PUT /profile

**Same as PATCH /profile**

### DELETE /profile/:key

empties the key (set to `null`) for the given key

key can be `firstName`, `lastName`, `middleName`, `displayName`

**Response (success) :**
status code: `204`
_No body_

**Response (!success) :**

- if key is `firstName`, `pfp`, `age`, `about`
  - status code: `400`
- if key not from above given list
  - status code: `400`
