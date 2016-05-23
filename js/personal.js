$(function() {
  $(window).resize(function() {
    width = $('body').width();
    height = $('body').height();

    $("#playArea").attr({
      'width': width,
      'height': height,
    });

  });
  $(window).resize();
});

/*

The following piece of code to calculate triangulation is pulled from
https://github.com/christopherhesse/delaunay-experiment

*/

function Triangle(a, b, c) {
  this.a = a
  this.b = b
  this.c = c

  var A = b.x - a.x,
    B = b.y - a.y,
    C = c.x - a.x,
    D = c.y - a.y,
    E = A * (a.x + b.x) + B * (a.y + b.y),
    F = C * (a.x + c.x) + D * (a.y + c.y),
    G = 2 * (A * (c.y - b.y) - B * (c.x - b.x)),
    minx, miny, dx, dy

  /* If the points of the triangle are collinear, then just find the
   * extremes and use the midpoint as the center of the circumcircle. */
  if (Math.abs(G) < 0.000001) {
    minx = Math.min(a.x, b.x, c.x)
    miny = Math.min(a.y, b.y, c.y)
    dx = (Math.max(a.x, b.x, c.x) - minx) * 0.5
    dy = (Math.max(a.y, b.y, c.y) - miny) * 0.5

    this.x = minx + dx
    this.y = miny + dy
    this.r = dx * dx + dy * dy
  } else {
    this.x = (D * E - B * F) / G
    this.y = (A * F - C * E) / G
    dx = this.x - a.x
    dy = this.y - a.y
    this.r = dx * dx + dy * dy
  }

  this.distance = function(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) +
      Math.pow(point2.y - point1.y, 2)
    );
  }

  this.surface = function() {

    var a = this.distance(this.a, this.b);
    var b = this.distance(this.b, this.c);
    var c = this.distance(this.c, this.a);

    var s = (a + b + c) / 2;
    var surface = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    return surface;
  }

  this.centroid = function() {
    return {
      x: (this.a.x + this.b.x + this.c.x) / 3,
      y: (this.a.y + this.b.y + this.c.y) / 3
    }
  }

  this.shrink = function(bySize) {
    var centroid = this.centroid();

    var theta_x = centroid.x - this.a.x;
    var theta_y = centroid.y - this.a.y;
    var theta_a = Math.atan2(theta_y, theta_x);
    //    if (theta_a < 0) theta_a += 2 * Math.PI;

    var new_a = {
      x: (this.a.x * 1) + (bySize * Math.cos(theta_a)) * 1,
      y: (this.a.y * 1) + (bySize * Math.sin(theta_a)) * 1
    }

    var theta_x = centroid.x - this.b.x;
    var theta_y = centroid.y - this.b.y;
    var theta_b = Math.atan2(theta_y, theta_x);
    //    if (theta_b < 0) theta_b += 2 * Math.PI;

    var new_b = {
      x: (this.b.x * 1) + (bySize * Math.cos(theta_b)) * 1,
      y: (this.b.y * 1) + (bySize * Math.sin(theta_b)) * 1
    }

    var theta_x = centroid.x - this.c.x;
    var theta_y = centroid.y - this.c.y;
    var theta_c = Math.atan2(theta_y, theta_x);
    //    if (theta_c < 0) theta_c+= 2 * Math.PI;

    var new_c = {
      x: (this.c.x * 1) + (bySize * Math.cos(theta_c)) * 1,
      y: (this.c.y * 1) + (bySize * Math.sin(theta_c)) * 1
    }

    return {
      a: new_a,
      b: new_b,
      c: new_c
    };
  }

  this.draw = function(context) {
    context.beginPath();

    context.strokeStyle = '#999';
    context.lineWidth = 0.05;
    context.moveTo(this.a.x, this.a.y);
    context.lineTo(this.b.x, this.b.y);
    context.lineTo(this.c.x, this.c.y);
    context.lineTo(this.a.x, this.a.y);

    surfaceProc = this.surface() / ((width * height) / 100);
    var colorProc = 255 - (((200 / 100) * surfaceProc).toFixed(0)) * 9;

    context.fillStyle = "#fff";//棱边内容色
    context.fill();

    context.closePath();

    var subTriangle = this.shrink(10);
    context.beginPath();
    context.strokeStyle = '#efefef';//棱边色
    context.lineWidth = 1;
    context.fillStyle = "rgba(" + colorProc + ", " + colorProc + ", " + colorProc + ", 1)";

    context.moveTo(subTriangle.a.x, subTriangle.a.y);
    context.lineTo(subTriangle.b.x, subTriangle.b.y);
    context.lineTo(subTriangle.c.x, subTriangle.c.y);
    context.lineTo(subTriangle.a.x, subTriangle.a.y);

    context.fill();
    context.stroke();
    context.closePath();

    context.beginPath();
    centroid = this.centroid();
    context.arc(centroid.x, centroid.y, 2, 0, 2 * Math.PI, false);
    context.fillStyle = '#ccc';//三角内点点色
    context.fill();
    context.closePath();

  }
}

function byX(a, b) {
  return b.x - a.x
}

function dedup(edges) {
  var j = edges.length,
    a, b, i, m, n

  outer: while (j) {
    b = edges[--j]
    a = edges[--j]
    i = j
    while (i) {
      n = edges[--i]
      m = edges[--i]
      if ((a === m && b === n) || (a === n && b === m)) {
        edges.splice(j, 2)
        edges.splice(i, 2)
        j -= 2
        continue outer
      }
    }
  }
}

function triangulate(vertices) {
  /* Bail if there aren't enough vertices to form any triangles. */
  if (vertices.length < 3)
    return []

  /* Ensure the vertex array is in order of descending X coordinate
   * (which is needed to ensure a subquadratic runtime), and then find
   * the bounding box around the points. */
  vertices.sort(byX)

  var i = vertices.length - 1,
    xmin = vertices[i].x,
    xmax = vertices[0].x,
    ymin = vertices[i].y,
    ymax = ymin

  while (i--) {
    if (vertices[i].y < ymin) ymin = vertices[i].y
    if (vertices[i].y > ymax) ymax = vertices[i].y
  }

  /* Find a supertriangle, which is a triangle that surrounds all the
   * vertices. This is used like something of a sentinel value to remove
   * cases in the main algorithm, and is removed before we return any
   * results.
   *
   * Once found, put it in the "open" list. (The "open" list is for
   * triangles who may still need to be considered; the "closed" list is
   * for triangles which do not.) */
  var dx = xmax - xmin,
    dy = ymax - ymin,
    dmax = (dx > dy) ? dx : dy,
    xmid = (xmax + xmin) * 0.5,
    ymid = (ymax + ymin) * 0.5,
    open = [
      new Triangle({
        x: xmid - 20 * dmax,
        y: ymid - dmax,
        __sentinel: true
      }, {
        x: xmid,
        y: ymid + 20 * dmax,
        __sentinel: true
      }, {
        x: xmid + 20 * dmax,
        y: ymid - dmax,
        __sentinel: true
      })
    ],
    closed = [],
    edges = [],
    j, a, b

  /* Incrementally add each vertex to the mesh. */
  i = vertices.length
  while (i--) {
    /* For each open triangle, check to see if the current point is
     * inside it's circumcircle. If it is, remove the triangle and add
     * it's edges to an edge list. */
    edges.length = 0
    j = open.length
    while (j--) {
      /* If this point is to the right of this triangle's circumcircle,
       * then this triangle should never get checked again. Remove it
       * from the open list, add it to the closed list, and skip. */
      dx = vertices[i].x - open[j].x
      if (dx > 0 && dx * dx > open[j].r) {
        closed.push(open[j])
        open.splice(j, 1)
        continue
      }

      /* If not, skip this triangle. */
      dy = vertices[i].y - open[j].y
      if (dx * dx + dy * dy > open[j].r)
        continue

      /* Remove the triangle and add it's edges to the edge list. */
      edges.push(
        open[j].a, open[j].b,
        open[j].b, open[j].c,
        open[j].c, open[j].a
      )
      open.splice(j, 1)
    }

    /* Remove any doubled edges. */
    dedup(edges)

    /* Add a new triangle for each edge. */
    j = edges.length
    while (j) {
      b = edges[--j]
      a = edges[--j]
      open.push(new Triangle(a, b, vertices[i]))
    }
  }

  /* Copy any remaining open triangles to the closed list, and then
   * remove any triangles that share a vertex with the supertriangle. */
  Array.prototype.push.apply(closed, open)

  i = closed.length
  while (i--)
    if (closed[i].a.__sentinel ||
      closed[i].b.__sentinel ||
      closed[i].c.__sentinel)
      closed.splice(i, 1)

    /* Yay, we're done! */
  return closed
}

/*

End of https://github.com/christopherhesse/delaunay-experiment

*/

/*
  This is a Point Object. It handles any vertices and cotrols each vertex motion
*/
var Point = function() {
  this._size = 0.5;
  this._x = 0;
  this._y = 0;
  this._direction = 0;
  this._velocity = 0;

  this.__collection = null;

  this._step = function(aCollection) {

    this._x = (this._x * 1) + (this._velocity * Math.cos(this._direction)) * 1;
    this._y = (this._y * 1) + (this._velocity * Math.sin(this._direction)) * 1;

    if (this._x > width) this._x = 0;
    if (this._x < 0) this._x = width;
    if (this._y > height) this._y = 0;
    if (this._y < 0) this._y = height;

    this.__collection = aCollection;

  }

  this.draw = function(context) {

    context.beginPath();
    context.arc(this._x, this._y, this._size * this._velocity, 0, 2 * Math.PI, false);
    context.fillStyle = '#14618E';//三角尖角大圆圈色
    context.strokeStyle = '#25B5FF';
    context.lineWidth = 0.2;
    context.fill();
    context.stroke();

    context.beginPath();
    context.arc(this._x, this._y, this._size, 0, 2 * Math.PI, false);
    context.fillStyle = '#777';//三角尖角小圆圈色
    context.fill();

  }
}

/*

This handles a vertex Collection

*/

var Collection = function() {
  this.aPoints = [];
  this.ctx = null;

  this.generate = function(pointsCount) {
    this.aPoints = [];
    for (x = 0; x < pointsCount; x++) {
      var newPoint = new Point();
      newPoint._size = (Math.random() * (3 - 0.5) + 0.5).toFixed(2);
      newPoint._x = (Math.random() * width).toFixed(0);
      newPoint._y = (Math.random() * height).toFixed(0);
      newPoint._direction = (Math.random() * 369).toFixed(2);
      newPoint._velocity = (Math.random() * (4 - 0.2) + 0.2).toFixed(2);
      this.aPoints.push(newPoint);
    }
  }

  this.animate = function() {
    for (x = 0; x < this.aPoints.length; x++) {
      this.aPoints[x]._step(this.aPoints);
    }
    this.draw();
  }

  this.draw = function() {
    this.ctx.save();

    this.ctx.clearRect(0, 0, width, height);

    var points = [];
    for (x = 0; x < this.aPoints.length; x++) {
      points.push({
        x: this.aPoints[x]._x,
        y: this.aPoints[x]._y
      });
    }

    points.push({
      x: 0,
      y: 0
    });
    points.push({
      x: 0,
      y: height
    });
    points.push({
      x: width,
      y: 0
    });
    points.push({
      x: width,
      y: height
    });

    triangles = triangulate(points);

    for (i = 0; i < triangles.length; i++) {
      triangles[i].draw(this.ctx);

    }

    for (x = 0; x < this.aPoints.length; x++) {
      this.aPoints[x].draw(this.ctx);
    }

    this.ctx.restore();
  }

  return this;

}

/*

Init Canvas and animate.

*/

var oCollection;
var can, ctx, interval, width, height;
var numPoints = 100;

function init() {
  can = document.getElementById("playArea");
  ctx = can.getContext("2d");
  width = $('body').width();
  height = $('body').height();

  oCollection = new Collection();
  oCollection.generate(numPoints);
  oCollection.ctx = ctx;

  interval = setInterval(function() {
    oCollection.animate();
  }, 1000 / 25);

}

init();