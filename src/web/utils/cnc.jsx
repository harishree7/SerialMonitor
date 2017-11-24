import $ from "jquery";
import SVGReader from "./svg.jsx";
import getPixels from "get-pixels";
import Voronoi from "voronoi";
import Dither from "./dither.jsx";
import fs from "fs";
import inkjet from "inkjet";
export default class CNC {
  constructor() {
    this.svgReader = new SVGReader();
    // console.log(this.toCNC());
    this.scale = 1.0;
  }
  toGray(url) {
    return new Promise(resolve => {
      getPixels(url, (err, pixels) => {
        if (err) {
          console.log("Bad image path");
          resolve("");
          return;
        }
        var w = pixels.shape[0];
        var h = pixels.shape[1];
        var pts = [];
        var dw = Math.max(2, Math.round(Math.min(w, h) / 120));
        dw += dw % 2;
        dw = 1;
        for (var i = 0; i < h; i += dw) {
          for (var j = 0; j < w; j += dw) {
            var n = (i * w + j) * 4;
            pts.push(pixels.data[n]);
            pts.push(pixels.data[n + 1]);
            pts.push(pixels.data[n + 2]);
          }
        }
        w /= dw;
        h /= dw;
        var pixels = new Dither().Dithering(pts, w, h, [
          [0, 0, 0],
          [0xff, 0xff, 0xff]
        ]);
        var buffer = [];
        var dw = 2;
        for (var i = 0; i < h; i++) {
          for (var j = 0; j < w; j++) {
            if (pixels[i * w + j] == 0) {
              buffer.push(0x0);
              buffer.push(0x0);
              buffer.push(0x0);
              buffer.push(0xff);
            } else {
              buffer.push(0xff);
              buffer.push(0xff);
              buffer.push(0xff);
              buffer.push(0xff);
            }
          }
        }
        var options = {
          width: w,
          height: h,
          quality: 80
        };
        inkjet.encode(buffer, options, function(err, encoded) {
          fs.writeFileSync("./demo.jpg", encoded.data);
          resolve("");
        });
      });
    });
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
        var pts = [];
        for (var i = 0; i < pixels.data.length; i += 4) {
          pts.push(pixels.data[i]);
          pts.push(pixels.data[i + 1]);
          pts.push(pixels.data[i + 2]);
        }
        var pixels = new Dither().BayerDithering(pts, w, h, [
          [0, 0, 0],
          [0xff, 0xff, 0xff]
        ]);

        var voronoi = new Voronoi();

        var sites = [];
        var r, g, b, index, gray;
        var dw = Math.max(2, Math.round(Math.min(w, h) / 120));
        dw += dw % 2;

        for (var j = 0; j < h; j += dw) {
          for (var i = 0; i < w; i += dw) {
            index = i + j * w;
            r = pixels[index] & 0xff;
            if (r == 0) {
              sites.push({
                x: i / dw,
                y: j / dw
              });
            }
          }
        }

        var bbox = {
          xl: 0,
          xr: w / dw,
          yt: 0,
          yb: h / dw
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
          '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><g transform="scale(0.5,0.5)">';
        var path = "";
        var dw = Math.max(2, Math.round(Math.min(w, h) / 120));
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
        var pts = [];
        var dw = Math.max(2, Math.round(Math.min(w, h) / 120));
        dw += dw % 2;
        var tw = 0,
          th = 0;
        for (var i = 0; i < h; i += dw) {
          th++;
          tw = 0;
          for (var j = 0; j < w; j += dw) {
            tw++;
            var n = (i * w + j) * 4;
            pts.push(pixels.data[n]);
            pts.push(pixels.data[n + 1]);
            pts.push(pixels.data[n + 2]);
          }
        }
        w = tw;
        h = th;
        var pixels = new Dither().Dither(pts, w, h, [
          [0, 0, 0],
          [0xff, 0xff, 0xff]
        ]);
        var buffer = [];
        var svg =
          '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><g transform="scale(1,1)">';
        var path = "";
        var lines = [];
        for (var i = 0; i < h; i++) {
          for (var j = 0; j < w; j++) {
            if (pixels[i * w + j] == 0) {
              lines.push([{ x: j - 0.5, y: i }, { x: j + 0.5, y: i }]);
              lines.push([{ x: j, y: i - 0.5 }, { x: j, y: i + 0.5 }]);
            }
          }
        }
        var index = 0;
        var subIndex = 1;
        var prevX = 0;
        var prevY = 0;
        console.log(w, h, lines.length);
        function addLine(x, y) {
          if (!lines[x]) {
            return;
          }
          var d = [];
          if (prevX != lines[x][y].x || prevY != lines[x][y].y) {
            d = [
              "M",
              lines[x][y].x,
              lines[x][y].y,
              "L",
              lines[x][1 - y].x,
              lines[x][1 - y].y,
              ""
            ];
          } else {
            d = ["L", lines[x][1 - y].x, lines[x][1 - y].y, ""];
          }
          prevX = lines[x][1 - y].x;
          prevY = lines[x][1 - y].y;
          path += d.join(" ");
        }
        function nextClosetLine(x, y) {
          addLine(index, 1 - subIndex);
          lines.splice(index, 1);
          var minDist = 10000;
          var dist = 0;
          var dx, dy;
          for (var i = 0; i < lines.length; i++) {
            for (var j = 0; j < 2; j++) {
              if (!lines[i][j]) {
                continue;
              }
              dx = lines[i][j].x - x;
              dy = lines[i][j].y - y;
              dist = dx * dx + dy * dy;
              if (dist < minDist) {
                minDist = dist;
                index = i;
                subIndex = 1 - j;
                if (minDist < 1) {
                  return;
                }
              }
            }
          }
        }
        var t = new Date().getTime();
        while (lines.length) {
          if (lines[index]) {
            nextClosetLine(lines[index][subIndex].x, lines[index][subIndex].y);
          } else {
            nextClosetLine(0, 0);
          }
        }
        console.log(new Date().getTime() - t);
        svg +=
          '<path d="' +
          path +
          '" stroke="black" stroke-width="0.2" fill="none"/>';
        svg += "</g></svg>";
        resolve(svg);
      });
    });
  }
  toCNC(svg, scale) {
    if (scale) this.scale = scale;
    var gcode = this.parsePath(this.svgReader.parse(svg.trim(), {}).allcolors);

    // fs.writeFileSync("./bundle/web/assets/gcode.txt", gcode);
    var output =
      "m1 p1\nm1 p1\nm1 p1\ng0 f800\ng0 f800\ng0 f800 a1000\n" +
      gcode +
      "g0 x0 y0\nm1 p0";
    console.log(output);
    return output;
  }
  parsePath(paths) {
    var output = "";
    var power = "";
    var maxPower = 180;
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
