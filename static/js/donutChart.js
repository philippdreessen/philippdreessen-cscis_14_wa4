'use strict';

// IIFE
(function () {

    // Init data
    let data = [];

    let data_old=[]

    // Fetch json data
    d3.json('/load_data', (d) => {

        return d;
    }).then((d) => {

        // Redefine data
        data = d['users'];

        createVisDonut();
        createVisBar();
        createVisScatter();
    }).catch((err) => {

        console.error(err);
    });


    /*
     Function :: createVis()
     */
     //Function to create donut chart
    function createVisDonut() {

        // Get svg
        const svg = d3.select('#donutChart');

        // Config
        const margin = {'top': 25, 'right': 10, 'bottom': 50, 'left': 10};
        const width = +svg.attr('width') - (margin.right + margin.left);
        const height = +svg.attr('height') - (margin.top + margin.bottom);
        const radius =  Math.min(width, height) / 2

        // Create and position container
        const container = svg.append('g')
            .attr('class', 'container')
            .attr('id', 'donutchart_group')
            .style('transform', `translate(${width/2+margin.left}px, ${height/2+margin.top}px)`)
            ;

        //creating the language map`
        var langMap = d3.nest()
          .key(function(d) { return d.prog_lang; })
          .rollup(function(v) { return v.length; })
          .object(data);

        //calculating the pie
        var pie = d3.pie()
          .value(function(d) {return d.value; })
        var data_ready = pie(d3.entries(langMap))



        // color scale:
        var color = d3.scaleOrdinal()
        .range(['#1b7688','#1b7676','#f9d057','#f29e2e','#9b0a0a', '#d7191c']);

        //Creating the arc elements
        const arcs = container.selectAll('.arc')
            .data(data_ready)
            .enter()
            .append('g')
            .attr('class', 'arc');

        //creating the arcs
        arcs.append('path')
          .attr('d', d3.arc()
          .innerRadius(80)         // This is the size of the donut hole
          .outerRadius(radius))
          .attr('fill', function(d){ return(color(d.data.key)) })

          //on mouseover add info in donut hole
          .on('mouseover', function (d) {
                  d3.select(this)
                  .attr('fill', 'rgba(128, 128, 128, 1')
                  .attr('d', d3.arc()
                  .innerRadius(70)         // This is the size of the donut hole
                  .outerRadius(radius));

                  svg.append("text")
                  .attr("class", "name-text")
                  .attr("id", "donut_center_name")
                  .text(`${d.data.key}`)
                  .attr('text-anchor', 'middle')
                  .style('transform', `translate(${width/2+margin.left}px, ${height/2+margin.top-10}px)`)

                  svg.append("text")
                  .attr("class", "name-text")
                  .attr("id", "donut_center_nr")
                  .text(`${d.data.value}`)
                  .attr('text-anchor', 'middle')
                  .style('transform', `translate(${width/2+margin.left}px, ${height/2+margin.top+10}px)`)

                  //updateOnDonut(d.data.key);
          })

          .on('click', function (d) {
                  updateOnDonut(d.data.key);
          })

          //on mouseout remove details from donut hole and return barchart/scatterplot to normal state
          .on('mouseout', function () {
              d3.select(this)
                  .attr('fill', function(d){ return(color(d.data.key)) })
                  .attr('d', d3.arc()
                  .innerRadius(80)         // This is the size of the donut hole
                  .outerRadius(radius));

              d3.select('#donut_center_name').remove();
              d3.select('#donut_center_nr').remove();
          });
    }


    //Function to create scatter plot
    function createVisScatter() {

        // Get svg
        const svg = d3.select('#scatter');

        // Config
        const margin = {'top': 10, 'right': 10, 'bottom': 30, 'left': 30};
        const width = +svg.attr('width') - (margin.right + margin.left);
        const height = +svg.attr('height') - (margin.top + margin.bottom);

        // Create and position container
        const container = svg.append('g')
            .attr('class', 'container')
            .attr('id', 'scatterplot_group')
            .style('transform', `translate(${margin.left}px, ${margin.top}px)`);

        //Set ageMap
        const experience_yr = data.map(function (d, i) {
            return d.experience_yr;
        });

        //Set ageMap
        const hw1_hrs = data.map(function (d, i) {
            return d.hw1_hrs;
        });

        //adding the number of occurences to the array
        var arrayLength = data.length;
        for (var i = 0; i < arrayLength; i++) {
          var occ = data.filter(function (e) {
            return  e.experience_yr > data[i].experience_yr-1&&
                    e.experience_yr < data[i].experience_yr+1&&
                    e.hw1_hrs > data[i].hw1_hrs-1&&
                    e.hw1_hrs < data[i].hw1_hrs+1;

          }).length;
            data[i]["occ"] = occ;
        }


        // Add X axis
        var x = d3.scaleLinear()
          .domain([0, d3.max(experience_yr)])
          .range([ 0, width -margin.right-margin.left]);

        container.append("g")
          .style('transform', `translate(${margin.left+10}px, ${height-20}px)`)
          .call(d3.axisBottom(x));


        // Add x-label
        container.append('text')
              .style('transform', `translate(${(width+margin.left)/2}px, ${height+15}px)`)
              .attr('text-anchor', 'middle')
              .text('Years of Experience');


        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(hw1_hrs)])
            .range([height-margin.top-margin.bottom, 0]);

        container.append("g")
          .style('transform', `translate(${margin.left}px, ${margin.top}px)`)
          .call(d3.axisLeft(y));

        // Add y-label
        container.append('text')
            .style('transform', `translate(${margin.left/3}px, ${(height+margin.top)/2}px) rotate(270deg)`)
            //.style('transform', `rotate(90deg)`)
            .attr('text-anchor', 'middle')
            .text('Hours on HW1');


        //adding dots on scatterplot

        var dots=container.append('g')
            .style('transform', `translate(${margin.left+10}px, ${margin.top}px)`)
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d, data) { return x(d.experience_yr); } )
            .attr("cy", function (d) { return y(d.hw1_hrs); } )
            .attr("r", function (d) { return 1.5*d.occ; })
            .style("fill", "#69b3a2")


        //Function to highlight brushed dots on scatterplot
        function highlightBrushedCircles() {
              if (d3.event.selection != null) {
                  // revert circles to initial style
                  dots.attr("class", "non_brushed")
                  dots.style("fill","#69b3a2")

                  var brush_coords = d3.brushSelection(this);

                  // style brushed circles
                  dots.filter(function (){
                             var cx = d3.select(this).attr("cx"),
                                 cy = d3.select(this).attr("cy");
                             return isBrushed(brush_coords, cx, cy);
                         })
                         .attr('class' ,'brushed')
                         .style("fill", "#FF5733");
              }
          }

          var brush = d3.brush()
                        .on("brush", highlightBrushedCircles)
                        .on("end", updateDash);

          //extracting data from brushed dots and running functions to update bar and donut chart
          function updateDash() {
                // disregard brushes w/o selections
                // ref: http://bl.ocks.org/mbostock/6232537
                if (!d3.event.selection) return;

                // programmed clearing of brush after mouse-up
                // ref: https://github.com/d3/d3-brush/issues/10
                d3.select(this).call(brush.move, null);

                var d_brushed =  d3.selectAll(".brushed").data();

                var exp_map=d_brushed.map(function (d, i) {
                    return d.experience_yr;
                });

                var hw1_hr_map=d_brushed.map(function (d, i) {
                    return d.hw1_hrs;
                });

                //extracting information for data filter
                var exp_min=d3.min(exp_map)
                var exp_max=d3.max(exp_map)
                var hw1_min=d3.min(hw1_hr_map)
                var hw1_max=d3.max(hw1_hr_map)

                //update bar chart and donut chart based on sccatter selection
                updateOnScatter(exp_min,hw1_min,exp_max,hw1_max);
            }

            //appending box for brush
            container.append("g")
              .style('transform', `translate(${margin.left+10}px, ${margin.top}px)`)
              .call(brush);

            function isBrushed(brush_coords, cx, cy) {
                  var x0 = brush_coords[0][0],
                      x1 = brush_coords[1][0],
                      y0 = brush_coords[0][1],
                      y1 = brush_coords[1][1];
                 return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
             }
    }


    //Function to draw Bar char
    function createVisBar() {

        // Get svg
        const svg = d3.select('#barChart');

        // Config
        const margin = {'top': 25, 'right': 10, 'bottom': 50, 'left': 10};
        const width = +svg.attr('width') - (margin.right + margin.left);
        const height = +svg.attr('height') - (margin.top + margin.bottom);

        // Create and position container
        const container = svg.append('g')
            .attr('class', 'container')
            .attr('id', 'barchart_group')
            .style('transform', `translate(${margin.left}px, ${margin.top}px)`);

        // Set ageMap
        const ageMap = data.map(function (d, i) {
            return d.age;
        });

        // X Scale
        const scX = d3.scaleLinear()
            .domain(d3.extent(ageMap, (d) => {
                return d;
            }))
            .range([0, width]);

        // Histogram and bins
        const histogram = d3.histogram()
            .domain(scX.domain())
            .thresholds(scX.ticks(10));

        const bins = histogram(ageMap);

        // Y Scale
        const scY = d3.scaleLinear()
            .domain([0, d3.max(bins, function (d) {
                return d.length;
            })])
            .range([0, height]);

        // Create bars
        const bars = container.selectAll('.bar')
            .data(bins)
            .enter()
            .append('g')
            .attr('class', 'bar')
            .attr('bar_nr', (d, i) =>{return i})
            .style('transform', (d, i) => {
                return `translate(${i * Math.floor(width / bins.length)}px, ${height - scY(d.length)}px)`;
            });

        // Create rects
        bars.append('rect')
            .attr('width', () => {
                return Math.floor(width / bins.length);
            })
            .attr('height', (d) => {
                return scY(d.length);
            })
            .attr('fill', 'rgba(127, 0, 0, 1)')
            .attr('bar_nr', (d, i) =>{return i})
            .on('mouseover', function () {
                var this_bar= d3.select(this)
                    .attr('fill', 'rgba(223, 0, 0, 1')
            })

            //onclick refresh image with selected subset of data
            .on('click', function () {
                var this_bar= d3.select(this)
                    var bar_nr=d3.select(this).attr("bar_nr")
                    var extent=d3.extent(bins[bar_nr])
                    updateOnBar(extent[0],extent[1]);

            })

            //This function is only necessary to restore the original data if the data changes on mouseover. Currently it's set to onclick.
            .on('mouseout', function () {
                var this_bar=d3.select(this)
                    .attr('fill', 'rgba(127, 0, 0, 1');
                //returnOnBar(data_old);

            });

        // Add y-label
        const yLabels = bars.append('text')
            .text(function (d) {
                return d.length;
            })
            .attr('class', 'yLabel')
            .attr('y', -5)
            .attr('x', Math.floor(width / bins.length) / 2)
            .attr('text-anchor', 'middle');

        // Add x-axis
        const xAxis = container.append('g')
            .attr('class','xAxis')
            .attr('transform', `translate(0, ${height + 5})`)
            .call(d3.axisBottom(scX).ticks(5));

        // Add x-label
        container.append('text')
            .attr('transform', `translate(${width/2}, ${height + 45})`)
            .attr('text-anchor', 'middle')
            .text('Age');
    }


    ///////////////////////////////////////////////////////////////////////
    ////////////BELOW FUNCIONS FOR DYNAMIC UPDATE TO CHARTS////////////////
    ///////////////////////////////////////////////////////////////////////

    //Functions that dynamically update the charts based on donut selection
    function updateOnDonut(lang) {
        data_old = data;

        //Filtering data for charts based on selection
        data = data.filter(function (el) {
          return el.prog_lang === lang;
        });

        //removing old charts
        const barchart_group = d3.select('#barchart_group')
        barchart_group.remove();

        const scatterplot_group=d3.select('#scatterplot_group')
        scatterplot_group.remove();

        createVisBar();
        createVisScatter();
      }

    //function to restore to default data after mouseout on donut
    function returnOnDonut(data_old) {
        data = data_old;


        const barchart_group = d3.select('#barchart_group')
        barchart_group.remove();

        const scatterplot_group=d3.select('#scatterplot_group')
        scatterplot_group.remove();

        createVisBar();
        createVisScatter();
      }


      //Functions that dynamically update the charts based on bar chart selection
      function updateOnBar(lower, upper) {
          data_old = data;

          //Filtering data for charts based on selection
          data = data.filter(function (el) {
            return el.age >= lower&&
            el.age <= upper;
          });

          //removing old charts
          const donutchart_group = d3.select('#donutchart_group')
          donutchart_group.remove();

          const scatterplot_group=d3.select('#scatterplot_group')
          scatterplot_group.remove();

          //recreating charts
          createVisDonut();
          createVisScatter();
        }


        //function to restore to default data after mouseout on bar.
        function returnOnBar(data_old) {
            data = data_old;

            const donutchart_group = d3.select('#donutchart_group')
            donutchart_group.remove();

            const scatterplot_group=d3.select('#scatterplot_group')
            scatterplot_group.remove();

            //recreating charts
            createVisDonut();
            createVisScatter();

          }

          //Functions that dynamically updates the charts based on scatter plot selection
          function updateOnScatter(lower_yr,lower_hr,upper_yr,upper_hr) {
              data_old = data;

              //Filtering data for charts based on selection
              data = data.filter(function (el) {
                return  el.experience_yr >= lower_yr &&
                        el.experience_yr <= upper_yr &&
                        el.hw1_hrs >= lower_hr &&
                        el.hw1_hrs <= upper_hr;

              });

              //removing old charts
              const barchart_group = d3.select('#barchart_group')
              barchart_group.remove();

              const donutchart_group=d3.select('#donutchart_group')
              donutchart_group.remove();

              //recreating charts with new data
              createVisBar();
              createVisDonut();
            }




})();
