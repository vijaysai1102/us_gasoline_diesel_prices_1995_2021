// ===============================
// Multi-Line Chart (A1, R1, M1, D1)
// ===============================

// Unique variables (avoid conflicts)
const svg3 = d3.select('#chart3'),
  width3 = +svg3.attr('width') - 120,
  height3 = +svg3.attr('height') - 80,
  margin3 = { top: 20, right: 60, bottom: 40, left: 70 };

const g3 = svg3
  .append('g')
  .attr('transform', `translate(${margin3.left},${margin3.top})`);

const tooltip3 = d3.select('#tooltip3');

// Load CSV from GitHub RAW
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

  const keys3 = ["A1", "R1", "M1", "D1"];

  const series3 = keys3.map((key) => ({
    key,
    values: data.map((d) => ({
      date: d.Date,
      value: d[key],
    })),
  }));

  const x3 = d3.scaleTime()
    .domain(d3.extent(data, (d) => d.Date))
    .range([0, width3]);

  const y3 = d3.scaleLinear()
    .domain([
      d3.min(series3, (s) => d3.min(s.values, (v) => v.value)),
      d3.max(series3, (s) => d3.max(s.values, (v) => v.value)),
    ])
    .nice()
    .range([height3, 0]);

  const color3 = d3.scaleOrdinal()
    .domain(keys3)
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#9467bd']);

  // Axes
  g3.append('g')
    .attr('transform', `translate(0,${height3})`)
    .call(d3.axisBottom(x3).ticks(10));

  g3.append('g').call(d3.axisLeft(y3));

  // Titles + Labels
  svg3.append('text')
    .attr('x', margin3.left + width3 / 2)
    .attr('y', 16)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text('Multi-Line Chart: A1, R1, M1, D1');

  svg3.append('text')
    .attr('x', margin3.left + width3 / 2)
    .attr('y', height3 + margin3.top + 35)
    .style('text-anchor', 'middle')
    .style('font-size', '13px')
    .text('Date');

  svg3.append('text')
    .attr('transform', `translate(${margin3.left - 50}, ${margin3.top + height3 / 2}) rotate(-90)`)
    .style('text-anchor', 'middle')
    .style('font-size', '13px')
    .text('Price (USD per Gallon)');

  // Gridlines
  g3.append('g')
    .call(d3.axisLeft(y3).tickSize(-width3).tickFormat(''))
    .attr('opacity', 0.08);

  const line3 = d3.line()
    .x((d) => x3(d.date))
    .y((d) => y3(d.value))
    .curve(d3.curveMonotoneX);

  // Draw lines
  const seriesGroup3 = g3.selectAll('.series3')
    .data(series3)
    .enter()
    .append('g')
    .attr('class', 'series3');

  seriesGroup3.append('path')
    .attr('class', 'line3')
    .attr('d', (d) => line3(d.values))
    .attr('stroke', (d) => color3(d.key))
    .attr('stroke-width', 2.2)
    .attr('fill', 'none')
    .attr('opacity', 1);

  // Add circles for hovering
  seriesGroup3.append('g')
    .selectAll('circle')
    .data((d) =>
      d.values.map((v) => ({
        key: d.key,
        date: v.date,
        value: v.value,
      }))
    )
    .enter()
    .append('circle')
    .attr('cx', (d) => x3(d.date))
    .attr('cy', (d) => y3(d.value))
    .attr('r', 2.3)
    .attr('fill', (d) => color3(d.key))
    .attr('opacity', 0.9)
    .on('mouseover', (event, d) => {
      tooltip3
        .style('opacity', 1)
        .html(`<strong>${d.key}</strong><br>${d3.timeFormat('%Y-%m-%d')(d.date)}<br>${d.value}`)
        .style('left', event.pageX + 12 + 'px')
        .style('top', event.pageY - 30 + 'px');
    })
    .on('mouseout', () => tooltip3.style('opacity', 0));

  // Legend (unique: legend3)
  const legend3 = d3.select('#legend3');

  keys3.forEach((k) => {
    legend3.append('button')
      .attr('data-key', k)
      .style('border-left', `6px solid ${color3(k)}`)
      .text(k)
      .on('click', (event) => {

        const key = event.currentTarget.getAttribute('data-key');
        const active = d3.select(event.currentTarget).classed('active');

        d3.selectAll('#legend3 button').classed('active', false);
        d3.selectAll('.line3').attr('opacity', 0.12);
        d3.selectAll('circle').attr('opacity', 0.05);

        if (!active) {
          d3.select(event.currentTarget).classed('active', true);
          d3.selectAll('.line3')
            .filter((d) => d.key === key)
            .attr('opacity', 1)
            .raise();

          d3.selectAll('circle')
            .filter((d) => d.key === key)
            .attr('opacity', 0.9)
            .raise();
        } else {
          d3.selectAll('.line3').attr('opacity', 1);
          d3.selectAll('circle').attr('opacity', 0.9);
        }
      });
  });

});
