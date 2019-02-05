# BE2-NC-Knews Sprint 

Northcoders News API Server

### Getting Started

Follow these instructions to get a copy of this server running on your local machine. See deployment for notes on how to deploy the project on a live server.

### Prerequisities

```
1) git clone - https://github.com/MandSolo/backend-nck.git

2) cd into the cloned directory on your machine

3) npm install - install all dependencies (Node, NPM, PostgreSQL)
```

### Running server in Development

First, you must make a config file in order to connect to the database. In order to do this, you will need to create a knexfile file and input the required information.

```
npm run create:config
```

(See https://knexjs.org/#Installation-node for more information.)

Once this is done, run the following commands:

```
npm create:db
npm run devseed:run
npm run dev
```

### Deployment

N/A

### Built With

Node
Express
Knex
PostgreSQL

### Contributing Author
Mand Cashin - www.githun.co.uk

### License
Northcoders

### Acknowledgements
Northcoders Tutors