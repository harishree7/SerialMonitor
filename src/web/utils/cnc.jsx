import $ from "jquery";
import SVGReader from "./svg.jsx";
import getPixels from "get-pixels";
import fs from "fs";
export default class CNC {
  constructor() {
    this.svgReader = new SVGReader();
    // console.log(this.toCNC());
    return;
    getPixels("./bundle/web/assets/test.jpg", (err, pixels) => {
      if (err) {
        console.log("Bad image path");
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
      for (var j = 0; j < h; j++) {
        for (var i = 0; i < w; i++) {
          n = j % 2 == 0 ? i : w - 1 - i;
          index = (n + j * w) * 4;
          r = pixels[index] & 0xff;
          g = pixels[index + 1] & 0xff;
          b = pixels[index + 2] & 0xff;
          gray = Math.min(whiteMin, Math.floor(r * 0.3 + g * 0.6 + b * 0.1));

          if (gray != prevGray || n == 0) {
            points.push([n, j, prevGray]);
          }
          prevGray = gray < whiteMin ? gray : whiteMin;
        }
      }
      var gcode = "m1 p1\ng0 x1 y0 f1000 a100\ng0 x0 y0\n";
      var isFast;
      var prevPower = "";
      var power = "";
      var maxSpeed = 250;
      var workingSpeed = 450;
      for (var i = 0; i < points.length; i++) {
        isFast = points[i][2] >= whiteMin;
        power = Math.floor(points[i][2]) / whiteMin + 1;
        // if (prevPower == power && !isFast) {
        // gcode +=
        //   "g1" +
        //   " x" +
        //   (points[i][0] * scale).toFixed(2) +
        //   " y" +
        //   (points[i][1] * scale).toFixed(2) +
        //   " p0 f" +
        //   maxSpeed +
        //   "\n";
        // } else {
        gcode +=
          (isFast ? "g0" : "g1") +
          " x" +
          (points[i][0] * scale).toFixed(2) +
          " y" +
          (points[i][1] * scale).toFixed(2) +
          " p" +
          (isFast ? 0 : 20) +
          " f" +
          Math.floor(workingSpeed * power).toFixed(0) +
          "\n";
        // }
        prevPower = power;
      }
      gcode += "g0 x0 y0 f2000\nm1 p0";
      console.log(points.length);
      fs.writeFileSync("./bundle/web/assets/gcode.txt", gcode);
    });
  }

  toCNC(svg) {
    var gcode = this.parsePath(this.svgReader.parse(svg.trim(), {}).allcolors);

    fs.writeFileSync("./bundle/web/assets/gcode.txt", gcode);
    return gcode;
  }
  parsePath(paths) {
    var output = "";
    var power = "";
    for (var i = 0; i < paths.length; i++) {
      for (var j = 0; j < paths[i].length; j++) {
        var v = paths[i][j];
        if (j == 0) {
          output +=
            "g0" +
            (v.x ? " x" + v.x.toFixed(2) : " x0") +
            (v.y ? " y" + v.y.toFixed(2) : " y0") +
            " p0\n";
        } else {
          if (j == 1) {
            power = " p200";
          } else {
            power = "";
          }
          output +=
            "g1" +
            (v.x ? " x" + v.x.toFixed(2) : " x0") +
            (v.y ? " y" + v.y.toFixed(2) : " y0") +
            power +
            "\n";
        }
      }
    }
    return output;
  }
}
