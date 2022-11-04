# paint
In this game, you battle against 5 other teams to cover the board with your colour.

Live version (main branch): https://paint.authorises.repl.co

## Setting up a server
#### You will need NodeJS

Firstly `clone` the repo and get it running with `node .`

### Dependencies

 -  express 4.18.1
 -  node-fetch 3.2.6
 -  socket.io 4.5.2
 -  unique-username-generator "^1.1.

Now you will need a recaptcha token, you can read this here https://cloud.google.com/recaptcha-enterprise/docs/create-key to make a key. Then you will need to make a `.env` file and put CAPTCHA=YOUR_CAPTCHA_KEY and you will also need to go into the frontend `frontend.js` file and replace the token with your public token. It will look something like this:

```
grecaptcha.enterprise.execute('6LddcH0iAAAAAL0VZq3yeOm2Bvo9vGOioMX5qRGh', {action: 'login'}).then(function(token) {
   socket.emit("auth", token)
});
```

You then need to go into the frontend `index.html` file and where it has the script tag for recaptcha 

*It should look like this*
```
  <script src="https://www.google.com/recaptcha/enterprise.js?render=6LddcH0iAAAAAL0VZq3yeOm2Bvo9vGOioMX5qRGh"></script>
```
You will need to also replace it with your public token. You should then be good to go.

## Contributing

I am open to any contributions, just make a pull request in detail of what you are adding/doing.
