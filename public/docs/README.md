# **API Documentation**

**Success Status Code**: `200` \
**Headers Token for Authorization (Login)**: `auth_token`

---

## **GET /check-username**

**Query Parameters**:

- `username` (String): The username to check.

**Response**:

```json
{
  "message": "Username available",
  "success": true,
  "isAvailable": true
}
```

OR

```json
{
  "message": "Username not available",
  "success": false,
  "isAvailable": false
}
```

---

## **POST /login**

**Body Parameters**:

- `username` (String, optional): Username of the user.
- `email` (String, optional): Email of the user.
- `mobile` (String, optional): Mobile number of the user.
- `password` (String, required): Password of the user.

**Response**:

```json
{
  "message": "Log in successful",
  "success": true,
  "userToken": "abc123",
  "user": {}
}
```

---

## **POST /otp/get**

**Body Parameters**:

- `email` (String, optional): Email of the user.
- `mobile` (String, optional): Mobile number of the user.
- `isMobile` (Boolean, optional): Indicates if the contact is a mobile number.

**Response**:

```json
{
  "message": "Otp sent",
  "success": true
}
```

---

## **POST /otp/verify**

**Body Parameters**:

- `otp` (String, required): OTP to verify.
- `contact` (String, required): Contact with which to verify.

**Response**:

```json
{
  "message": "OTP verified",
  "success": true,
  "otpToken": "xyz789"
}
```

---

## **POST /signup/create-password**

**Body Parameters**:

- `password` (String, required): Password for the new account.
- `otpToken` (String, required): OTP token received from `/otp/verify`.

**Response**:

```json
{
  "message": "Sign up successful",
  "success": true,
  "userToken": "abc123",
  "user": {}
}
```

---

## **POST /profile**

**Body Parameters**:

- `fullName` (String, required): Full name of the user.
- `username` (String, required): Desired username.
- `profileImageUrl` (String, optional): URL of the profile image.
- `dob` (Number, optional): Date of birth as a timestamp.
- `about` (String, required): Short description about the user.

**Response**:

```json
{
  "message": "Profile created",
  "success": true,
  "user": {
    "id": "12345",
    "fullname": "John Doe",
    "profileImageUrl": "https://example.com/image.jpg",
    "about": "A short bio",
    "dob": 1609459200
  }
}
```

---

## **GET /profile**

**Query Parameters**:

- `profileId` (String, required): ID of the profile to fetch.

**Response**:

```json
{
  "message": "Profile found",
  "success": true,
  "profile": {
    "id": "12345",
    "fullname": "John Doe",
    "username": "johndoe",
    "profileImageUrl": "https://example.com/image.jpg",
    "about": "A short bio",
    "followers": 100,
    "following": 50,
    "storyCount": 10,
    "forumsCount": 20
  }
}
```

---

## **GET /profile/story**

**Query Parameters**:

- `profileId` (String, optional): ID of the profile to fetch.
- `offset` (Number, optional): How many you have got from server

**Response**:

```json
{
  "message": "Stories of the user",
  "success": true,
  "nextOffset": 10,
  "endOfUserStories": true,
  "stories": [
    {
      "id": "1",
      "localId": "local123",
      "title": "Story Title",
      "body": "This is the body of the story.",
      "caption": "A caption",
      "category": "Fiction",
      "genre": "Drama",
      "color": "#FFFFFF",
      "backgroundImageId": "image123",
      "alignment": 0
    }
  ]
}
```

---

## **GET /profile/forums**

**Query Parameters**:

- `profileId` (String, optional): ID of the profile to fetch.
- `offset` (Number, optional): How many you have got from server

**Response**:

```json
{
  "message": "Forums of the user",
  "success": true,
  "nextOffset": 10,
  "endOfUserStories": true,
  "forums": [
    {
      "id": "1",
      "title": "Forum Title",
      "body": "This is the body of the forum.",
      "imageUrl": "https://example.com/image.jpg",
      "createDate": 1609459200,
      "updateDate": 1609459200,
      "isVoted": true
    }
  ]
}
```

---

## **GET /profile/me**

**Response**:

```json
{
  "message": "Your Profile",
  "success": true,
  "profile": {
    "id": "12345",
    "fullname": "John Doe",
    "username": "johndoe",
    "profileImageUrl": "https://example.com/image.jpg",
    "about": "A short bio",
    "followers": 100,
    "following": 50,
    "storyCount": 10,
    "forumsCount": 20
  }
}
```

---

## **POST /school**

**Body Parameters**:

- A list of college objects with fields:
  - `collegeId` (String): ID of the college.
  - `degreeId` (String): ID of the degree.
  - `fieldId` (String): ID of the field.
  - `description` (String): Description of the college.
  - `startYear` (Number): Start year.
  - `endYear` (Number): End year.

**Response**:

```json
{
  "message": "College added",
  "success": true
}
```

---

## **GET /news**

**Query Parameters**:

- `category` (String, optional, default="All"): Category of news to fetch.
- `timestamp` (Number, optional): Fetch news newer than this timestamp.

**Response**:

```json
{
  "message": "News",
  "success": true,
  "news": [
    {
      "id": "1",
      "title": "Breaking News",
      "body": "This is the body of the news.",
      "imageUrl": "https://example.com/image.jpg",
      "category": "Politics",
      "newsUrl": "https://example.com/news",
      "timeStamp": 1609459200
    }
  ]
}
```

---

## **GET /forums**

**Query Parameters**:

- `timestamp` (Number, optional): Fetch forums newer than this timestamp.

**Response**:

```json
{
  "message": "Forums",
  "success": true,
  "forums": [
    {
      "id": "1",
      "title": "Forum Title",
      "body": "This is the body of the forum.",
      "imageUrl": "https://example.com/image.jpg",
      "createDate": 1609459200,
      "updateDate": 1609459200,
      "writer": {
        "profileId": "12345",
        "fullname": "John Doe",
        "about": "A short bio",
        "profileImageUrl": "https://example.com/image.jpg",
        "username": "johndoe"
      },
      "isVoted": true
    }
  ]
}
```

---

## **POST /forums**

**Body Parameters**:

- `localId` (String, optional): Local ID of the forum.
- `title` (String, required): Title of the forum.
- `body` (String, required): Body of the forum.
- `imageUrl` (String, optional): URL of the image.

**Response**:

```json
{
  "message": "Forum Created",
  "success": true,
  "forum": {
    "id": "1",
    "localId": "local123",
    "title": "Forum Title",
    "body": "This is the body of the forum.",
    "imageUrl": "https://example.com/image.jpg",
    "createDate": 1609459200,
    "updateDate": 1609459200,
    "writer": {
      "profileId": "12345",
      "fullname": "John Doe",
      "about": "A short bio",
      "profileImageUrl": "https://example.com/image.jpg",
      "username": "johndoe"
    }
  }
}
```

---

## **POST /forums/upvote**

**Body Parameters**:

- `forumId` (String, required): ID of the forum.
- `value` (Boolean, required): `true` for upvote, `false` for downvote.

**Response**:

```json
{
  "message": "Voted",
  "success": true
}
```

---

## **GET /forums/comments**

**Query Parameters**:

- `forumId` (String, required): ID of the forum.
- `timestamp` (Number, optional): Fetch comments newer than this timestamp.

**Response**:

```json
{
  "message": "Comments",
  "success": true,
  "comments": [
    {
      "id": "asdf",
      "postId": "1",
      "commentId": "2",
      "body": "This is a comment.",
      "createDate": 1609459200,
      "writer": {
        "profileId": "12345",
        "fullname": "John Doe",
        "about": "A short bio",
        "profileImageUrl": "https://example.com/image.jpg",
        "username": "johndoe"
      }
    }
  ]
}
```

---

## **POST /forums/comments**

**Body Parameters**:

- `body` (String, required): Body of the comment.
- `forumId` (String, required): ID of the forum.
- `localId` (String, optional): Local ID of the comment.

**Response**:

```json
{
  "message": "Commented",
  "success": true,
  "comment": {
    "id": "1",
    "postId": "2",
    "localId": "local123",
    "body": "This is a comment.",
    "createDate": 1609459200,
    "writer": {
      "profileId": "12345",
      "fullname": "John Doe",
      "about": "A short bio",
      "profileImageUrl": "https://example.com/image.jpg",
      "username": "johndoe"
    }
  }
}
```

---

## **POST /upload**

**Body Parameters**:

- `file` (File, required): File to upload.

**Response**:

```json
{
  "message": "File Uploaded",
  "success": true,
  "fileUrl": "/uploads/filename.jpg"
}
```

---

## **POST /story**

**Body Parameters**:

- `content` (Object, required):
  - `title` (String, required): Title of the story.
  - `body` (String, required): Body of the story.
  - `caption` (String, optional): Caption for the story.
- `categorization` (Object, required):
  - `category` (String, required): Category of the story.
  - `genre` (String, optional): Genre of the story.
- `decoration` (Object, required):
  - `color` (String, optional): Text color.
  - `backgroundColor` (String, optional): Background color.
  - `backgroundImageId` (String, optional): ID of the background image.
  - `alignment` (Number, optional): Alignment (0 for left, 1 for center).

**Response**:

```json
{
  "message": "Story Created",
  "success": true,
  "story": {
    "id": "1",
    "localId": "local123",
    "title": "Story Title",
    "body": "This is the body of the story.",
    "caption": "A caption",
    "category": "Fiction",
    "genre": "Drama",
    "color": "#FFFFFF",
    "backgroundImageId": "image123",
    "alignment": 0,
    "writer": {
      "profileId": "12345",
      "fullname": "John Doe",
      "about": "A short bio",
      "profileImageUrl": "https://example.com/image.jpg",
      "username": "johndoe"
    }
  }
}
```

---

## **GET /story**

**Query Parameters**:

- `timestamp` (Number, optional): Fetch stories newer than this timestamp.

**Response**:

```json
{
  "message": "Stories",
  "success": true,
  "stories": [
    {
      "id": "1",
      "title": "Story Title",
      "body": "This is the body of the story.",
      "caption": "A caption",
      "category": "Fiction",
      "genre": "Drama",
      "color": "#FFFFFF",
      "backgroundImageIndex": 0,
      "alignment": 0,
      "createDate": 1609459200,
      "updateDate": 1609459200,
      "writer": {
        "profileId": "12345",
        "fullname": "John Doe",
        "about": "A short bio",
        "profileImageUrl": "https://example.com/image.jpg",
        "username": "johndoe"
      },
      "likedByUser": true
    }
  ]
}
```

---

## **POST /story/like**

**Body Parameters**:

- `storyId` (String, required): ID of the story.

**Response**:

```json
{
  "message": "Liked",
  "success": true
}
```

---

## **GET /story/comments**

**Query Parameters**:

- `storyId` (String, required): ID of the story.
- `timestamp` (Number, optional): Fetch comments newer than this timestamp.

**Response**:

```json
{
  "message": "Comments",
  "success": true,
  "comments": [
    {
      "id": "1",
      "postId": "2",
      "localId": "local123",
      "body": "This is a comment.",
      "createDate": 1609459200,
      "writer": {
        "profileId": "12345",
        "fullname": "John Doe",
        "about": "A short bio",
        "profileImageUrl": "https://example.com/image.jpg",
        "username": "johndoe"
      }
    }
  ]
}
```

---

## **POST /story/comments**

**Body Parameters**:

- `body` (String, required): Body of the comment.
- `storyId` (String, required): ID of the story.
- `localId` (String, optional): Local ID of the comment.

**Response**:

```json
{
  "message": "Commented",
  "success": true,
  "comment": {
    "id": "1",
    "postId": "2",
    "localId": "local123",
    "body": "This is a comment.",
    "createDate": 1609459200,
    "writer": {
      "profileId": "12345",
      "fullname": "John Doe",
      "about": "A short bio",
      "profileImageUrl": "https://example.com/image.jpg",
      "username": "johndoe"
    }
  }
}
```

---

Based on the provided content, here are the endpoints that were missing from the previous API documentation:

---

## **POST /admin/news**

**Description**:It requires you to be **admin** to post news

```
ADMIN USERNAME: admin
ADMIN PASSWORD: admin
```

**Body Parameters**:

- `title` (String, required): Title of the news.
- `body` (String, required): Body of the news.
- `imageUrl` (String, optional): URL of the image.
- `category` (String, required): Category of the news.
- `newsUrl` (String, optional): URL of the full news article.

**Response**:

```json
{
  "message": "News created",
  "success": true,
  "news": {
    "id": "1",
    "title": "Breaking News",
    "body": "This is the body of the news.",
    "imageUrl": "https://example.com/image.jpg",
    "category": "Politics",
    "newsUrl": "https://example.com/news",
    "timeStamp": 1609459200
  }
}
```

---

## **GET /test**

**Description**: Returns the user object referenced to the session ID.  
**Requires**: User must be logged in (`loggedIn` middleware).

**Response**:

```json
{
  "user": {
    "profileId": "12345",
    "fullname": "John Doe",
    "about": "A short bio",
    "profileImageUrl": "https://example.com/image.jpg"
  }
}
```

---

## **GET /reload-website**

**Description**: Reloads the website by pulling the latest commit.  
**Note**: Only for development purposes.

**Response**:

```text
Restarting....
```

---

## **GET /delete-user**

**Query Parameters**:

- `email` (String, optional): Email of the user to delete.
- `mobile` (String, optional): Mobile number of the user to delete.

**Description**: Deletes a user account. If both `email` and `mobile` are provided, `email` takes precedence.

**Response**:

```json
{
  "message": "Deletion Successful",
  "success": true
}
```

OR

```json
{
  "message": "No user like that to delete",
  "success": false
}
```

---
