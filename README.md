
# Fully Hatter の秘密の部屋
This is the website for Fully Hatter based on pure [Node.js](https://nodejs.org) **without** [Express](https://expressjs.com/).

## writing
- 評価制度について


## TODO
- Fully Hatter へのむちゃぶり
- mongoDB
    - refactoring (add method for db connection)
    - add comments(real data)
    - backup
- error handling (try catch)
    - error html
    - rock db
- make [掲示板] page
- make [Fully Hatter の本棚] page
- links
    - http://www.kt.rim.or.jp/~hisashim/gabriel/WorseIsBetter.ja.html
    - https://postd.cc/the-best-programming-language-or-how-to-stop-worrying-and-love-the-code/


## After production
- scripts for local (ssh, install git)
- setup production env (AWS)
    - create db setting file
    - logging
    - npm scripts for automation (init node & db & git, start db & service)
    - scripts (production init)
        - install git
        - git clone
        - install node
        - npm install
        - install rethinkdb
        - install python driver
    - setup mail
    - forever
    - DNS setting
    - implement [auto translation]
    - check on PC, Android and iOS
    - check whether all mustache template tags work correctly
    - redirect
    - view setting (google search result)
    - view setting (for Twitter share)
    - view setting (for Facebook share)
- Express, mongoose
- add some games (like FFT ? React, Vue)


## Memo
ssh 160.16.127.75
