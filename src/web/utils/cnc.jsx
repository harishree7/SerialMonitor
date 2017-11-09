import $ from "jquery";
import SVGReader from "./svg.jsx";
export default class CNC {
  constructor() {
    this.svgReader = new SVGReader();
  }
  toCNC() {
    const svg = $("#drawing")
      .html()
      .trim();
    return this.parsePath(this.svgReader.parse(svg, {}).allcolors);
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
            power = " p20";
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
