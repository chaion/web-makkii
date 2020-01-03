const size_map = {
    1: 140,
    2: 100,
    3: 80,
    4: 70,
    5: 60
};
/*const color_map = {
    1: "#d6e4ff",
    2: "#efdbff",
    3: "#bae7ff",
    4: "#efdbff",
    5: "#ffd6e7"
};*/
const same_color = '#e8e8e8';
const color_map = {
    1: same_color,
    2: same_color,
    3: same_color,
    4: same_color,
    5: same_color
};
let width = document.documentElement.clientWidth;
let height = 1250;
let root;
let force = d3.layout.force()
    .size([width - 60, height])
    .on("tick", tick);

let svg = d3.select("body #force-tree-graph")
    .style("width", width)
    .attr("height", height);
let link = svg.selectAll(".link");
let   node = svg.selectAll(".node");
let json_cache = null;
d3.json("../force-tree-graph.json", function(error, json) {
    if (error) throw error;
    root = json;
    json_cache = json;
    update();
});

function update() {
    let nodes = flatten(root),
        links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .linkDistance(120)
        .charge(-2000)
        .gravity(0.15)
        .start();

    // Update the links…
    link = link.data(links, function(d) { return d.target.id; });
    // Exit any old links.
    link.exit().remove();

    // Enter any new links.
    link.enter().append("line")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // Update the nodes…
    node = node.data(nodes, function(d) { return d.id; }).style("fill", color);

    // Exit any old nodes.
    node.exit().remove();

    // Enter any new nodes.
    const g = node.enter()
        .append('g')
        .attr("class", "node")
        .attr('width', function (d) {
            return size_map[d.type];
        })
        .attr('height', function (d) {
            return size_map[d.type];
        })
        .attr("transform", function(d) {
            return "translate(" + (d.x - (size_map[d.type] * 0.5)) + "," + (d.y - (size_map[d.type] * 0.5)) + ")";
        })
        .on("click", click)
        .call(force.drag)
        .attr('style', function (d) {
            return `cursor: ${d.url ? 'pointer' : 'default'};`;
        });
    g.append('foreignObject')
        .attr('width', function (d) {
            return size_map[d.type]
        })
        .attr('height', function (d) {
            return size_map[d.type]
        })
        .append(function (d) {
            const div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
            div.setAttribute('style', `background-color: ${color_map[d.type]}`);
            div.innerText = d.name;
            div.setAttribute('title', d.url || '');
            div.setAttribute('class', 'circle');
            return div
        });
}

function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) {
        return "translate(" + (d.x - (size_map[d.type] * 0.5)) + "," + (d.y - (size_map[d.type] * 0.5)) + ")";
    })
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
    return color_map[d.type];
}

// Toggle children on click.
function click(d) {
    if (!d3.event.defaultPrevented) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        if(d.url) window.open(d.url)
    }
}

function flatten(root) {
    let nodes = [], i = 0;
    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
    }

    recurse(root);
    return nodes;
}

let timer = null;

const onresize_fun = function(){
    if(!json_cache) return;
    width = document.documentElement.clientWidth;
    if(width < 1200) width = 1200;
    force = d3.layout.force()
        .size([width - 60, height])
        .on("tick", tick);

    let svg = d3.select("body #force-tree-graph")
        .style("width", width)
        .attr("height", height);
    link = svg.selectAll(".link");
    node = svg.selectAll(".node");
    update();
    if(timer) clearTimeout(timer)
};

window.onresize = function () {
    if(timer) clearTimeout(timer);
    timer = setTimeout(onresize_fun, 1000)
};
