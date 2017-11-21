import $ from "jquery";
import SVGReader from "./svg.jsx";
import getPixels from "get-pixels";
import Voronoi from "voronoi";
import fs from "fs";
export default class CNC {
  constructor() {
    this.svgReader = new SVGReader();
    // console.log(this.toCNC());
    this.scale = 1.0;
    return;

    //   var gcode = "m1 p1\ng0 x1 y0 f1000 a100\ng0 x0 y0\n";
    //   var isFast;
    //   var prevPower = "";
    //   var power = "";
    //   var maxSpeed = 250;
    //   var workingSpeed = 450;
    //   for (var i = 0; i < points.length; i++) {
    //     isFast = points[i][2] >= whiteMin;
    //     power = Math.floor(points[i][2]) / whiteMin + 1;
    //     // if (prevPower == power && !isFast) {
    //     // gcode +=
    //     //   "g1" +
    //     //   " x" +
    //     //   (points[i][0] * scale).toFixed(2) +
    //     //   " y" +
    //     //   (points[i][1] * scale).toFixed(2) +
    //     //   " p0 f" +
    //     //   maxSpeed +
    //     //   "\n";
    //     // } else {
    //     gcode +=
    //       (isFast ? "g0" : "g1") +
    //       " x" +
    //       (points[i][0] * scale).toFixed(2) +
    //       " y" +
    //       (points[i][1] * scale).toFixed(2) +
    //       " p" +
    //       (isFast ? 0 : 20) +
    //       " f" +
    //       Math.floor(workingSpeed * power).toFixed(0) +
    //       "\n";
    //     // }
    //     prevPower = power;
    //   }
    //   gcode += "g0 x0 y0 f2000\nm1 p0";
    //   console.log(points.length);
    //   fs.writeFileSync("./bundle/web/assets/gcode.txt", gcode);
    // });
  }
  toVoronoi(url) {
    return new Promise(resolve => {
      getPixels(url, (err, pixels) => {
        if (err) {
          console.log("Bad image path");
          resolve("");
          return;
        }
        var w = pixels.shape[0];
        var h = pixels.shape[1];
        var pixels = pixels.data;
        var voronoi = new Voronoi();

        var sites = [];
        var r, g, b, index, gray;
        var dw = 8; //Math.max(2, Math.round(Math.min(w, h) / 120));
        dw += dw % 2;
        var grayMax = 0;
        var grayMin = 255;
        var points = [];
        for (var j = 0; j < h; j += dw) {
          points.push([]);
          for (var i = 0; i < w; i += dw) {
            index = (i + j * w) * 4;
            r = pixels[index] & 0xff;
            g = pixels[index + 1] & 0xff;
            b = pixels[index + 2] & 0xff;
            gray = Math.floor((r * 0.3 + g * 0.6 + b * 0.1) / 2);
            if (grayMax < gray) {
              grayMax = gray;
            }
            if (grayMin > gray) {
              grayMin = gray;
            }
            points[points.length - 1].push(gray);
          }
        }
        var scale = 8;
        // grayMin += 40;
        for (var j = 0; j < points.length; j++) {
          // var d = [j == 0 ? "M" : "L", j % 2 ? points[j].length - 1 : 0, j];
          for (var i = 1; i < points[j].length; i++) {
            if (j % 2 == 0) {
              gray = grayMax - points[j][i];
              if (gray < grayMin) {
                continue;
              }
              sites.push({
                x: Math.floor((i - 0.25) * scale),
                y: Math.floor((j + gray / grayMax) * scale)
              });
              sites.push({
                x: Math.floor((i + 0.25) * scale),
                y: Math.floor((j - gray / grayMax) * scale)
              });
            } else {
              var w = points[j].length;
              var n = w - 1 - i;
              gray = grayMax - points[j][n];
              if (gray < grayMin) {
                continue;
              }
              sites.push({
                x: Math.floor((n + 0.25) * scale),
                y: Math.floor((j + gray / grayMax) * scale)
              });
              sites.push({
                x: Math.floor((n - 0.25) * scale),
                y: Math.floor((j - gray / grayMax) * scale)
              });
            }
          }
        }
        console.log(grayMin, grayMax);
        var bbox = {
          xl: 0,
          xr: points[0].length * scale,
          yt: 0,
          yb: points.length * scale
        }; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
        var diagram = voronoi.compute(sites, bbox);
        var svg =
          '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><g transform="scale(0.5,0.5)">';
        var path = "";
        var d = [];
        for (var i = 0; i < diagram.edges.length; i++) {
          d = [
            "M",
            diagram.edges[i].va.x,
            diagram.edges[i].va.y,
            "L",
            diagram.edges[i].vb.x,
            diagram.edges[i].vb.y,
            ""
          ];
          path += d.join(" ");
        }
        svg +=
          '<path d="' +
          path +
          '" stroke="black" stroke-width="0.1" fill="none"/>';
        svg += "</g></svg>";
        console.log(svg);
        resolve(svg);
      });
    });
  }
  toTri(url) {
    return new Promise(resolve => {
      getPixels(url, (err, pixels) => {
        if (err) {
          console.log("Bad image path");
          resolve("");
          return;
        }
        var w = pixels.shape[0];
        var h = pixels.shape[1];
        var pixels = pixels.data;
        var r, g, b, index, gray;
        var points = [];
        var scale = 0.2;
        var whiteMin = 240;
        var n;
        var svg =
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><g>';
        var path = "";
        var dw = Math.max(4, Math.round(Math.min(w, h) / 120));
        dw += dw % 2;
        var grayMax = 0;
        for (var j = 0; j < h; j += dw) {
          points.push([]);
          for (var i = 0; i < w; i += dw) {
            index = (i + j * w) * 4;
            r = pixels[index] & 0xff;
            g = pixels[index + 1] & 0xff;
            b = pixels[index + 2] & 0xff;
            gray = Math.floor((r * 0.3 + g * 0.6 + b * 0.1) / 2);
            if (grayMax < gray) {
              grayMax = gray;
            }
            points[points.length - 1].push(gray);
          }
        }

        for (var j = 0; j < points.length; j++) {
          var d = ["M", j % 2 ? points[j].length - 1 : 0, j];
          for (var i = 1; i < points[j].length; i++) {
            if (j % 2 == 0) {
              gray = grayMax - points[j][i];
              d = d.concat([
                i - 0.5,
                j,
                i - 0.25,
                j + gray / grayMax,
                i,
                j,
                i + 0.25,
                j - gray / grayMax
              ]);
            } else {
              var w = points[j].length;
              var n = w - 1 - i;
              gray = grayMax - points[j][n];
              d = d.concat([
                n + 0.5,
                j,
                n + 0.25,
                j + gray / grayMax,
                n,
                j,
                n - 0.25,
                j - gray / grayMax
              ]);
            }
          }
          path += d.join(" ");
        }
        svg +=
          '<path d="' +
          path +
          '" stroke="black" stroke-width="0.1" fill="none"/>';
        svg += "</g></svg>";
        resolve(svg);
      });
    });
  }
  toHalfTone(url) {
    return new Promise(resolve => {
      getPixels(url, (err, pixels) => {
        if (err) {
          console.log("Bad image path");
          resolve("");
          return;
        }
        var w = pixels.shape[0];
        var h = pixels.shape[1];
        var pixels = pixels.data;
        var r,
          g,
          b,
          index,
          gray,
          prevGray = -1;
        var points = [];
        var scale = 0.2;
        var whiteMin = 240;
        var n;
        var svg =
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><g>';
        var path = "";
        var dw = Math.round(Math.min(w, h) / 40);
        dw += dw % 2;
        var ddw = dw * 2;
        var hdw = dw / 2;
        var rr = dw / 2;
        var rrr = 4;
        var points = [];
        for (var j = 0; j < h; j += dw) {
          points.push([]);
          for (var i = 0; i < w; i += dw) {
            var n = j % ddw == 0 ? i : i;
            index = (n + j * w) * 4;
            r = pixels[index] & 0xff;
            g = pixels[index + 1] & 0xff;
            b = pixels[index + 2] & 0xff;
            gray = Math.floor((r * 0.3 + g * 0.6 + b * 0.1) / 60);
            // var d = [];
            // var cx = n / rrr;
            // var cy = j / rrr;
            points[points.length - 1].push(gray);
          }
        }
        var h = points.length;
        var w = points[0].length;
        var isLineStart = true;
        var lines = [];
        var copyPoints = [];
        for (var i = 0; i < points.length; i++) {
          copyPoints.push(points[i].concat([]));
        }
        for (var k = 0; k < 4; k++) {
          points = [];
          for (var i = 0; i < copyPoints.length; i++) {
            points.push(copyPoints[i].concat([]));
          }
          for (var j = 0; j < h; j++) {
            for (var i = 0; i < w; i++) {
              var gray = points[j][i];
              if (gray != k) {
                continue;
              }
              lines.push({
                gray: gray,
                start: { x: i, y: j },
                end: { x: i, y: j }
              });
              points[j][i] = -1;
              findNextPoint(gray, i, j, false);
            }
          }
        }
        for (var i = 0; i < lines.length; i++) {
          var gray = lines[i].gray;
          var start = lines[i].start;
          var end = lines[i].end ? lines[i].end : start;
          if (!start || !end) {
            contine;
          }
          var d = [];
          var dr = rr / rrr;
          if (gray < 4) {
            d = ["M", start.x, start.y, "L", end.x, end.y, " "];
          }
          if (gray < 3) {
            d = ["M", start.x, start.y, "L", end.x, end.y, " "].concat(d);
          }
          if (gray < 2) {
            d = [
              "M",
              start.x,
              start.y - dr / 2.5,
              "L",
              end.x,
              end.y - dr / 2.5,
              " "
            ].concat(d);
            d = [
              "M",
              start.x,
              start.y + dr / 2.5,
              "L",
              end.x,
              end.y + dr / 2.5,
              " "
            ].concat(d);
          }
          if (gray < 1) {
            d = [
              "M",
              start.x,
              start.y - dr / 1.3,
              "L",
              end.x,
              end.y - dr / 1.3,
              " "
            ].concat(d);
            d = [
              "M",
              start.x,
              start.y + dr / 1.3,
              "L",
              end.x,
              end.y + dr / 1.3,
              " "
            ].concat(d);
          }
          path += d.join(" ");
        }
        points = [];
        for (var i = 0; i < copyPoints.length; i++) {
          points.push(copyPoints[i].concat([]));
        }
        lines = [];
        for (var j = 0; j < h; j++) {
          for (var i = 0; i < w; i++) {
            var gray = points[j][i];
            if (gray != 2) {
              continue;
            }
            lines.push({
              gray: gray,
              start: { x: i, y: j },
              end: { x: i, y: j }
            });
            points[j][i] = -1;
            findNextPoint(gray, i, j, true);
          }
        }
        for (var i = 0; i < lines.length; i++) {
          var gray = lines[i].gray;
          var start = lines[i].start;
          var end = lines[i].end ? lines[i].end : start;
          if (!start || !end) {
            contine;
          }
          var d = [];
          var dr = rr / rrr;

          d = ["M", start.x, start.y, "L", end.x, end.y, " "];

          path += d.join(" ");
        }
        function findNextPoint(gray, x, y, dir) {
          if (dir) {
            if (x >= w - 1 || y >= h - 1) {
              return false;
            }
            var g = points[y + 1][x + 1];
            if (g < 0) {
              return false;
            }
            if (g > gray) {
              return false;
            } else {
              lines[lines.length - 1].end = { x: x + 1, y: y + 1 };
              points[y + 1][x + 1] = -1;
              return findNextPoint(gray, x + 1, y + 1, dir);
            }
          }
          if (x <= 0 || y >= h - 1) {
            return false;
          }
          var g = points[y + 1][x - 1];
          if (g < 0) {
            return false;
          }
          if (g > gray) {
            return false;
          } else {
            lines[lines.length - 1].end = { x: x - 1, y: y + 1 };
            points[y + 1][x - 1] = -1;
            return findNextPoint(gray, x - 1, y + 1, dir);
          }
        }
        svg +=
          '<path d="' +
          path +
          '" stroke="black" stroke-width="0.1" fill="none"/>';
        svg += "</g></svg>";
        resolve(svg);
      });
    });
  }
  toCNC(svg, scale) {
    if (scale) this.scale = scale;
    var gcode = this.parsePath(this.svgReader.parse(svg.trim(), {}).allcolors);

    // fs.writeFileSync("./bundle/web/assets/gcode.txt", gcode);
    var output = "m1 p1\nm1 p1\nm1 p1\ng0 f800\n" + gcode + "g0 x0 y0\nm1 p0";
    console.log(output);
    return output;
  }
  parsePath(paths) {
    var output = "";
    var power = "";
    var maxPower = 100;
    for (var i = 0; i < paths.length; i++) {
      for (var j = 0; j < paths[i].length; j++) {
        var v = paths[i][j];
        if (j == 0) {
          output +=
            "g0" +
            (v.x ? " x" + (v.x * this.scale).toFixed(2) : " x0") +
            (v.y ? " y" + (v.y * this.scale).toFixed(2) : " y0") +
            " p0\n";
        } else {
          if (j == 1) {
            power = " p" + maxPower;
          } else {
            power = "";
          }
          output +=
            "g1" +
            (v.x ? " x" + (v.x * this.scale).toFixed(2) : " x0") +
            (v.y ? " y" + (v.y * this.scale).toFixed(2) : " y0") +
            power +
            "\n";
        }
      }
    }
    return output;
  }
}
