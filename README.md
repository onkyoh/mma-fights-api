# MMA Fight Cards API #

## Introduction

This is an API that scrapes data from Tapology.com for upcoming MMA events. The purpose of this API, although free to be used by anyone, Is meant to accompony a website im making which while display the data in a clear and easy to understand format. This website provides a solution to fight fans who would otherwise need to navigate the websites of several organizations and view cluttered UIs in attempt to find simple information.

The API is currently hosted on Adaptable.io at https://mmafightcardsapi.adaptable.app.

## Technology

The API uses the following technologies:

- MongoDB for database management
- Puppeteer for web scraping
- Adaptable.io for hosting
- Express for the server

## Data

### /cards

The `/cards` endpoint returns an array of the next 5 upcoming MMA events from major organizations. Each event object contains the following parameters:

- `date`: the date of the event
- `name`: the name of the event
- `fights`: an array containing several fight objects

Each fight object contains the following parameters:

- `main`: a boolean indicating whether the fight is on the main card or not
- `fighterA`: an object containing the following parameters:
  - `name`: the name of the fighter
  - `link`: a link to the fighter's profile on Tapology
  - `last5`: an array containing the fighter's last 5 results
- `fighterB`: an object containing the same parameters as `fighterA`


## Contributing ## 

If anyone who sees this wants to add features simply make a request.
