# -*- coding: utf-8 -*-
import os, shutil, csv, ogr

aos = {}
munsInfos = {}
reader = csv.reader(open('ao-input/2013-12-12-comagri-communes-aires-ao.csv', 'rb'), delimiter=';')
reader.next()
for line in reader:
  ida = line[5]
  insee = line[0]
  # in othe datasets, insee code has 5 characters, so we normalize
  if len(insee)==4: insee = '0'+insee
  # updating some insee codes
  for new,olds in [['89068',['89185','89258','89305']], ['71270',['71260']]]:
    if insee in olds:
      print('Warning: obsolete insee code found '+insee+', replaced by the actual one '+new)
      insee = new
  ao = {'ida':ida, 'name':line[4], 'muns':[]}
  if ida in aos.keys(): ao = aos[ida]
  else: aos[ida] = ao
  ao['muns'].append({'insee':insee, 'name':line[2]})
  munInfos = []
  if insee in munsInfos: munInfos = munsInfos[insee]
  else: munsInfos[insee] = munInfos
  munInfos.append(ao)
                
# Open the municipalities boundaries shapefile
shpDriver = ogr.GetDriverByName("ESRI Shapefile")
munsDatasource = shpDriver.Open('communes/communes-fla250.shp')
munsLayer = munsDatasource.GetLayer()

# Create a shp for writing the areas
if os.path.exists('ao-shp'): shutil.rmtree('ao-shp')
os.mkdir('ao-shp')
aoShp = shpDriver.CreateDataSource('ao-shp/ao.shp')
aoLayer = aoShp.CreateLayer('areas', srs=munsLayer.GetSpatialRef(), geom_type=ogr.wkbPolygon)
# the properties of the features of the new shp file
for fieldName,fieldType in [['insee',ogr.OFTString],['Name',ogr.OFTString],['ida',ogr.OFTString],['aire',ogr.OFTString]]:
  fd = ogr.FieldDefn(fieldName,fieldType)
  aoLayer.CreateField(fd)
for index in xrange(munsLayer.GetFeatureCount()):
  # create the feature
  feature = munsLayer.GetFeature(index)
  insee = feature.GetFieldAsString('insee')
  if insee in munsInfos:
    for munInfos in munsInfos[insee]:
      newFeature = ogr.Feature(aoLayer.GetLayerDefn())
      newFeature.SetField('insee', insee)
      newFeature.SetField('Name', 'TODO')
      newFeature.SetField('ida', munInfos['ida'])
      newFeature.SetField('aire', munInfos['name'])
      newFeature.SetGeometry(feature.GetGeometryRef())
      # add the feature in the shp
      if aoLayer.CreateFeature(newFeature) != 0:
        print("error in feature creation")
      # storing features for later json writing
      aoFeatures = aos[munInfos['ida']].get('features')
      if aoFeatures == None:
        aoFeatures = []
        aos[munInfos['ida']]['features'] = aoFeatures
      aoFeatures.append(newFeature)
# need to reset the variable for commiting the records      
aoShp = None

# Now, writing the geojson files
if os.path.exists('ao-json'): shutil.rmtree('ao-json')
os.mkdir('ao-json')

geojsonDriver = ogr.GetDriverByName('GeoJSON')
filesList = []
jsonAreasCentersDataSource = geojsonDriver.CreateDataSource('ao-json/centers.json')
jsonAreasCenters = jsonAreasCentersDataSource.CreateLayer("areas", srs=munsLayer.GetSpatialRef(), geom_type=ogr.wkbPoint)
areas=[]
for fieldName,fieldType in [['ida',ogr.OFTString],['nom',ogr.OFTString],['superficie',ogr.OFTString]]:
  fd = ogr.FieldDefn(fieldName,fieldType)
  jsonAreasCenters.CreateField(fd)
for ida,ao in aos.iteritems():
  aoName = ao['name'].decode("ISO-8859-1")
  jsonDataSource = geojsonDriver.CreateDataSource('ao-json/'+ida+'.json')
  filesList.append([aoName,ida,'ao-json/'+ida+'.json'])
  aoLayerJson = jsonDataSource.CreateLayer("areas", srs=munsLayer.GetSpatialRef(), geom_type=ogr.wkbPolygon)
  if 'features' in ao:
    # build the centroid
    enveloppe = ao['features'][0].geometry()
    for feature in ao['features'][1:]: enveloppe = enveloppe.Union(feature.geometry())
    feature = ogr.Feature(jsonAreasCenters.GetLayerDefn())
    feature.SetField('ida', ida)
    feature.SetField('nom', aoName.encode('utf-8'))
    feature.SetField('superficie', enveloppe.GetArea())
    areas.append(enveloppe.GetArea())
    feature.SetGeometry(enveloppe.Centroid())
    jsonAreasCenters.CreateFeature(feature)
    # add the polygons
    for feature in ao['features']:
      aoLayerJson.CreateFeature(feature)
jsonAreasCentersDataSource = None

import json
with open('ao-json/index.txt', 'w') as outfile:
  json.dump(filesList, outfile)
