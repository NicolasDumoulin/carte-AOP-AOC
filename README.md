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

    python buildMapData.py

Le script génère :
 * répertoire ao-shp contenant un fichier au format ESRI ShapeFile
 * un répertoire ao-json contenant un fichier au format GeoJson pour chaque aire
    
Remarques sur le jeu de données
-------------------------------

Les codes INSEE utilisés dans le jeu de données sont obsolètes et sont donc remplacés dans le script par les codes INSEE actuels. Certains codes INSEE semblent dater de 1972, puisque le code "71260" est utilisé dans le fichier et cette commune (Loché) semble avoir été fusionnée en 1972 avec Mâcon d'après http://www.insee.fr/fr/methodes/nomenclatures/cog/fichecommunale.asp?codedep=71&codecom=270

À faire
-------

 * Affichage du nom de la commune et des autres aires éventuellement sur la commune au survol d'une commune affichée
 * L'affichage des limites de toutes les aires n'est pas envisageable, mais il serait possible d'afficher un point pour chaque aire, avec un diamètre proportionnel à la surface de l'aire.
 * Classement des aires par types de produit
 