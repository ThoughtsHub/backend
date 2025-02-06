# Startup application

Process of creating a user:

/login/new <- username, email, password
-> OTP on email

/email/verify <- username, otp
-> if correct, verified

/login <- username, password
-> get authentication code
