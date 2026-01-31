// Stacked Area Chart (All Grades Avg, Regular Avg, Midgrade Avg)
const svg = d3.select('#chart'),
  margin = { top: 30, right: 60, bottom: 60, left: 70 },
  W = +svg.attr('width') - margin.left - margin.right,
  H = +svg.attr('height') - margin.top - margin.bottom;

const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const tooltip = d3.select('#tooltip');

// ✅ UPDATED CSV PATH — using GitHub RAW
d3.csv("https://raw.githubusercontent.com/ruthvikbairaboina/sdv-project-data/refs/heads/main/PET_PRI_GND_DCUS_NUS_W.csv", (d) => {
  const parsed = { Date: d3.timeParse('%m/%d/%Y')(d.Date) };
  Object.keys(d).forEach((k) => {
    if (k !== 'Date') parsed[k] = +d[k];
  });
  return parsed;
}).then((data) => {

  data.forEach((d) => {
    d.AllAvg = (d.A1 + d.A2 + d.A3) / 3;
    d.RegAvg = (d.R1 + d.R2 + d.R3) / 3;
    d.MidAvg = (d.M1 + d.M2 + d.M3) / 3;
  });

  const keys = ['AllAvg', 'RegAvg', 'MidAvg'];

  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#1f77b4', '#ff7f0e', '#2ca02c']);

  const stack = d3.stack().keys(keys);
  const series = stack(data);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.Date))
    .range([0, W]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
    .nice()
    .range([H, 0]);

  g.append('g').call(d3.axisLeft(y).ticks(6));
  g.append('g')
    .attr('transform', `translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(8));

  const area = d3.area()
    .x(d => x(d.data.Date))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    .curve(d3.curveMonotoneX);

  const groups = g.selectAll('g.layer')
    .data(series)
    .join('g')
    .attr('class', 'layer');

  groups.append('path')
    .attr('d', d => area(d))
    .attr('fill', d => color(d.key))
    .attr('opacity', 1);

  const legend = d3.select('#legend');
  keys.forEach(k => {
    legend.append('button')
      .attr('data-key', k)
      .style('border-left', `6px solid ${color(k)}`)
      .text(k)
      .on('click', (event) => {
        const key = event.currentTarget.getAttribute('data-key');
        const active = d3.select(event.currentTarget).classed('active');

        d3.selectAll('#legend button').classed('active', false);

        if (!active) {
          d3.select(event.currentTarget).classed('active', true);
          groups.selectAll('path').attr('opacity', d => d.key === key ? 1 : 0.12);
        } else {
          groups.selectAll('path').attr('opacity', 1);
        }
      });
  });

  svg.on('mousemove', (event) => {
    const [mx] = d3.pointer(event, g.node());
    const x0 = x.invert(mx);
    const bisect = d3.bisector(d => d.Date).left;
    const i = bisect(data, x0);
    const d0 = data[Math.max(0, Math.min(i, data.length - 1))];

    tooltip.style('opacity', 1)
      .html(`
        ${d3.timeFormat('%Y-%m-%d')(d0.Date)}<br>
        AllAvg: ${d0.AllAvg.toFixed(3)}<br>
        RegAvg: ${d0.RegAvg.toFixed(3)}<br>
        MidAvg: ${d0.MidAvg.toFixed(3)}
      `)
      .style('left', event.pageX + 12 + 'px')
      .style('top', event.pageY - 40 + 'px');
  })
  .on('mouseout', () => tooltip.style('opacity', 0));

  svg.append('text')
    .attr('x', margin.left + W / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text('Stacked Area Chart of U.S. Gasoline Price Averages');

  svg.append('text')
    .attr('x', margin.left + W / 2)
    .attr('y', margin.top + H + 40)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Weekly Timeline');

  svg.append('text')
    .attr('x', -(margin.top + H / 2))
    .attr('y', 18)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Price (Dollars per Gallon)');
});
