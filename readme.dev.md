# Process

## Signup

1. POST /get-otp with mobile or email
2. You will get a response with a confirmationId
3. POST /verify-otp with otp and the above confirmationId
4. You will get a response with a new confirmationId
5. POST /create-password with password and above confirmationId
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
}
```

## POST /get-otp

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

## POST /verify-otp

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

## POST /create-password

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

## POST /profile

**Body :**

```sh
{
    fullName: string
    about: string
    gender: string ("Male", "Female", "Other")
    dob: Date
}
```

**Response :**

```sh
{
    success: bool
    message: "Profile created"
}
```

## POST /school

**Body :** \
List of JSON objects

```sh
{
    schools : [
        {
            schoolName: string ("Either name or school code")
            studyCourse: string
            description: string
            startDate: Date [optional]
            startYear: integer
            endDateExpected: Date [optional]
            endYear: integer
        }
    ]
}
```

**Response :**

```sh
{
    success: bool
    message: "Schools added"
}
```

## GET /news

**Query :**

```sh
{
    offset: integer | 0
}
```

**Response :**

```sh
{
    success: bool
    message: "News"
    offsetNext: integer
    news: [
        {
            title: string
            description: string
            images: [string]
            handle: string
            shareUrl: string
            createdAt: Date
            updatedAt: Date
        }
    ]
}
```

## GET /forums

**Query :**

```sh
{
    offset: integer | 0
}
```

**Response :**

```sh
{
    success: bool
    message: "Forums"
    offsetNext: integer
    forums: [
        {
            handle: string

            title: string
            description: string
            images: [string]

            upvotes: integer
            comments: integer

            upvoteByUser: bool
            shareUrl: string

            createdAt: Date
            updatedAt: Date

            writer: ({
                handle: string
                pfp: string
                fullName: string
                latestSchoolName: string
                ...
            })
        }
    ]
}
```

## POST /forums

**Body :**

```sh
{
    title: string
    description: string
    images: [string]   ( optional )
}
```

**Response :**

```sh
{
    success: bool
    message: "Forum posted"
    handle: string  ( forum handle )
}
```

## GET /forums/comments

**Query :**

```sh
{
    handle: string  ( forum handle )
    offset: integer | 0
}
```

**Response :**

```sh
{
    success: bool
    message: "Comments"
    offsetNext: integer
    comments: [
        {
            comment: string

            createdAt: Date

            writer: ({
                id: string
                pfp: string
                fullName: string

            })
        }
    ]
}
```

## POST /forums/upvote

**Body :**

```sh
{
    handle: string ( forum handle )
}
```

**Response :**

```sh
{
    success: bool
    message: "Upvoted"
}
```

## POST /forums/unvote

**Body :**

```sh
{
    handle: string ( forum handle )
}
```

**Response :**

```sh
{
    success: bool
    message: "Unvoted"
}
```

## GET /profile/:username

**Body :**

```sh
{
    handle: string ( writer handle )
}
```

**Response :**

```sh
{
    success: bool
    message: "username's profile"
    profile: ({
        handle: string
        fullName: string
        username: string | null
        pfp: string
        about: string
        shareUrl: string

        posts: integer
        followers: integer
        following: integer
        forums: integer

        createdAt: Date
        updatedAt: Date

    })
    forums: [
        {
            title: string
            description: string
            images: [string]
            upvotes: integer
            comments: integer
            shareUrl: string
            createdAt: Date
            updatedAt: Date
        }
    ]
    highlightedForums: [
        {
            title: string
            description: string
            images: [string]  ( optional )
            createdAt: Date
            updatedAt: Date
        }
    ]
    books: [
        {

        }
    ]
    jobs: [
        {

        }
    ]
    savedNews: [
        {
            title: string
            description: string
            images: [string]
            handle: string
            shareUrl: string
            createdAt: Date
            updatedAt: Date
        }
    ]
    wishlistBooks: [
        {

        }
    ]
}
```

## GET /profile/me

**Response :** \
Same as GET /profile/:username
but with the details of logged in user

## GET /books

**Response :**

```sh
{
    success: bool
    message: "Books"
    wishlistBooks: [
        {
            coverImage: string
            title: string
            author: [string]
            handle: string

            rating: decimal
            ratedBy: integer

            addToWishlistUrl: string

            purchasedByUser: bool

            description: string
            aboutAuthor: string
        }
    ]
    favoriteWritersBooks: []
    romanceBooks: []
    literatureBooks: []
}
```

## GET /books/by-category

**Query :**

```sh
{
    category: string | [string]
    offset: integer | 0
}
```

**Response :**

```sh
{
    success: bool
    message: "Books"
    offsetNext: integer
    books: [
        {
            coverImage: string
            title: string
            author: [string]
            handle: string

            rating: decimal
            ratedBy: integer

            addToWishlistUrl: string

            purchasedByUser: bool

            description: string
            aboutAuthor: string
        }
    ]
}
```

## GET /books/review

**Query :**

```sh
{
    handle: string ( book handle )
    offset: integer | 0
}
```

**Response :**

```sh
{
    success: bool
    message: "Reviews for this book"
    reviews: [
        {
            review: string
            handle: string
            createdAt: Date

            writer: ({
                handle: string
                pfp: string
                fullName: string
                about: string
                latestSchoolName: string
            })
        }
    ]
}
```

## POST /books/review

**Body :**

```sh
{
    handle: string  ( book handle )
    review: string
}
```

**Response :**

```sh
{
    success: bool
    message: "Review saved"
}
```
