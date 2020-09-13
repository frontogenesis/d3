const dims = { height: 960, width: 960 }
const svg = d3.select('svg')
  .attr('height', dims.height)
  .attr('width', dims.width)

const projection = d3.geoAlbersUsa()
const pathGenerator = d3.geoPath().projection(projection)

const statesG = svg.append('g')
const rainfallG = svg.append('g')

// zoom setup
svg.call(d3.zoom()
.scaleExtent([1,7])
.translateExtent([[0, 0], [dims.width, dims.height]])
.on('zoom', () => {
  statesG.attr('transform', d3.event.transform)
  rainfallG.attr('transform', d3.event.transform)
}))

// data layers to plot
const layers = [d3.json('states-10m.json'), d3.json('ero_day1_topo2.json')]

Promise.all(layers)
  .then(([states, ero]) => {

    const rainfall = topojson.feature(ero, ero.objects['ero_day1']).features
    rainfallG.selectAll('path').data(rainfall)
      .enter().append('path')
        .attr('class', 'rainfall')
        .attr('fill-opacity', 0.5)
        .attr('fill', d => {
          switch (d.properties.OUTLOOK) {
            case 'Marginal (5-10%)':
              return 'green'
            case 'Slight (10-20%)':
              return 'yellow'
            case 'Moderate (20-50%)':
              return 'red'
            case 'High(> 50%)':
              return 'magenta'
            default:
              break
          }
        })
        .attr('d', pathGenerator)
        .append('title')
          .text(d => d.properties.OUTLOOK)

    const stateLines = topojson.feature(states, states.objects.states).features
    statesG.selectAll('path').data(stateLines)
      .enter().append('path')
        .attr('class', 'states')
        .attr('d', pathGenerator)
  })