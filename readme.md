# Startup application

Process of creating a user:

GET /email/verify (query=email) -> OTP on email
POST /email/verify (body=otp) -> OK, DIFF

POST /login/new (body=password,email,username,profile_information) -> OK, logs in
