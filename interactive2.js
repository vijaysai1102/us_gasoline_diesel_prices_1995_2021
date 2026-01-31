// Parallel Coordinates (interactive highlighting on legend)

// Unique variable names to avoid conflicts with interactive1.js
const svg2 = d3.select('#pc'),
  width2 = +svg2.attr('width') - 140,
  height2 = +svg2.attr('height') - 60,
  margin2 = { top: 20, right: 40, bottom: 20, left: 40 };

const g2 = svg2
  .append('g')
  .attr('transform', `translate(${margin2.left},${margin2.top})`);

const tooltip2 = d3.select('#tooltip2');

// Load CSV
d3.csv(
  "https://raw.githubusercontent.com/ruthvikbairaboina/sdv-project-data/refs/heads/main/PET_PRI_GND_DCUS_NUS_W.csv",
  (d) => {
    const parsed = { Date: d3.timeParse('%m/%d/%Y')(d.Date) };
    Object.keys(d).forEach((k) => {
      if (k !== 'Date') parsed[k] = +d[k];
    });
    return parsed;
  }
).then((data) => {

  const dimensions = [
    'A1','A2','A3',
    'R1','R2','R3',
    'M1','M2','M3',
    'P1','P2','P3',
    'D1'
  ];

  // Scales
  const y2 = {};
  dimensions.forEach((dim) => {
    y2[dim] = d3.scaleLinear()
      .domain(d3.extent(data, (row) => row[dim]))
      .range([height2, 0])
      .nice();
  });

  const x2 = d3.scalePoint()
    .domain(dimensions)
    .range([0, width2])
    .padding(0.5);

  // Background lines
  g2.append('g')
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('d', draw2)
    .attr('stroke', '#eee')
    .attr('fill', 'none');

  // Foreground lines
  const foreground2 = g2.append('g')
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('d', draw2)
    .attr('stroke', '#007bff')
    .attr('stroke-width', 1)
    .attr('fill', 'none')
    .attr('opacity', 0.6)
    .on('mouseover', (event, d) => {
      tooltip2
        .style('opacity', 1)
        .html(`Week: ${d3.timeFormat('%Y-%m-%d')(d.Date)}`)
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px');

      d3.select(event.currentTarget)
        .attr('stroke', '#ff7f0e')
        .attr('stroke-width', 2)
        .attr('opacity', 1);
    })
    .on('mouseout', (event) => {
      tooltip2.style('opacity', 0);
      d3.select(event.currentTarget)
        .attr('stroke', '#007bff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
    });

  // Axes
  const axis2 = g2.selectAll('.dimension')
    .data(dimensions)
    .enter()
    .append('g')
    .attr('class', 'dimension')
    .attr('transform', (d) => `translate(${x2(d)})`);

  axis2.append('g')
    .each(function (d) { d3.select(this).call(d3.axisLeft(y2[d]).ticks(4)); });

  axis2.append('text')
    .attr('y', -9)
    .attr('text-anchor', 'middle')
    .text((d) => d)
    .style('font-weight', '600');

  // LEGEND
  const color2 = d3.scaleOrdinal(d3.schemeCategory10);
  const legend2 = d3.select('#legend2');
  legend2.selectAll('*').remove();

  dimensions.forEach((dim) => {
    legend2.append('button')
      .attr('data-key', dim)
      .style('border-left', `6px solid ${color2(dim)}`)
      .text(dim)
      .on('click', (event) => {

        const key = event.currentTarget.getAttribute('data-key');
        const active = d3.select(event.currentTarget).classed('active');

        d3.selectAll('#legend2 button').classed('active', false);

        // fade all lines
        foreground2.attr('opacity', 0.05);

        if (!active) {
          d3.select(event.currentTarget).classed('active', true);

          const vals = data.map((d) => d[key]).sort((a, b) => a - b);
          const thresh = d3.quantile(vals, 0.9);

          foreground2
            .attr('opacity', (dd) => dd[key] >= thresh ? 1 : 0.1)
            .attr('stroke', (dd) => dd[key] >= thresh ? '#28d7d5' : '#ccc');

          axis2.selectAll('text')
            .style('fill', (d) => (d === key ? '#000' : '#bbb'));

        } else {
          foreground2
            .attr('opacity', 0.6)
            .attr('stroke', '#007bff');

          axis2.selectAll('text').style('fill', '#000');
        }
      });
  });

  function draw2(d) {
    return d3.line()(dimensions.map((p) => [x2(p), y2[p](d[p])]));
  }
});
