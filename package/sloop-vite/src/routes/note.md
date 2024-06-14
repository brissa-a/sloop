    Here / Not here
    - subscription to meeting event
    Here during the meeting / Not here during the meeting
    - Presence[meetingId, userId, markedAt] marked when ? when subscribing and meeting is started, on meeting start
    Convoqués / Visiteurs
    - Convoqués[meetingId, userId, emailSentAt]
    Identifié / Anonyme
    -  subscription as a jwt
    
    Visiteur X never been there => impossible un visiteur est forcément passé au moins une fois dans la réunion
    Convoqué X anonyme => impossible un convoqué est forcément identifié
    Anonyme X Convoqué => impossible un anonyme est forcément un visiteur


how much precision required ?
100 personne
qui délégue 1% de leurs pouvoiir aux 100 autres ?

0.01^100

# TODO once
scw init
docker login rg.fr-par.scw.cloud/funcscwsloopol2h4rnr -u nologin --password-stdin <<< "d4164619-6cdc-4dae-949e-f910db9262d6"


docker run -p 80:80 sloop-vite:latest

docker build -t sloop-vite:latest -t rg.fr-par.scw.cloud/funcscwsloopol2h4rnr/sloop-vite:latest -f Front.Dockerfile .
docker push rg.fr-par.scw.cloud/funcscwsloopol2h4rnr/sloop-vite:latest
scw container container deploy a8bb360d-0214-4750-b91c-a2cc477a8a26
https://sloopol2h4rnr-sloop-vite-dev.functions.fnc.fr-par.scw.cloud

docker run -p 80:3000 sloop-vite:latest

docker build -t sloop-express:latest -t rg.fr-par.scw.cloud/funcscwsloopol2h4rnr/sloop-express:latest -f Back.Dockerfile .
docker push rg.fr-par.scw.cloud/funcscwsloopol2h4rnr/sloop-express:latest
scw container container deploy eee3bada-c034-421c-b5f8-274a18b07d55
https://sloopol2h4rnr-sloop-express-dev.functions.fnc.fr-par.scw.cloud


User
    Inline    @slug, popover summary
    Miniature @slug, pic, name, popover summary
    Summary   @slug, pic, name, membership, activity stats
    Page

Meeting
    Inline    #slug popoversummary