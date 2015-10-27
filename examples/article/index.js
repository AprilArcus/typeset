require('script!../../lib/jquery-1.4.2.js');
require('script!../../src/linked-list.js');
require('script!../../src/linebreak.js');
require('script!../../src/formatter.js');
require('script!../../lib/hypher.js');
require('script!../../lib/en-us.js');
require('script!./browser');
require('script!./browser-assist');

window.text = "In olden times when wishing still helped one, there lived a king whose daughters were all beautiful; and the youngest was so beautiful that the sun itself, which has seen so much, was astonished whenever it shone in her face. Close by the king's castle lay a great dark forest, and under an old lime-tree in the forest was a well, and when the day was very warm, the king's child went out to the forest and sat down by the fountain; and when she was bored she took a golden ball, and threw it up on high and caught it; and this ball was her favorite plaything."

function draw(context, nodes, breaks, lineLengths, center) {
  var i = 0, lines = [], point, j, r, lineStart = 0, y = 4, maxLength = Math.max.apply(null, lineLengths);

  // Iterate through the line breaks, and split the nodes at the
  // correct point.
  for (i = 1; i < breaks.length; i += 1) {
    point = breaks[i].position,
    r = breaks[i].ratio;

    for (var j = lineStart; j < nodes.length; j += 1) {
      // After a line break, we skip any nodes unless they are boxes or forced breaks.
      if (nodes[j].type === 'box' || (nodes[j].type === 'penalty' && nodes[j].penalty === -Typeset.linebreak.infinity)) {
        lineStart = j;
        break;
      }
    }
    lines.push({ratio: r, nodes: nodes.slice(lineStart, point + 1), position: point});
    lineStart = point;
  }

  lines.forEach(function (line, lineIndex) {
    var x = 0, lineLength = lineIndex < lineLengths.length ? lineLengths[lineIndex] : lineLengths[lineLengths.length - 1];

    if (center) {
      x += (maxLength - lineLength) / 2;
    }

    line.nodes.forEach(function (node, index, array) {
      if (node.type === 'box') {
        context.fillText(node.value, x, y);
        x += node.width;
      } else if (node.type === 'glue') {
        x += node.width + line.ratio * (line.ratio < 0 ? node.shrink : node.stretch);
      } else if (node.type === 'penalty' && node.penalty === 100 && index === array.length - 1) {
                      context.fillText('-', x, y);
                  }
    });

              // move lower to draw the next line
    y += 21;
  });
};

jQuery(function ($) {
  function align(identifier, type, lineLengths, tolerance, center) {
    var canvas = $(identifier).get(0),
              context = canvas.getContext && canvas.getContext('2d'),
              format, nodes, breaks;
    if (context) {
      context.textBaseline = 'top';
      context.font = "14px 'times new roman', 'FreeSerif', serif";

      format = Typeset.formatter(function (str) {
        return context.measureText(str).width;
      });

      nodes = format[type](text);

      breaks = Typeset.linebreak(nodes, lineLengths, {tolerance: tolerance});

      if (breaks.length !== 0) {
        draw(context, nodes, breaks, lineLengths, center);
      } else {
        context.fillText('Paragraph can not be set with the given tolerance.', 0, 0);
      }
    }
    return [];
  }

          var r = [],
              radius = 147;

          for (var j = 0; j < radius * 2; j += 21) {
              r.push(Math.round(Math.sqrt((radius - j / 2) * (8 * j))));
          }

          r = r.filter(function (v) {
              return v > 30;
          });

  align('#center',   'center',  [350], 3);
  align('#left',     'left',    [350], 4);
  align('#flow',     'justify', [350, 350, 350, 200, 200, 200, 200, 200, 200, 200, 350, 350], 3);
  align('#triangle', 'justify', [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550], 3, true);
          align('#circle',   'justify', r, 3, true);
});
