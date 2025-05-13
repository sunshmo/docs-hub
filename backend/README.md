# docs-hub-backend


**Note** If you want to log in to the system, you need to encrypt the password. You can use `openssl` to generate an `RSA` key pair.
```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```
