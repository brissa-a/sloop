# DEV
## requirement
vscode

node -v
v20.10.0

docker -v
Docker version 24.0.6, build ed223bc

pnpm -v
9.1.1

## run the back first
pnpm install
pnpm db:start #run the pg container
pnpm db:rmm #reset migrate mock the database

## then the front
pnpm install
pnpm dev

# deploy to scaleway

## requirement
docker -v
Docker version 24.0.6, build ed223bc

scw version
Version    2.30.0
BuildDate  unknown
GoVersion  go1.22.2
GitBranch  unknown
GitCommit  unknown
GoArch     arm64
GoOS       darwi

## TODO once
scw init
docker login rg.fr-par.scw.cloud/funcscwsloopol2h4rnr -u nologin --password-stdin <<< "MY_SCRET"
## setup postgresql
in [IAM](https://console.scaleway.com/iam/users) create an application

in [SQL Databases](https://console.scaleway.com/serverless-db) create a database with PostgreSQL-16 engine
generage a secret key to use to get the connexion string to set in production .env


## setup / deploy back
docker build -t sloop-express:latest -t rg.fr-par.scw.cloud/funcscwsloopol2h4rnr/sloop-express:latest -f Back.Dockerfile .

docker push rg.fr-par.scw.cloud/funcscwsloopol2h4rnr/sloop-express:latest

scw container container deploy eee3bada-c034-421c-b5f8-274a18b07d55

https://sloopol2h4rnr-sloop-express-dev.functions.fnc.fr-par.scw.cloud

## setup /  deploy front
docker build -t sloop-vite:latest -t rg.fr-par.scw.cloud/funcscwsloopol2h4rnr/sloop-vite:latest -f Front.Dockerfile .

docker push rg.fr-par.scw.cloud/funcscwsloopol2h4rnr/sloop-vite:latest

scw container container deploy a8bb360d-0214-4750-b91c-a2cc477a8a26

https://sloopol2h4rnr-sloop-vite-dev.functions.fnc.fr-par.scw.cloud

# Core model
- Voting (aka: Scrutin)
    - owned by
        - Admins
        - Captains of the group
        - Presiders of the meeting it's attached to if so
        - direct Voting owner
    - related models: Vote, Choice, Score, Copyvote

- Meeting (aka: Réunion)
     - owned by
        - Admins
        - Captains of the group
        - Presider
    - related models: Invitee, Attendee, Message, PointAgenda

- Proposal (aka: Motion)
    - owned by
        - Admins
        - Captains of the group
        - Authors and co-Authors
    - related models: 

- Group   (aka: Équipe/Équipage)
    - owned by
        - Admins
        - Captains of the group
    - related models: GroupMembership, Copyvote

- User (aka: Utilisateur)
    - owned by
        - Admins
        - Themself (of course)
    - related model: Related to almost al other models

# tips

linter add eslint plugin and setting var like follow
"editor.defaultFormatter": "dbaeumer.vscode-eslint"
"editor.formatOnSave": true