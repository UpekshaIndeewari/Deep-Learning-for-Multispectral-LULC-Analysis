// Define ROI
var roi = ee.Geometry.Polygon([
  [
    [80.92045422363337,7.120609533223485],
    [80.92045422363337,7.395791166796324],
    [80.63206311035212,7.395791166796324],
    [80.63206311035212,7.120609533223485]   // Southeast corner
  ]
]);
Map.centerObject(roi, 11);

// Define Landsat collections
var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2');
var l9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2');

// Cloud mask function
function cloudMask(image){
  var qa = image.select('QA_PIXEL');
  var dilated = 1 << 1;
  var cirrus = 1 << 2;
  var cloud = 1 << 3;
  var shadow = 1 << 4;
  var mask = qa.bitwiseAnd(dilated).eq(0)
    .and(qa.bitwiseAnd(cirrus).eq(0))
    .and(qa.bitwiseAnd(cloud).eq(0))
    .and(qa.bitwiseAnd(shadow).eq(0));
  return image.select(['SR_B.*'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'])
    .updateMask(mask)
    .multiply(0.0000275)
    .add(-0.2);
}

// Create image composite
var image = l8.filterBounds(roi).filterDate('2024-01-01', '2024-12-31')
  .merge(l9.filterBounds(roi).filterDate('2024-01-01', '2024-12-31'))
  .map(cloudMask)
  .median()
  .clip(roi);

// Visualize RGB
Map.addLayer(image, {min: [0.1, 0.05, 0.05], max: [0.4, 0.3, 0.2], bands: ['B4', 'B3', 'B2']}, 'Image');
Map.addLayer(image, {bands: ['B5', 'B4', 'B3'], min: 0, max: 0.3}, 'False Color (Vegetation)');
Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'True Color');

// Band map
var bandMap = {
  BLUE: image.select('B2'),
  GREEN: image.select('B3'),
  RED: image.select('B4'),
  NIR: image.select('B5'),
  SWIR1: image.select('B6'),
  SWIR2: image.select('B7')
};

// Add spectral indices
var indices = ee.Image([
  { name: 'EVI', formula: '(2.5 * (NIR - RED)) / (NIR + 6 * RED - 7.5 * BLUE + 1)' },
  { name: 'NBR', formula: '(NIR - SWIR2) / (NIR + SWIR2)' },
  { name: 'NDMI', formula: '(NIR - SWIR1) / (NIR + SWIR1)' },
  { name: 'NDWI', formula: '(GREEN - NIR) / (GREEN + NIR)' },
  { name: 'NDBI', formula: '(SWIR1 - NIR) / (SWIR1 + NIR)' },
  { name: 'NDBaI', formula: '(SWIR1 - SWIR2) / (SWIR1 + SWIR2)' },
].map(function(dict){
  return image.expression(dict.formula, bandMap).rename(dict.name);
}));

// Visualize EVI as an example
Map.addLayer(indices.select('EVI'), {min: -1, max: 1, palette: ['red', 'yellow', 'green']},'EVI');

// Add index & SRTM to image

// Load SRTM DEM
var srtm = ee.Image('USGS/SRTMGL1_003');

// Clip to your ROI (optional but recommended)
var srtm_clipped = srtm.clip(roi);

// Add indices and SRTM as bands to your image
image = image.addBands(indices).addBands(srtm_clipped);

// Updated Classes for your AOI
var classValue = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var classNames = [
  'Built-up',           // 1 – urban areas, roads, settlements
  'Bareland',           // 2 – exposed soil, quarry, sand patches
  'Water',              // 3 – rivers, Victoria Reservoir, small ponds
  'Wetland',            // 4 – marshes, flooded agricultural fields
  'Rice paddy',         // 5 – irrigated or rainfed rice fields
  'Tea plantation',     // 6 – tea estates on slopes
  'Shrubland',          // 7 – dry/wet shrubs
  'Forest',  // 8 – managed forest
  'Other Plantation' // 9 – coconut, or other plantations
];

// Color palette for visualization
var classPalette = [
  'F08080', // Built-up
  'D2B48C', // Bareland
  '87CEFA', // Water
  '008080', // Wetland
  '90EE90', // Rice paddy
  '228B22', // Tea plantation
  '808000', // Shrubland
  '006400', // Forest
  'FF8C00'  // Palm / Other Plantation
];

var columns = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'EVI', 'NBR', 'NDMI', 'NDWI', 'NDBI', 'NDBaI', 'elevation', 'classvalue', 'sample'];
var features = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'EVI', 'NBR', 'NDMI', 'NDWI', 'NDBI', 'NDBaI', 'elevation'];


var built = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([ 80.651611,7.341744]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.653447,7.334869]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.727206,7.276243]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.722136,7.272452]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.853513,7.292286]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.887073,7.327888]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.783346,7.145480]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.771537,7.137630]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.719069,7.144513]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.743222,7.211029]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.738316,7.216777]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.696707,7.246429]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.690709,7.252310]), {classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.828339,7.245223]),{classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.839138,7.240686]),{classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.812863,7.152743]),{classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.785564,7.173861]),{classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.777004,7.176546]),{classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.759753,7.154222]),{classvalue: 1}),
  ee.Feature(ee.Geometry.Point([ 80.749603,7.170192]),{classvalue: 1})
  
]);

// Bareland / exposed soil
var bareland = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.757342,7.160444]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.755574,7.152326]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.762609,7.140452]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.690058,7.163468]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.819629,7.315222]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.758641,7.278593]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.745436,7.263386]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.744962,7.260139]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.722843,7.251959]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.707318,7.249748]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.697535,7.174743]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.878081,7.260712]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.800999,7.168728]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.707362,7.390665]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.699235,7.377612]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.702085,7.378127]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.768047,7.201327]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.761250,7.212434]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.722968,7.131637]), {classvalue: 2}),
  ee.Feature(ee.Geometry.Point([80.700178,7.124448]), {classvalue: 2})
]);

// Water bodies
var water = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.833589,7.195268]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.851030,7.190138]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.878261,7.185383]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.894866,7.191459]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.895335,7.171969]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.910074,7.202376]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.750995,7.251654]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.783027,7.246413]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.763393,7.296870]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.751704,7.273446]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.687191,7.271989]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.643990,7.323564]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.814194,7.350666]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.838553,7.265035]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.887232,7.154519]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.712099,7.171176]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.709079,7.170920]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.717434,7.181523]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.707542,7.193276]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.639595,7.291600]), {classvalue: 3}),
  ee.Feature(ee.Geometry.Point([80.648595,7.311921]), {classvalue: 3})
]);

// Wetlands
var wetland = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.634969, 7.333364]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.633817, 7.338675]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.634482, 7.327016]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.646851, 7.315997]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.654599, 7.298522]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.671907, 7.285260]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.695630, 7.270136]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.709685, 7.272669]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.717232, 7.277665]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.769219, 7.279842]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.635593,7.332458]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.633120, 7.326546]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.650784, 7.324380]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.745643,7.307202]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.751816, 7.310374]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.759584, 7.308567]), {classvalue: 4}),
  ee.Feature(ee.Geometry.Point([80.692241,7.275697]), {classvalue: 4})
  
]);

// Rice paddies
var rice_paddy = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.681112,7.235087]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.6717325,7.242432]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.648697,7.255117]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.644172,7.247964]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.721470,7.190932]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.732726,7.207880]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.739881,7.207922]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.740469,7.212319]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.739052,7.214748]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.735277,7.213256]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.730599,7.212130]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.722503,7.214393]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.731080,7.222451]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.732631,7.312059]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.736233,7.319355]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.870344,7.356192]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.896753,7.379821]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.656092,7.342737]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.916677,7.127713]), {classvalue: 5}),
  ee.Feature(ee.Geometry.Point([80.909956,7.125968]), {classvalue: 5})
]);

// Tea plantations
var tea_plantation = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.886840, 7.127207]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.885823, 7.126858]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.862727, 7.125846]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.852594, 7.129151]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.848794,7.136898]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.848225, 7.141918]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.771718, 7.237513]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.773008, 7.233553]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.768711, 7.242180]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.703828, 7.291655]), {classvalue: 6}),
   ee.Feature(ee.Geometry.Point([80.690502, 7.311353]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.633238, 7.391987]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.658974,7.274197]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.704450, 7.264866]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.641414, 7.124904]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.885823, 7.129842]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.641303, 7.139128]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([880.637359, 7.143450]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.633543, 7.156978]), {classvalue: 6}),
  ee.Feature(ee.Geometry.Point([80.643691, 7.160461]), {classvalue: 6})
]);


// Shrubland
var shrubland = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.902576, 7.295289]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.903794, 7.285697]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.893757, 7.280698]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.874755, 7.337921]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.863983, 77.368312]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.856129, 7.379476]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.808597, 7.377695]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.634953,7.252948]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.640787, 7.219851]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.647770, 7.207118]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.841843,7.123223]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.700838, 7.126268]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.687085, 7.165921]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.659741, 7.220746]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.717686, 7.375312]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.805979, 7.355669]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([0.845289, 7.358313]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.867456, 7.375016]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.917378, 7.392210]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.913645, 7.326966]), {classvalue: 7}),
  ee.Feature(ee.Geometry.Point([80.916788, 7.309383]), {classvalue: 7})
]);

//Forest
var Forest = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.841003, 7.219980]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.865150, 7.197307]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.903395, 7.167803]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.907823, 7.141276]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.832848, 7.129819]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.803397, 7.154516]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.69825, 7.133427]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.640819,7.275511]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.691208,7.376201]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.711005, 7.370225]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.807070, 7.362558]), {classvalue: 8}),
   ee.Feature(ee.Geometry.Point([80.800241,7.270867]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.870973,7.216560]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.655279, 7.224363]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.697644, 7.188076]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.711586, 7.198274]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.892120, 7.225796]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.744036,7.140764]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([80.769765, 7.126671]), {classvalue: 8}),
  ee.Feature(ee.Geometry.Point([880.758873, 7.252916]), {classvalue: 8})
]);

// Other plantation
var other_plantation = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.718427, 7.231848]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.709108, 7.237398]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.707136, 7.235955]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.699999, 7.236685]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.687176, 7.234615]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.686188, 7.235084]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.686422, 7.240304]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.685870, 7.251301]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.689651, 7.263302]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.688587, 7.284853]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.642950, 7.376854]), {classvalue: 9}),
   ee.Feature(ee.Geometry.Point([80.661574, 7.365338]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.662531, 7.316008]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.669926, 7.311982]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.680270, 7.312132]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([880.687164, 7.308474]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.692606, 7.301822]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.6938292, 7.300310]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.882923, 7.292631]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.885677,7.290462]), {classvalue: 9}),
  ee.Feature(ee.Geometry.Point([80.894043,7.291833]), {classvalue: 9})
]);

// Merge all class samples and buffer them
var samples = built
  .merge(bareland)
  .merge(water)
  .merge(wetland)
  .merge(rice_paddy)
  .merge(tea_plantation)
  .merge(shrubland)
  .merge(Forest)
  .merge(other_plantation)
  .map(function(feat){ 
    return feat.buffer(30);  // 30 m buffer around points
  });

// Split samples to train and test per class
samples = ee.FeatureCollection(classValue.map(function(value){
  var features = samples.filter(ee.Filter.eq('classvalue', value)).randomColumn();
  var train = features.filter(ee.Filter.lte('random', 0.8)).map(function(feat){ return feat.set('sample', 'train')});
  var test = features.filter(ee.Filter.gt('random', 0.8)).map(function(feat){ return feat.set('sample', 'test')});
  return train.merge(test);
})).flatten();

// Extract samples
var extract = image.sampleRegions({
  collection: samples,
  scale: 30,
  properties: ['sample', 'classvalue']
});

// Train samples
var train = extract.filter(ee.Filter.eq('sample', 'train'));
print('Train sample size');
var test = extract.filter(ee.Filter.eq('sample', 'test'));
print('Test sample size');

// Export image and samples
Export.image.toDrive({
  image: image.toFloat(),
  scale: 30,
  maxPixels: 1e13,
  region: roi,
  crs: 'EPSG:4326',
  folder: 'DL',
  description: 'Landsat_2024'
});

Export.table.toDrive({
  collection: extract,
  fileFormat: 'CSV',
  selectors: columns,
  description: 'Samples_LC_2024',
  folder: 'DL'
});
