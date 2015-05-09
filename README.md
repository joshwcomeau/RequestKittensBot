RequestKittens Bot
==========

This bot interfaces with [the RequestKittens API](https://github.com/joshwcomeau/RequestKittens) to deliver cat pics through twitter. Simply tweet at its handle (@requestkittens) and mention a valid cat emotion like 'happy' or 'angry'. It'll reply with a delightful little cat picture.


###Stack
This bot is super simple: Built in node, the entire bot is a 270-line annotated JS file (index.js). I use lodash for convenience, an ES6 promises polyfill, the Twitter NPM package, and a few other helper libraries.




Note to self: This bot is running on my DigitalOcean droplet, under the non-root user 'reqkit'. To deploy, SSH in as root, *su* to change user, cd into ~/RequestKittensBot, and do a git pull. Then, to start it, use forever. First, run *forever list* to see which spot it's in, *forever stop N* to stop it, and finally *forever start index.js*.