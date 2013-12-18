carte-AOP-AOC
=============

Une carte affichant les zones d'AOP et AOC à partir des données publiées sur https://www.data.gouv.fr/fr/dataset/aires-geographiques-des-aoc-aop

Récupération des données
------------------------

    wget -O communes.zip http://osm13.openstreetmap.fr/~cquest/openfla/export/communes-20131218-100m-shp.zip
    mkdir communes
    cd communes
    unzip ../communes.zip

    cd ..
    mkdir ao-input
    cd ao-input
    wget http://new.data.gouv.fr/storage/f/2013-12-16T17%3A27%3A55.394Z/2013-12-12-comagri-communes-aires-ao.csv

Utilisation
-----------

Quand le script fonctionnera, il suffira de faire :
    python buildMapData.py
    