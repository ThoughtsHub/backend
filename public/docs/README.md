# Process

## Signup Process

1. POST /otp/get with mobile or email
2. You will get a response with a confirmationId
3. POST /otp/verify with otp and the above confirmationId
4. You will get a response with a new confirmationId
5. POST /signup/create-password with password and above confirmationId
6. You will get a userToken, you can discard the confirmationId now

# Endpoints

## Important Information

userToken when found, Send it with each subsequent request in headers \
inside the field 'auth_token'

## POST /login

**Body :**

```sh
{
    [ username | email | mobile ]: string
    password: string
}
```

**Response :**

```sh
{
    success: bool
    message: "Logged in"
    userToken: string
    profileCreated: bool
    profile: null | ({
        id: string
        fullName: string
        ...
    })
}
```

## POST /otp/get

**Body :**

```sh
{
    [ mobile | email ]: string
    isMobile: bool
}
```

**Response :**

```sh
{
    success: bool
    message: "OTP sent"
    otpSent: bool
    confirmationId: string
}
```

## POST /otp/verify

**Body :**

```sh
{
    otp: string
    confirmationId: string
}
```

**Response :**

```sh
{
    success: bool
    message: "OK"
    confirmationCodeMatched: bool
    confirmationId: string  ( different than previous one )
}
```

## POST /signup/create-password

**Body :**

```sh
{
    password: string
    confirmationId: string
}
```

**Response :**

```sh
{
    success: bool
    message: "User created"
    userToken: string
}
```

## GET /profile

**Query :**

```sh
{
    id: string
}
```

**Response :**

```sh
{
    success: bool
    message: "Requested Profile"
    profile: ({
        id: string
        fullName: string
        about: string
        ...

        School: [
            ({
            schoolName: string
            studyCourse: string
            ...
        }),
        ...
        ]
    })
}
```

## GET /profile/me

**Response :**

```sh
{
    success: bool
    message: "Your Profile"
    profile: ({
        id: string
        fullName: string
        about: string
        ...

        Schools: [
            ({
            schoolName: string
            studyCourse: string
            ...
        }),
        ...
        ]
    })
}
```

## POST /profile

Creation and updation, both can happen on the same endpoint

```sh
{
    fullName: string
    dob: date [yyyy-dd-mm]
    about: string
    gender: string [male | female | other]
}
```

**Response :**

If updating, only those values that are changed will be returned

```sh
{
    success: bool
    message: "User created"
    profile: ({
        id: string
        fullName: string
        about: string
        dob: string
        gender: string
        ...
    })
}
```


## POST /school

**

## .

# Endpoints (Development Purposes)

## /delete-user

if email/mobile exists, will destory the user associated with that email/mobile

**Query :**

```sh
{
    [email | mobile] : string
}
```

**Response :**

```sh
{
    success: bool
    message: string
}
```

## /test

**Response :**

```sh
{
    success: bool
    message: string
    user: ({
        id: string
        username: string
        ...
    })
}
```
