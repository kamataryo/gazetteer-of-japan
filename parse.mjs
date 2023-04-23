import fs from 'fs/promises'
import Papa from 'papaparse'


const main = async () => {
  const csv = await fs.readFile('./data/gaze.csv', 'utf-8')
  const { data } = Papa.parse(csv, { header: true })

  const features = []
  for (const item of data) {
    const {
      Grid: grid,
      'Japanese(Kanji)': name,
      'Japanese(Kana)':kana,
      'Romanized Japanese': roman,
      Latitude: latInDegree,
      Longitude: lngInDegree,
      Classification: cls,
    } = item
    const [lat, lng] = [latInDegree, lngInDegree].map(v => {
      const [d, m] = v.replace("'").split('°').map(val => parseInt(val, 10))
      return d + m / 60
    })



    const geojson = {
      type: 'Feature',
      properties: { grid, name, kana, roman, class: cls },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      }
    }
    features.push(geojson)
  }

  await Promise.all([
    fs.writeFile('./data/gaze.geojson', JSON.stringify({
    type: "FeatureCollection",
    features,
  }, null, 2)),
    fs.writeFile('./docs/gaze.geojson', JSON.stringify({
    type: "FeatureCollection",
    features: features.map(feature => {
      feature.properties.title = feature.properties.name
      return feature
    }),
  }, null, 2))
  ])
}
main()
