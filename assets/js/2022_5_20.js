function heart_2022_5_20() {
    window.onerror = function () {
        location.reload();
    }

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    docHeight = $(document).height() - margin.left - margin.right,
    docWidth = $(document).width() - margin.top - margin.bottom;

    var minSize = Math.min(500, (docWidth - 40), (docHeight - 40)),
    width = minSize,
    height = minSize;

    //Create the datapoints with x en y positions for the circles
    //Formula from http://mathworld.wolfram.com/HeartCurve.html
    var x, y;
    var data = [];
    for (var i = 0; i < 350; i++) {
    x = 16 * Math.pow(Math.sin(i), 3);
    y = 13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i)
    data[i] = [x, y];
}//for i

    // sort data
    var data_sort = [];
    data_sort[0] = data[0];
    data.splice(0, 1);
    var cur_pt = data_sort[0];
    var cur_vec = [0, 2];
    for (let i = 1; i < 175; i++) {
    let min_step = 1000000;
    let min_index = 0;
    if (!data)
    continue
    for (let j = 0; j < data.length; j++) {
    let temp_vec = [data[j][0] - cur_pt[0], data[j][1] - cur_pt[1]];
    let dis = (data[j][0] - cur_pt[0]) * (data[j][0] - cur_pt[0]) + (data[j][1] - cur_pt[1]) * (data[j][1] - cur_pt[1]);
    if (dis < min_step && (temp_vec[0] * cur_vec[0] + temp_vec[1] * cur_vec[1]) > 0) {
    min_step = dis;
    min_index = j;
}
}
    cur_vec = [data[min_index][0] - cur_pt[0], data[min_index][1] - cur_pt[1]];
    data_sort[i] = data[min_index];
    cur_pt = data[min_index];
}
    for (let i = 175; i < 350; i++) {
    data_sort[i] = [-data_sort[349 - i][0], data_sort[349 - i][1]]
}

    //Scales
    var xScale = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[0];
}), d3.max(data, function (d) {
    return d[0];
})])
    .range([0, width]);

    var xScale2 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[0];
}) * 0.6, d3.max(data, function (d) {
    return d[0];
}) * 0.6])
    .range([0, width]);

    var xScale3 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[0];
}) * 0.75, d3.max(data, function (d) {
    return d[0];
}) * 0.75])
    .range([0, width]);

    var xScale4 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[0];
}) * 2.5, d3.max(data, function (d) {
    return d[0];
}) * 2.5])
    .range([0, width]);

    var xScale5 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[0];
}) * 0.1, d3.max(data, function (d) {
    return d[0];
}) * 0.1])
    .range([0, width]);

    var xScale6 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[0];
}) * 4, d3.max(data, function (d) {
    return d[0];
}) * 4])
    .range([0, width]);

    var yScale = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[1];
}), d3.max(data, function (d) {
    return d[1];
})])
    .range([height, 0]);

    var yScale2 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[1];
}) * 0.6, d3.max(data, function (d) {
    return d[1];
}) * 0.6])
    .range([height, 0]);

    var yScale3 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[1];
}) * 0.75, d3.max(data, function (d) {
    return d[1];
}) * 0.75])
    .range([height, 0]);

    var yScale4 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[1];
}) * 2.5, d3.max(data, function (d) {
    return d[1];
}) * 2.5])
    .range([height, 0]);

    var yScale5 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[1];
}) * 0.1, d3.max(data, function (d) {
    return d[1];
}) * 0.1])
    .range([height, 0]);

    var yScale6 = d3.scale.linear()
    .domain([d3.min(data, function (d) {
    return d[1];
}) * 6, d3.max(data, function (d) {
    return d[1];
}) * 6])
    .range([height, 0]);

    //Initiate the SVG
    var chart = d3.select('#chart')
    .append('svg')
    .attr('width', docWidth)
    .attr('height', docHeight)
    .attr('class', 'chart')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("display", "block")
    .style("margin-left", "auto")
    .style("margin-right", "auto");

    //Initiate the group that will hold all the dots and lines
    var svg = chart.append('g')
    .attr('transform', 'translate(' + (docWidth / 2 - width / 2) + ',' + (docHeight / 2 - height / 2) + ')')
    .attr('width', width)
    .attr('height', height);

    //Create the dots that make the heart

    function heart_beat() {
    let c_count = 0;
    svg.selectAll("circle.heartbeat").transition()
    .attr("cx", function (d, i) {
    return xScale2(d[0]);
})
    .attr("cy", function (d, i) {
    return yScale2(d[1]);
})
    .attr("r", 28)
    .duration(1000)
    .style("fill", "#FFC0CB")
    .style("opacity", 0.2)
    .transition()
    .duration(400)
    .attr("cx", function (d, i) {
    return xScale3(d[0]);
})
    .attr("cy", function (d) {
    return yScale3(d[1]);
})
    .attr("r", 10)
    .style("fill", "#FF69B4")
    .style("opacity", 0.5)
    .each("end", function () {
    c_count += 1;
    if (c_count === 350) {
    heart_beat();
}
});
}

    var circle_count = 0;
    var dots = svg.append("g").selectAll("circle.heartbeat")
    .data(data_sort)
    .enter().append("circle")
    .attr("class", "heartbeat")
    .style("opacity", 0)
    .style("fill", "#FF69B4")
    .attr("cx", function (d, i) {
    return xScale(d[0]);
})
    .attr("cy", function (d) {
    return yScale(d[1]);
})
    .attr("r", 2)
    .transition()
    .duration(100)
    .delay(function (d, i) {
    return i * 10;
})
    .style("opacity", 1)
    .each("end", function () {
    circle_count += 1;
    if (circle_count === 350) {
    heart_beat();
}
});

    let l_c_count = 0;
    svg.selectAll("circle.laser")
    .data(data_sort)
    .enter().append("circle")
    .attr("class", "laser")
    .style("opacity", 1)
    .style("fill", "#FA8072")
    .attr("cx", function (d, i) {
    return xScale4(d[0]);
})
    .attr("cy", function (d) {
    return yScale4(d[1]);
})
    .attr("r", 10)
    .transition()
    .duration(1000)
    .attr("cx", function (d, i) {
    return xScale5(d[0]);
})
    .attr("cy", function (d) {
    return yScale5(d[1]);
})
    .attr("r", 4)
    .style("opacity", 0.2)
    .each("end", function () {
    l_c_count += 1;
    if (l_c_count === 350) {
    setTimeout(shootlaser, 2000);
}
});

    let fl_c_count = 0;
    svg.selectAll("circle.fast_laser")
    .data(data_sort)
    .enter().append("circle")
    .attr("class", "fast_laser")
    .style("opacity", 1)
    .style("fill", "#9400D3")
    .attr("cx", function (d, i) {
    return xScale6(d[0]);
})
    .attr("cy", function (d) {
    return yScale6(d[1]);
})
    .attr("r", 2)
    .transition()
    .duration(1000)
    .attr("cx", function (d, i) {
    return xScale5(d[0]);
})
    .attr("cy", function (d) {
    return yScale5(d[1]);
})
    .attr("r", 4)
    .style("opacity", 0.2)
    .each("end", function () {
    fl_c_count += 1;
    if (fl_c_count === 350) {
    setTimeout(shootfastlaser, Math.random() * 13333);
}
});

    function shootfastlaser() {
    let laser_count = 0;
    svg.selectAll("circle.fast_laser")
    .style("opacity", 1)
    .style("fill", "#9400D3")
    .attr("cx", function (d, i) {
    return xScale6(d[0]);
})
    .attr("cy", function (d) {
    return yScale6(d[1]);
})
    .attr("r", 2)
    .transition()
    .duration(1000)
    .attr("cx", function (d, i) {
    return xScale5(d[0]);
})
    .attr("cy", function (d) {
    return yScale5(d[1]);
})
    .attr("r", 4)
    .style("opacity", 0.2)
    .each("end", function () {
    laser_count += 1;
    if (laser_count === 350) {
    setTimeout(shootfastlaser, Math.random() * 13333);
}
});
}

    function shootlaser() {
    let laser_count = 0;
    svg.selectAll("circle.laser")
    .style("opacity", 1)
    .style("fill", "#FF6347")
    .attr("cx", function (d, i) {
    return xScale4(d[0]);
})
    .attr("cy", function (d) {
    return yScale4(d[1]);
})
    .attr("r", 10)
    .transition()
    .duration(1000)
    .attr("cx", function (d, i) {
    return xScale5(d[0]);
})
    .attr("cy", function (d) {
    return yScale5(d[1]);
})
    .attr("r", 4)
    .style("opacity", 0.2)
    .each("end", function () {
    laser_count += 1;
    if (laser_count === 350) {
    setTimeout(shootlaser, 1500 + Math.random() * 1000);
}
});
}

    //Create and draw the path that connects the dots
    //From: http://stackoverflow.com/questions/13893127/how-to-draw-a-path-smoothly-from-start-point-to-end-point-in-d3-js
    var line = d3.svg.line()
    .interpolate('linear')
    .x(function (d) {
    return xScale(d[0])
})
    .y(function (d) {
    return yScale(d[1])
});

    var path = svg.append("g").append("path")
    .attr("d", line(data))
    .style("stroke", "#FF0000")
    .style("stroke-width", 1)
    .style("opacity", 0.4)
    .style("fill", "none");

    var totalLength = path.node().getTotalLength();
    path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(6e4).delay(500)
    .ease("linear")
    .attr("stroke-dashoffset", 0);

    //text
    txt = ["Love", "&#128151;", "兜兜"]
    svg.selectAll("text")
    .data(txt)
    .enter().append("text")
    .attr("x", function (d, i) {
    return 150 + i * 100;
})
    .attr("y", 240)
    .html(d => d)
    .style("fill", "#8A0707")
    .style("font-size", "28px")
    .style("opacity", 0.9)
    .style("text-anchor", "middle")
    .style("opacity", 0)
    .transition()
    .duration(5000)
    .delay(function (d, i) {
    return i * 5000;})
    .style("opacity", 1)
}
