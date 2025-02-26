# Process

## Signup

1. POST /otp/get with mobile or email
2. You will get a response with a confirmationId
3. POST /otp/verify with otp and the above confirmationId
4. You will get a response with a new confirmationId
5. POST /signup/create-password with password and above confirmationId
6. You will get a sessionId, you can discard the confirmationId now

# Routes

## Important Information

sessionId when found, Send it with each subsequent request

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
    sessionId: string
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
    sessionId: string
}
```
