# **API Documentation**

To use the API, There are some pre-requisites that need to cleared:

Login and signup both will return a `token` at the end of its own process.
After recieving the `token`, send the `token` in each subsequent request, until logout, for being authorized as a **user** of the application.
This `token` has to sent in headers in a custom field `auth_token`.

Each request, whether `GET`, `POST`, `PUT`, `PATCH` or `DELETE`, will return status code of **200** for a successful request.
Each response will always be json, except for html pages/user uploads, containing these two fields at least:

- **message** : Describes response. if error, then why?
- **success** : A bool value representing if the request was successfull or not.

---

Success Status Code: **200**\
Headers Token for Authorization (Login): **auth_token**

---

> Each **Profile** Object will have these fields in them:

```js
{
    fullName: string
    ...
    followers: number
    following: number
    forums: number
}
```

---

## Models

Each section in **Models** is divided by the model it represents in the backend.

---

### Institute

```js
{
  instituteId: string;
  aisheCode: string;
  category: "College" |
    "Standalone" |
    "University" |
    "R & D Institute" |
    "PM Vidyalaxmi";
  type: "Constituent / University College" |
    "Recognized Center" |
    "Affiliated College" |
    "Autonomous College" |
    "PG Center / Off-Campus Center" |
    "Rural" |
    "Urban" |
    "Technical/Polytechnic" |
    "Paramedical" |
    "Pharmacy Institutions" |
    "Teacher Training" |
    "Nursing" |
    "PGDM Institutes" |
    "Hotel Management and Catering" |
    "Institutions under Rehabilitation Council of India" |
    "Institutes under Ministries" | null;
  management: "Private" |
    "University" |
    "Affiliated College" |
    "Central Government" |
    "Private Aided (Government Aided)" |
    "Local Body" |
    "Constituent / University College" |
    "Technical/Polytechnic" |
    "State Government" |
    "Private Un-Aided" | null;
  state: Indian States | null;
  name: string;
  district: string | null;
  website: string | null;
  yearOfEstablishment: string;
  location: string| null;
  administrativeMinistry: string | null;

  ** These others following only appear in category 'College':

  universityType: string | null;
  universityName: string | null;
  university: Institute object (same as this) for the university belong to
}
```

---

## **Routes**

Each section in **Routes** is divided by the action that can be performed on the API.
The format of each endpoint is **`REQUEST TYPE`** **`ENDPOINT`**

for example, in POST /forums, `POST -> Request Type` and `/forums -> Endpoint` to which request to send.

---

### Login

#### POST /login

To login the user.

**Body :**

```js
{
  email: string { Required }
  password: string { Required }
}
```

> **email** here is the umbrella term for username/mobile/email, and password.

**Response :**

```js
{
    message: string
    success: boolean
    auth_token: string
    user: {
            userId: string
            profileId: string
            username: string
            fullName: string
            about: string
            profileImageUrl: string | null
            gender: string
            dob: number | null
            forumsCount: number
            createDate: number
            updateDate: number
            ...
          } | null
}
```

> **user** field can be `null` if no profile was created by the user.

**Response status codes**

- `200` : Request was fulfilled, an auth_token was sent by the server
- `400` :
  - Required fields were not given
  - If no user found, with given **credentials**
- `401` : Password for the given email did not match correctly
- `500` : Some error occured at server, contact admin.

---

### Signup

#### POST /otp/get

Sends a unique OTP at the given email/mobile.

**Body :**

```js
{
    [email | mobile]: string
    isMobile: boolean { Required, default: false }
}
```

> email or mobile have to be sent, and isMobile have to be set to `true` if requesting for mobile.

**Response :**

```js
{
  message: string;
  success: boolean;
}
```

> `otp` will be sent to the requested email/mobile

**Response status codes**

- `200` : Request successful, otp may have been sent to requested email/mobile
- `400` : Email and mobile both were not provided
- `409` : Requested email/mobile have already been used by another user
- `500` : Some error occured at server, contact admin.

#### POST /otp/verify

Verifies the otp sent to requested email/mobile.

**Body :**

```js
{
  contact: string { Required }
  otp: string { Required }
}
```

> `contact` is the requested email/mobile

**Response :**

```js
{
  message: string;
  success: boolean;
  otpToken: string;
}
```

> `otpToken` will only be valid for 5 minutes, in that 5 minutes, user will have to set the password for the account, or else, will have to restart from otp generation

**Response status codes**

- `200` : Request successful, otp verified, and a otpToken has been sent in request
- `400` : Required fields were not provided
- `401` : OTP for the requested email/mobile is not matched correctly
- `500` : Some error occured at server, contact admin.

#### POST /signup/create-password

Creates a user with the OTP requested contact and the password user sets.

**Body :**

```js
{
  otpToken: string { Required }
  password: string { Required }
}
```

> `otpToken` will only be valid for 5 minutes

**Response :**

```js
{
  message: string;
  success: boolean;
  auth_token: string;
  user: null;
}
```

> `user` will be sent as `null` because no profile has been created yet

**Response status codes**

- `200` : Request successful, user has been created, and now user can login with auth_token
- `400` :
  - Required fields were not provided
  - Provided otpToken is invalid, or 5 minutes time out
- `500` : Some error occured at server, contact admin.

#### GET /check-username

Checks if username is available or not

**Query :**

```js
{
  username: string { Required }
}
```

**Response :**

```js
{
  message: string;
  success: boolean;
  isAvailable: boolean;
}
```

**Response status codes**

- `200` : Request successful, username is available
- `400` : Required fields were not provided
- `404` : Username is not available
- `500` : Some error occured at server, contact admin.

---

### Forgot Password

The flow would remain the same as signup : Get OTP -> Verify OTP -> Update Password

#### POST /forgot-password/otp/get

Sends a unique OTP at the given email/username after checking if associated user exists

**Body :**

```js
{
  email: string;
}
```

**Response :**

```js
{
  message: string;
  success: boolean;
}
```

> `otp` will be sent to the associated email

#### POST /forgot-password/otp/verify

Verifies the otp sent to associated email.

**Body :**

```js
{
  contact: string { Required } [email | username]
  otp: string { Required }
}
```

> `contact` is the associated username/email

**Response :**

```js
{
  message: string;
  success: boolean;
  otpToken: string;
}
```

> `otpToken` will only be valid for 5 minutes, in that 5 minutes, user will have to set the password for the account, or else, will have to restart from otp generation

#### POST /forgot-password/set-password

Updates the password of the user.

**Body :**

```js
{
  otpToken: string { Required }
  password: string { Required }
}
```

> `otpToken` will only be valid for 5 minutes

**Response :**

```js
{
  message: string;
  success: boolean;
}
```

---

### Profile

#### POST /profile

Creates the profile for the logged in user.

**Body :**

```js
{
  username: string { Required }
  fullName: string { Required }
  about: string { Required }
  profileImageUrl: string
  gender: string
  dob: number
}
```

**Response :**

```js
{
    message: string
    success: boolean
    user: {
            userId: string
            profileId: string
            username: string
            fullName: string
            about: string
            profileImageUrl: string | null
            gender: string
            dob: number | null
            forumsCount: number
            createDate: number
            updateDate: number
            ...
          }
}
```

**Response status codes**

- `200` : Request successful, profile has been created, and many functionalities for user has been opened
- `400` :
  - Required fields were not provided
  - Username unavailable
  - If the profile has already been created. for update, use PUT/PATCH request type
  - If fullName is not >=3 three characters, excluding the spaces
  - If current age is not in range 15 - 80 years
- `500` : Some error occured at server, contact admin.

#### PUT /profile

To update the user profile completely.

**Body :**

```js
{
  username: string { Required }
  fullName: string { Required }
  about: string { Required }
  profileImageUrl: string
  gender: string
  dob: number
}
```

**Response :**

```js
{
    message: string
    success: boolean
    user: {
            userId: string
            profileId: string
            username: string
            fullName: string
            about: string
            profileImageUrl: string | null
            gender: string
            dob: number | null
            forumsCount: number
            createDate: number
            updateDate: number
            ...
          }
}
```

**Response status codes**

- `200` : Request successful, profile has been updated
- `400` :
  - Required fields were not provided
  - If fullName is not >=3 three characters, excluding the spaces
  - If current age is not in range 15 - 80 years
- `500` : Some error occured at server, contact admin.

#### PATCH /profile

Update only requested fields.

**Body :**

```js
{
  username: string;
  fullName: string;
  about: string;
  profileImageUrl: string;
  gender: string;
  dob: number;
}
```

**Response :**

```js
{
    message: string
    success: boolean
    user: {
            userId: string
            profileId: string
            username: string
            fullName: string
            about: string
            profileImageUrl: string | null
            gender: string
            dob: number | null
            forumsCount: number
            createDate: number
            updateDate: number
            ...
          }
}
```

**Response status codes**

- `200` : Request successful, profile updated
- `400` :
  - Username invalid, or not available
  - If fullName is not >=3 three characters, excluding the spaces
  - If current age is not in range 15 - 80 years
- `500` : Some error occured at server, contact admin.

#### GET /profile

Gets the profile of a certain user.

**Query :**

```js
{
  profileId: string { Required }
}
```

**Response :**

```js
{
    message: string
    success: boolean
    profile: {
            userId: string
            profileId: string
            username: string
            fullName: string
            about: string
            profileImageUrl: string | null
            gender: string
            dob: number | null
            isFollowing: boolean
            forumsCount: number
            createDate: number
            updateDate: number
            ...
          }
}
```

**Response status codes**

- `200` : Request successful, user profile has been sent
- `400` : Invalid profile Id, or, No Id provided
- `500` : Some error occured at server, contact admin.

#### GET /profile/me

Gets the profile of currently logged in user.

**Response :**

```js
{
    message: string
    success: boolean
    profile: {
            userId: string
            profileId: string
            username: string
            fullName: string
            about: string
            profileImageUrl: string | null
            gender: string
            dob: number | null
            isFollowing: boolean
            forumsCount: number
            createDate: number
            updateDate: number
            ...
          }
}
```

**Response status codes**

- `200` : Request successful, got profile
- `400` : Username invalid, or not available
- `500` : Some error occured at server, contact admin.

#### GET /profile/forums

Gets the forums of requested user, or currently logged in user.

**Query :**

```js
{
  profileId: string { Required }
  offset: number { Required, default: 0 }
}
```

> when requesting for currently logged in user, `profileId` should not be sent. It will be automatically placed using the provided `auth_token` in headers.

**Response :**

```js
{
    message: string
    success: boolean
    forums: [
        {
            id: string
            localId: string
            profileId: string
            title: string
            body: string
            createDate: number
            updateDate: number
            isVoted: boolean
            writer: {
                        userId: string
                        profileId: string
                        username: string
                        fullName: string
                        about: string
                        profileImageUrl: string
                        gender: string
                        dob: string
                        isFollowing: boolean
                    }
            ...
        }
    ]
}
```

**Response status codes**

- `200` : Request successful, forums sent
- `400` : Profile Id invalid
- `500` : Some error occured at server, contact admin.

#### POST /profile/follow

Follow a user

**Body :**

```js
{
  following: string [profileId of user you want to follow]
}
```

**Result :**

```js
{
  success: boolean;
  message: string;
}
```

#### POST /profile/unfollow

Unfollow a user

**Body :**

```js
{
  following: string [profileId of user you want to unfollow]
}
```

**Result :**

```js
{
  success: boolean;
  message: string;
}
```

#### GET /profile/followers

Get the followers list of the requested user

**Query :**

```js
{
    offset: number [default : 0]
    profileId: string [whose followers list you want]
}
```

**Result :**

```js
{
    success: boolean
    message: string
    followers: [
        {
            profileId: string
            followerId: string
            profile : {
                userId: string
                profileId: string
                username: string
                fullName: string
                about: string
                profileImageUrl: string
                gender: string
                dob: string
                isFollowing: boolean
            }
        }
    ]
    newOffset: number | null
}
```

> If `newOffset` is `null`, followers have been exhausted

#### GET /profile/following

Get the followings list of the requested user

**Query :**

```js
{
    offset: number [default : 0]
    profileId: string [whose followings list you want]
}
```

**Result :**

```js
{
    success: boolean
    message: string
    followings: [
        {
            profileId: string
            followerId: string
            profile : {
                userId: string
                profileId: string
                username: string
                fullName: string
                about: string
                profileImageUrl: string
                gender: string
                dob: string
                isFollowing: boolean
            }
        }
    ]
    newOffset: number | null
}
```

> If `newOffset` is `null`, followings have been exhausted

---

### Profile Education

#### GET /profile/education

Gets all the institutes the profile is associated with

**Query :**

```js
{
  profileId: string;
}
```

**Result :**

```js
{
    message: string
    success: boolean
    educations: [
        {
            educationId: string
            instituteId: string
            profileId: string
            startYear: number
            startMonth: number | null
            endYear: number | null
            endMonth: number | null
            isCompleted: boolean
            institute: {
                id: string
                category: string;
                aisheCode: string;
                name: string;
                state: string | null;
                district: string | null;
                website: string | null;
                yearOfEstablishment: string | null;
                location: string | null;
                type: string | null;
                management: string | null;
                universityName: string | null;
                universityType: string | null;
                administrativeMinistry: string | null;
                imageUrl: string | null;
            }
        }
    ]
}
```

#### POST /profile/education

Adds the education to the profile

**Body :**

```js
{
  instituteId: string;
  startYear: number;
  startMonth: number | null;
  endMonth: number | null;
  endYear: number | null;
  isCompleted: true | false;
}
```

**Result :**

```js
{
  message: string;
  success: boolean;
  education: {
    educationId: string;
    instituteId: string;
    profileId: string;
    startYear: number;
    startMonth: number | null;
    endYear: number | null;
    endMonth: number | null;
    isCompleted: boolean;
  }
}
```

#### PUT /profile/education

Updates the education to the profile

**Body :**

```js
{
  educationId: string;
  instituteId: string;
  startYear: number;
  startMonth: number | null;
  endMonth: number | null;
  endYear: number | null;
  isCompleted: true | false;
}
```

**Result :**

```js
{
  message: string;
  success: boolean;
  education: {
    educationId: string;
    instituteId: string;
    profileId: string;
    startYear: number;
    startMonth: number | null;
    endYear: number | null;
    endMonth: number | null;
    isCompleted: boolean;
  }
}
```

#### DELETE /profile/education

Removes the education from the profile

**Query :**

```js
{
  educationId: string;
}
```

**Result :**

```js
{
  message: string;
  success: boolean;
}
```

---

### Logout

#### GET /logout

Logs out the current user, makes the `auth_token` invalid for any use afterwards.

**Response :**

```js
{
  message: string;
  success: boolean;
}
```

**Response status codes**

- `200` : Request successful, logged out
- `500` : Some error occured at server, contact admin.

---

### News

#### GET /news

Gets the news, by using timestamp.

**Query :**

```js
{
  categories: string[] { Required, default: [] }
  timestamp: number { Required, default: 0 | null }
}
```

**Response :**

```js
{
    message: string
    success: boolean
    news: [
        {
            id: string
            title: string
            body: string
            hindiTitle: string | "" | null
            hindiBody: string | "" | null
            imageUrl: string | null
            newsUrl: string
            category: string
            createDate: number
            updateDate: number
            ...
        }
    ]
}
```

**Response status codes**

- `200` : Request successful, news sent
- `400` : News category invalid
- `500` : Some error occured at server, contact admin.

#### GET /news/bo

Gets the news, by using offset, mainly used by admin panel of API.

**Query :**

```js
{
  category: string { Required, default: "All" }
  offset: number { Required, default: 0 }
}
```

**Response :**

```js
{
    message: string
    success: boolean
    totalNews: number
    nextOffset: number
    news: [
        {
            id: string
            title: string
            body: string
            hindiTitle: string | "" | null
            hindiBody: string | "" | null
            imageUrl: string | null
            newsUrl: string
            category: string
            createDate: number
            updateDate: number
            ...
        }
    ]
}
```

**Response status codes**

- `200` : Request successful, news sent
- `400` : News category invalid
- `500` : Some error occured at server, contact admin.

#### GET /news/pages

Gets the total news pages, mainly used by admin panel for API.

**Query :**

```js
{
  category: string { Required, default: "All" }
}
```

**Response :**

```js
{
  message: string;
  success: boolean;
  total: number;
}
```

**Response status codes**

- `200` : Request successful, news sent
- `400` : News category invalid
- `500` : Some error occured at server, contact admin.

#### GET /news/:id

Gets a specific news by its ID, mainly used by admin panel

**Params :**

```js
{
  id: string { Required }
}
```

**Response :**

```js
{
    message: string
    success: boolean
    news: {
            id: string
            title: string
            body: string
            hindiTitle: string | "" | null
            hindiBody: string | "" | null
            imageUrl: string | null
            newsUrl: string
            category: string
            createDate: number
            updateDate: number
            ...
          }
}
```

**Response status codes**

- `200` : Request successful, news sent
- `400` : News category invalid
- `500` : Some error occured at server, contact admin.

#### GET /categories

Gets all the categories in the news.

**Response :**

```js
{
    message: string
    success: boolean
    categories: [
        {
            name: string
            value: string
        }
    ]
}
```

> Right now, `name` is what is being set for news category

**Response status codes**

- `200` : Request successful, news sent
- `500` : Some error occured at server, contact admin.

---

### Forums

#### POST /forums

Creates a forum post by the logged in user.

**Body :**

```js
{
  localId: string
  title: number { Required }
  body: string { Required }
  imageUrl: string
}
```

**Response :**

```js
{
    message: string
    success: boolean
    forum: {
            id: string
            localId: string
            profileId: string
            title: string
            body: string
            createDate: number
            updateDate: number
            ...
           }
}
```

**Response status codes**

- `200` : Request successful, forum created
- `400` : Required fields were not provided
- `500` : Some error occured at server, contact admin.

#### PUT /forums

Updates the forum completely.

**Body :**

```js
{
  id: string { Required }
  localId: string
  title: number { Required }
  body: string { Required }
  imageUrl: string
}
```

**Response :**

```js
{
    message: string
    success: boolean
    forum: {
            id: string
            localId: string
            profileId: string
            title: string
            body: string
            createDate: number
            updateDate: number
            ...
           }
}
```

**Response status codes**

- `200` : Request successful, forum updated
- `400` : Required fields were not provided
- `403` : When trying to update the forum of different user.
- `500` : Some error occured at server, contact admin.

#### GET /forums

Gets the forums, by using timestamp.

**Query :**

```js
{
  timestamp: string { Required, default: 0 | null }
}
```

**Response :**

```js
{
    message: string
    success: boolean
    totalForums: number
    forums: [
        {
            id: string
            localId: string
            profileId: string
            imageUrl: string | null
            title: string
            body: string
            createDate: number
            updateDate: number
            isVoted: boolean
            writer: {
                        userId: string
                        profileId: string
                        username: string
                        fullName: string
                        about: string
                        profileImageUrl: string
                        gender: string
                        dob: string
                        isFollowing: boolean
                    }
            ...
        }
    ]
}
```

**Response status codes**

- `200` : Request successful, forums sent
- `500` : Some error occured at server, contact admin.

#### DELETE /forums

Deletes a specific forum associated with the logged in user.

**Query :**

```js
{
  forumId: string { Required }
}
```

**Response :**

```js
{
  message: string;
  success: boolean;
}
```

**Response status codes**

- `200` : Request successful, forum deleted
- `400` : Required fields were not provided
- `403` : When trying to delete the forum of different user.
- `500` : Some error occured at server, contact admin.

---

### Forums - Voting

#### POST /forums/upvote

Upvotes the forum post by the logged in user.

**Body :**

```js
{
  forumId: string { Required }
  value: boolean { Required, default: false }
}
```

> If `value` is `true`, that means user has upvoted, and if `value` is `false`, then user has chosen to remain neutral

**Response :**

```js
{
  message: string;
  success: boolean;
}
```

**Response status codes**

- `200` : Request successful, forum voted
- `500` : Some error occured at server, contact admin.

---

### Forums - Comments

#### POST /forums/comments

Creates a comment by user on a specific forum post.

**Body :**

```js
{
  forumId: string { Required }
  localId: string
  body: string { Required }
}
```

**Response :**

```js
{
  message: string;
  success: boolean;
  comment: {
    id: string;
    localId: string;
    forumId: string;
    profileId: string;
    body: string;
    createDate: number;
    updateDate: number;
  }
}
```

**Response status codes**

- `200` : Request successful, comment created
- `400` :
  - Required fields were not provided
  - forumId is Invalid
- `500` : Some error occured at server, contact admin.

#### PUT /forums/comments

Updates the whole comment.

**Body :**

```js
{
  localId: string
  commentId: string { Required }
  forumId: string { Required }
  body: string { Required }
}
```

**Response :**

```js
{
  message: string;
  success: boolean;
  comment: {
    id: string;
    localId: string;
    forumId: string;
    profileId: string;
    body: string;
    createDate: number;
    updateDate: number;
  }
}
```

**Response status codes**

- `200` : Request successful, comment updated
- `400` :
  - Required fields were not provided
  - commentId or forumId is invalid
  - If the requested comment is not assciated with the forum
- `500` : Some error occured at server, contact admin.

#### GET /forums/comments

Gets the comments on a forum, by using timestamp.

**Query :**

```js
{
  forumId: string { Required }
  timestamp: string { Required, default : 0 | null }
}
```

**Response :**

```js
{
  message: string
  success: boolean
  comments: [
        {
            id: string
            localId: string
            forumId: string
            profileId: string
            body: string
            createDate: number
            updateDate: number
            writer: {
                        userId: string
                        profileId: string
                        username: string
                        fullName: string
                        about: string
                        profileImageUrl: string
                        gender: string
                        dob: string
                        isFollowing: boolean
                    }
                ...
        }
  ]
}
```

**Response status codes**

- `200` : Request successful, comments sent
- `400` :
  - Required fields were not provided
  - forumId is invalid
- `500` : Some error occured at server, contact admin.

#### DELETE /forums/comments

Deletes a specific comment, commented by user.

**Query :**

```js
{
  commentId: string { Required }
}
```

**Response :**

```js
{
  message: string;
  success: boolean;
}
```

**Response status codes**

- `200` : Request successful, comment deleted
- `400` :
  - Required fields were not provided
  - commentId is invalid
  - Comment does not belong to the current logged in user
- `500` : Some error occured at server, contact admin.

---

### Feedback

#### POST /feedback

Creates a feedback by user.

**Body :**

```js
{
  message: string { Required }
}
```

**Response :**

```js
{
  message: string;
  success: boolean;
  feedback: {
    id: string;
    profileId: string;
    message: string;
    createDate: number;
    updateDate: number;
  }
}
```

**Response status codes**

- `200` : Request successful, feedback created
- `400` : Required fields were not provided
- `500` : Some error occured at server, contact admin.

---

### Report

#### POST /report/forum

Reports a forum

**Body :**

```js
{
  postId: string { Required }
  reason: string { Required }
}
```

**Response :**

```js
{
  message: string;
  success: boolean;
  report: {
    id: string;
    userId: string | null;
    forumId: string | null;
    profileId: string;
    reason: string;
    createDate: number;
    updateDate: number;
  }
}
```

**Response status codes**

- `200` : Request successful, forum reported
- `400` :
  - Required fields were not provided
  - Invalid post Id
- `500` : Some error occured at server, contact admin.

---

### Users

#### GET /users

Gets suggested users

**Query :**

```js
{
  offset: number {default: 0}
}
```

**Result :**

```js
{
  message: string
  success: boolean
  users: [
            {
                userId: string
                profileId: string
                username: string
                fullName: string
                about: string
                profileImageUrl: string
                gender: string
                dob: string
                isFollowing: boolean
                ...
            }
         ]
}
```

**Response status codes**

- `200` : Request successful, users found
- `500` : Some error occured at server, contact admin.

---

### Wordle

The day format will be : **dd-mm-yyyy** \

If date is 1 January 2025 -> 01-01-2025 \
If date is 23 March 2026 -> 23-03-2026 \
and else with same formatting

#### GET /wordle/today

Get today's word

**Result :**

```js
{
  message: string;
  success: boolean;
  word: {
    day: string [format: dd-mm-yyyy]
    word: string
    hindiTranslation: string
    englishMeaning: string
    hindiMeaning: string
    englishSentenceUse: string
    hindiSentenceUse: string
  }
}
```

#### GET /wordle

Get word of a specific day

**Query :**

```js
{
    day: string [format : dd-mm-yyyy]
}
```

**Result :**

```js
{
  message: string;
  success: boolean;
  word: {
    day: string [format: dd-mm-yyyy]
    word: string
    hindiTranslation: string
    englishMeaning: string
    hindiMeaning: string
    englishSentenceUse: string
    hindiSentenceUse: string
  }
}
```

#### GET /wordle/words

Get words by offset

**Query :**

```js
{
    offset: number [default: 0]
}
```

**Result :**

```js
{
  message: string;
  success: boolean;
  word: [
    {
    day: string [format: dd-mm-yyyy]
    word: string
    hindiTranslation: string
    englishMeaning: string
    hindiMeaning: string
    englishSentenceUse: string
    hindiSentenceUse: string
  }
  ],
  newOffset: number | null
}
```

> If `newOffset` is `null` then no words are available.

#### POST /wordle

Sets the wordle's result for a specific day

**Body :**

```js
{
    day: string [format : dd-mm-yyyy]
}
```

If sent this request, will understand that the user solved the word of this specific day

#### GET /wordle/result

Gets the result for a specific day

**Query :**

```js
{
    day: string [format : dd-mm-yyyy]
    offset: number
}
```

**Result :**

```js
{
    message: string
    success: boolean
    userResult: {
        attempted: boolean [true | false]
        guessedCorrectly: boolean
        rank: number | null [null meaning either user didnt participate or is not logged in]
    }
    rankings: [
        {
            rank: number
            profile: {
                userId: string
                profileId: string
                username: string
                fullName: string
                about: string
                profileImageUrl: string
                gender: string
                dob: string
                isFollowing: boolean
            }
        }
    ]
    newOffset: number | null
}
```

> If `newOffset` is `null` then all candidates have been sent.

---

### Institutes

**Categories :** College, University, R & D Institute, PM Vidyalaxmi, Standalone

| Category        | Type                                               |
| --------------- | -------------------------------------------------- |
| College         | Constituent / University College                   |
| College         | Recognized Center                                  |
| College         | Affiliated College                                 |
| College         | Autonomous College                                 |
| College         | PG Center / Off-Campus Center                      |
| College         | Rural                                              |
| College         | Urban                                              |
| Standalone      | Technical/Polytechnic                              |
| Standalone      | Paramedical                                        |
| Standalone      | Pharmacy Institutions                              |
| Standalone      | Teacher Training                                   |
| Standalone      | Rural                                              |
| Standalone      | Nursing                                            |
| Standalone      | PGDM Institutes                                    |
| Standalone      | Hotel Management and Catering                      |
| Standalone      | Institutions under Rehabilitation Council of India |
| Standalone      | Institutes under Ministries                        |
| University      |                                                    |
| R & D Institute |                                                    |
| PM Vidyalaxmi   |                                                    |

| administrativeMinistry                                                     |
| -------------------------------------------------------------------------- |
| D/o Health Research, M/o Health and Family Welfare                         |
| Ministry of Agriculture and Farmers Welfare                                |
| D/o Health and Family Welfare, M/o Health and Family Welfare               |
| Office of Comptroller and Auditor General of India (CAG)                   |
| Ministry of Statistics & Programme Implementation                          |
| D/o Higher Education, Ministry of Education, GoI                           |
| Ministry of Science & Technology                                           |
| Ministry of Consumer Aff., Food, & Public Dist.                            |
| Ministry of Heavy Industries                                               |
| D/o Scientific and Industrial Research, M/o Science and Technology         |
| Ministry of Textiles                                                       |
| Ministry of Earth Sciences                                                 |
| Ministry of Commerce & Industry                                            |
| Ministry of Railways                                                       |
| D/o Defence Research & Development, Ministry of Defence                    |
| Ministry of External Affairs                                               |
| D/o Atomic Energy                                                          |
| Ministry of Power                                                          |
| Ministry of Home Affairs                                                   |
| Ministry of Environment, Forests and Climate Change                        |
| Ministry of Jal Shakti                                                     |
| Ministry of Health & Family Welfare                                        |
| D/o Agricultural Research and Education, M/o Agriculture & Farmers Welfare |
| Dept of Space                                                              |
| Ministry of Culture                                                        |
| D/o Biotechnology, M/o Science and Technology                              |
| Ministry of Micro, Small and Medium Enterprises                            |
| Ministry of New & Renewable Energy                                         |
| Ministry of Chemicals & Fertilizers                                        |
| Ministry of Education                                                      |
| Ministry of Finance                                                        |
| D/o Science & Technology, M/o Science and Technology                       |

| management                       |
| -------------------------------- |
| Private                          |
| University                       |
| Affiliated College               |
| Central Government               |
| Private Aided (Government Aided) |
| Local Body                       |
| Constituent / University College |
| Technical/Polytechnic            |
| State Government                 |
| Private Un-Aided                 |

| universityType                                |
| --------------------------------------------- |
| Deemed University-Government Aided            |
| Drs Kiran and Pallavi Patel Global University |
| State Public University                       |
| Institute under State Legislature Act         |
| State Private University                      |
| Deemed University-Government                  |
| Central University                            |
| Deemed University-Private                     |
| ASSAM SCIENCE AND TECHNOLOGY UNIVERSITY       |
| Institute of National Importance              |
| Andhra University, Visakhapatnam              |

| location |
| -------- |
| Rural    |
| Urban    |

> Every field can have null except for name, establishmentYear and state

States are just like as available from net

#### GET /institute

Gets the full details of a specific institute

**Query :**

```js
{
  instituteId: string;
}
```

**Result :**

```js
{
  message: string;
  success: boolean;
  institute: {
    id: string;
    category: string;
    aisheCode: string;
    name: string;
    state: string | null;
    district: string | null;
    website: string | null;
    yearOfEstablishment: string | null;
    location: string | null;
    type: string | null;
    management: string | null;
    universityName: string | null;
    universityType: string | null;
    administrativeMinistry: string | null;
    imageUrl: string | null;
  }
}
```

#### GET /institute/all

Gets the institute in array filtered by values if provided

**Query :**

```js
{
  offset: number [default: 0]
  category: string | null;
  aisheCode: string | null;
  name: string | null;
  state: string | null;
  district: string | null;
  website: string | null;
  yearOfEstablishment: string | null;
  location: string | null;
  type: string | null;
  management: string | null;
  universityName: string | null;
  universityType: string | null;
  administrativeMinistry: string | null;
  imageUrl: string | null;
}
```

**Result :**

```js
{
  message: string;
  success: string;
  institutes: [
    {
        id: string;
        category: string;
        aisheCode: string;
        name: string;
        state: string | null;
        district: string | null;
        website: string | null;
        yearOfEstablishment: string | null;
        location: string | null;
        type: string | null;
        management: string | null;
        universityName: string | null;
        universityType: string | null;
        administrativeMinistry: string | null;
        imageUrl: string | null;
    }
  ]
}
```

#### GET /institute/users/all

Gets all the users, irrelvant of the completion of the institute degree, affiliated with an institute

**Query :**

```js
{
  instituteId: string;
  offset: number;
}
```

**Result :**

```js
{
    message: string
    success: boolean
    users: [
        {
            userId: string
            profileId: string
            username: string
            fullName: string
            about: string
            profileImageUrl: string
            gender: string
            dob: string
            isFollowing: boolean
        }
    ]
    newOffset: number | null
}
```

> If `newOffset` is `null`, users have been exhausted

#### POST /institute/review

Give rating and review to an institute

**Body :**

```js
{
  instituteId: string;
  review: string;
  rating: integer(0 - 5);
}
```

**Result :**

```js
{
  message: string;
  success: boolean;
  id: string;
  instituteId: string;
  profileId: string;
  review: string;
  rating: number;
  createDate: number;
  updateDate: number;
}
```

#### GET /institute/review

Gets all the reviews and rating on an institute

**Query :**

```js
{
    instituteId: string
    offset: number [default: 0]
}
```

**Result :**

```js
{
  message: string;
  success: boolean;
  newOffset: number | null;
  reviews: [
    {
    id: string;
    instituteId: string;
    profileId: string;
    review: string;
    rating: number;
    createDate: number;
    updateDate: number;
    writer: {
                userId: string
                profileId: string
                username: string
                fullName: string
                about: string
                profileImageUrl: string
                gender: string
                dob: string
                isFollowing: boolean
            }
    }
  ]
}
```
