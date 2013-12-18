# -*- coding: utf-8 -*-
import os, shutil, csv, ogr

aos = {}
munsInfos = {}
for line in csv.reader(open('ao-input/2013-12-12-comagri-communes-aires-ao.csv', 'rb'), delimiter=';'):
  ida = line[5]
  insee = line[0]
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
#aoLayer = aoShp.CreateLayer('areas', srs=munsLayer.GetSpatialRef(), geom_type=ogr.wkbPolygon)
aoLayer = aoShp.CreateLayer('areas', geom_type=ogr.wkbLineString)
# Create a geojson file for writing the areas
geojsonDriver = ogr.GetDriverByName('GeoJSON')
aoJson = geojsonDriver.CreateDataSource('ao.json')
# FIXME AttributeError: 'NoneType' object has no attribute 'CreateLayer'
#aoLayerJson = aoJson.CreateLayer("areas", srs=munsLayer.GetSpatialRef(), geom_type=ogr.wkbPolygon)
# the properties of the features of the new shp file
properties = ogr.FeatureDefn()
properties.AddFieldDefn(ogr.FieldDefn('insee'))
properties.AddFieldDefn(ogr.FieldDefn('name'))
properties.AddFieldDefn(ogr.FieldDefn('ida', ogr.OFTStringList))
properties.AddFieldDefn(ogr.FieldDefn('aires', ogr.OFTStringList))
# FIXME the produced shp file contains 0 features!
for index in xrange(munsLayer.GetFeatureCount()):
  # create the feature
  feature = munsLayer.GetFeature(index)
  newFeature = ogr.Feature(properties)
  insee = feature.GetFieldAsString('insee')
  newFeature.SetField('insee', insee)
  newFeature.SetField(1, 'TODO')
  if insee in munsInfos:
    munInfos = munsInfos[insee]
    newFeature.SetFieldStringList(2, [x['ida'] for x in munInfos])
    newFeature.SetFieldStringList(3, [x['name'] for x in munInfos])
  newFeature.SetGeometry(feature.GetGeometryRef())
  # add the feature in the shp and the geojson layers
  if aoLayer.CreateFeature(newFeature) != 0:
    print("error in feature creation")
  #aoLayerJson.CreateFeature(newFeature)

