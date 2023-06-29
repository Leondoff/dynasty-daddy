# Dynasty Daddy

*This project is currently in Beta and is deployed to https://dynasty-daddy.com.*

Dynasty Daddy is a web app that integrates with fantasy platform APIs and scrapes fantasy market (KeepTradeCut, FantasyCalc, DynastyProcess, DynastySuperflex) player evaluations to create metrics on each owner's fantasy league (Sleeper, MFL, Fleaflicker, ESPN, FFPC).

## Goal

The goal is to provide users with a frictionless way to see player value, team value, draft breakdowns, and more. When managing my teams, I constantly had to switch between multiple websites to figure out what moves I should make. I wanted to find a way to spend less time researching and leverage the data in more ways than before. Thus Dynasty Daddy was born to help me beat my friends in fantasy easier!

### Supported Platforms

| Platform | <img src="https://play-lh.googleusercontent.com/Ox2yWLWnOTu8x2ZWVQuuf0VqK_27kEqDMnI91fO6-1HHkvZ24wTYCZRbVZfRdx3DXn4=w480-h960-rw" alt="Sleeper" title="Sleeper" width="50px"/> | <img src="http://myfantasyleague.com/images/mfl_logo/updates/new_mfl_logo_80x80.gif" alt="MyFantasyLeague" title="MyFantasyLeague" width="50px"/> | <img src="https://d1h60c43tcq0zx.cloudfront.net/static/images/icons/apple-touch-icon-f3d0ad2586e334ad16152ed2ea83733c.png" alt="Fleaflicker" title="Fleaflicker" width="50px"/> | <img src="https://espnpressroom.com/us/files/2018/03/App-Icon-iOS-mic-flag-cut-to-shape.png" alt="ESPN" title="ESPN" width="50px"/> | <img src="https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/28/c1/ba/28c1baf1-b1b1-f3c1-e5fe-185b41eff3b9/AppIcon-1x_U007emarketing-0-7-85-220.png/492x0w.webp" alt="FFPC" title="FFPC" width="50px"/> |
| --- | --- | --- | --- | --- | --- |
| Power Rankings | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Playoff Calculator | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Trade Finder | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Standings | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Trade Calculator | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Player Values | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Player Comparison | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Positional Statistics | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Team Pages | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Player Pages | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Mock Draft Tool | &#x2714; | &#x2714; | &#x2714; | &#x274C; | &#x2714; |
| Draft Recap | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Portfolio | &#x2714; | &#x2714; | &#x2714; | &#x274C; | &#x274C; |
| Username Login | &#x2714; | &#x2714; | &#x2714; | &#x274C; | &#x2714; |
| League Id Login | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Transactions | &#x2714; | &#x2714; | &#x2714; | &#x274C; | &#x274C; |
| Future Draft Capital | &#x2714; | &#x2714; | &#x2714; | &#x274C; | &#x2714; |
| Wrapped | &#x2714; | &#x2714; | &#x2714; | &#x2714; | &#x2714; |
| Automated Id Mapping | &#x2714; | &#x2714; | &#x274C; | &#x274C; | &#x274C; |


## Architecture

Dynasty Daddy's front end is an angular 14 web application with a node express API connected to a Postgres database. This database is populated using a Python cron job that scrapes fantasy trade values & player rankings once a day. For the fantasy platform's data, we use their public APIs found in their documentation.

## How to run locally

Requirements:

- npm
- Node
- Postgres

First, you can clone the repo and open it up in your preferred IDE.

### Database

- Run scripts in the `/back-end/database/scripts` directory to create a database and insert data.

###  Front End

1. Navigate to the front-end project directory `/front-end/fantasy-app/`
2. Run `npm install` and `npm run start` and the front end should spin up.

### API

1. Navigate to the project directory `/back-end/express-api`
2. Copy the `.env.example` file renaming it to just `.env`. Then update the `CONNECTION_STRING` to point to the local DB containing the data.
3. Now, run `npm install` and `npm run start` and the api should spin up.



## Future Improvements

- Support other platforms like Yahoo, NFL, etc.
- Machine learning on data to predict the best players to buy and sell.
- Better draft predictor based on team needs
- More team analytics
- Better responsive/mobile experience
- More Fantasy Markets

## Packages

- ng2-charts - chart.js with angular 11
- Angular mat - for tables, and other styling components
- javascript-color-gradient - color gradients
- simple-statistics - statistics and probability calculations
- angular2-query-builder - query builder for player comparison advanced search
- ngx-device-detector - detects if using a mobile device, tablet, or desktop
- ngx-mat-select-search - custom mat select search box with a dropdown
- ngx-google-analytics - used to track user metadata and build reports on features
- @thouet/material-carousel - responsive carousels for ads

## Deployment
- CI/CD using GitHub Actions to build and push images to docker hub when a PR to main is created.
- The project is deployed on a DigitalOcean Ubuntu Droplet and uses docker-compose to spin up images.
- Watchtower monitors changes to Docker Hub and pulls new images every 30 seconds and redeploys them.

## Credits

Jeremy Timperio - Creator, Full Stack Developer

### Support Me Here
<a href="https://twitter.com/DynastyDaddyff"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter"/></a>
<a href="https://discord.gg/SJJuQBJqda"><img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Join Community Badge"/></a>
<a href="https://www.youtube.com/channel/UC9SOfhKyR3MQj8xB778rhnA/featured"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Subscribe"/></a>
<a href="https://www.buymeacoffee.com/jertimperio"><img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Support"/></a>
<a href="https://www.linkedin.com/in/jmtimper/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>



### Development Status

<a href="https://github.com/jmtimper/dynasty-daddy/stargazers"><img src="https://img.shields.io/github/stars/jmtimper/dynasty-daddy" alt="Stars Badge"/></a>
<a href="https://github.com/jmtimper/dynasty-daddy/network/members"><img src="https://img.shields.io/github/forks/jmtimper/dynasty-daddy" alt="Forks Badge"/></a>
<a href="https://github.com/jmtimper/dynasty-daddy/pulls"><img src="https://img.shields.io/github/issues-pr/jmtimper/dynasty-daddy" alt="Pull Requests Badge"/></a>
<a href="https://github.com/jmtimper/dynasty-daddy/issues"><img src="https://img.shields.io/github/issues/jmtimper/dynasty-daddy" alt="Issues Badge"/></a>
<a href="https://github.com/jmtimper/dynasty-daddy/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/jmtimper/dynasty-daddy?color=2b9348"></a>
