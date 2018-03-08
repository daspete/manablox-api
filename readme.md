# manablox-api

This is a nodejs API built on adonisjs for a headless-cms system


## Requirements

- nodejs > 8
- mySQL > 5.7


## Installation

- clone this repo in your project folder
- install yarn with ``` npm install -g yarn```
- install dependencies with ``` yarn ``` then upgrade them with ``` yarn upgrade ```
- create an .env file (you'll find an .env.example file in the root folder) and configure everything you need, like db connection data
- install adonisjs cli with ``` npm install -g @adonisjs/cli ```
- start the database migration with ``` adonis migration:run ```
- seed the default database datas with ``` adonis seed ```
- start the manablox-api with ``` adonis serve ```


## Going further

we have a web app for using and building your api, have a look at [manablox-api-builder](https://github.com/daspete/manablox-api-builder)
