import { Rect, isRectCollide } from '../../src';

const Canvas = {

  canvas: null,
  ctx: null,

  init(canvas) {
    Canvas.canvas = canvas;
    Canvas.ctx = Canvas.canvas.getContext('2d');

    return Canvas.canvas;
  },

  clean() {
    Canvas.ctx.clearRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
  },

  draw(rects) {
    // Get isColligind using lib function (no visual)
    const isColliding = isRectCollide(rects[0], rects[1]);

    // Visual Example:
    Canvas.clean();
    // Map in order to use Class Rect
    const rs = rects.map(rect => new Rect(rect))

    rs.forEach((rect, idx) => {
      Canvas.drawRect(rect, isColliding);
      Canvas.drawAxis(rect);
      Canvas.drawCorners(rect);
    });

    Canvas.drawProjections({rect: rs[0], onRect: rs[1]});
    Canvas.drawProjections({rect: rs[1], onRect: rs[0]});
  },

  drawRect(rect, isColliding) {
    Canvas.ctx.save();
    // Draw Rect
    Canvas.ctx.translate(rect.center.x, rect.center.y);
    Canvas.ctx.rotate( rect.theta );
    Canvas.ctx.fillStyle = `rgba( ${isColliding ? '255,0,0' : rect.rgb },.2)`;
    Canvas.ctx.fillRect(rect.size.x / -2, rect.size.y / -2, rect.size.x, rect.size.y);
    Canvas.ctx.restore();
  },

  drawAxis(rect) {
    const axis = rect.getAxis();
      axis.forEach(a => {
      Canvas.drawLine({
        from: a.origin.Add(a.direction.Multiply(-1000)),
        to: a.origin.Add(a.direction.Multiply(1000)),
        rgb: rect.rgb,
      });
    });
  },

  drawLine({
    from, to,
    rgb=null, rgba=null
  }) {
    Canvas.ctx.save();
    Canvas.ctx.translate(from.x, from.y);
    Canvas.ctx.beginPath();
    Canvas.ctx.strokeStyle = rgba ? `rgba(${rgba})` : `rgba(${rgb}, 1)`;
    Canvas.ctx.moveTo(0, 0);
    Canvas.ctx.lineTo(to.x - from.x, to.y - from.y);
    Canvas.ctx.stroke();
    Canvas.ctx.restore();
  },

  drawCorners(rect) {
    rect.getCorners().forEach(corner => {
      Canvas.drawPoint({...corner, rgb: rect.rgb});
    })
  },
  drawPoint({x,y, rgb}) {
    Canvas.ctx.save();
    Canvas.ctx.translate(x, y);

    Canvas.ctx.beginPath();
    Canvas.ctx.fillStyle = `rgba(${rgb},1)`;
    Canvas.ctx.arc(0, 0, 2, 0, Math.PI*2, true);
    Canvas.ctx.closePath();
    Canvas.ctx.fill();

    Canvas.ctx.restore();
  },

  drawProjections({rect, onRect}) {
    const lines = onRect.getAxis();
    const corners = rect.getCorners();

    lines.forEach((line, dimension) => {
      let futhers = {min:null, max:null};
      // Size of onRect half size on line direction
      const rectHalfSize = (dimension === 0 ? onRect.size.x : onRect.size.y) / 2;

      corners.forEach(corner => {
        const projected = corner.Project(line);
        const CP = projected.Minus(onRect.center);
        // Sign: Same directon of OnRect axis : true.
        const sign = (CP.x * line.direction.x) + (CP.y * line.direction.y) > 0;
        const signedDistance = CP.magnitude * (sign ? 1 : -1);

        if (!futhers.min || futhers.min.signedDistance > signedDistance) {
          futhers.min = {signedDistance, corner, projected};
        }
        if (!futhers.max || futhers.max.signedDistance < signedDistance) {
          futhers.max = {signedDistance, corner, projected};
        }
      });

      // Draw min/max projecteds corners
      Canvas.drawPoint({...futhers.min.projected, rgb: rect.rgb});
      Canvas.drawLine({from: futhers.min.corner, to: futhers.min.projected, rgba: `${rect.rgb},.2`});

      Canvas.drawPoint({...futhers.max.projected, rgb: rect.rgb});
      Canvas.drawLine({from: futhers.max.corner, to: futhers.max.projected, rgba: `${rect.rgb},.2`});

      // Projection collide ?

      const projectionCollide = (futhers.min.signedDistance < 0 && futhers.max.signedDistance > 0
        || Math.abs(futhers.min.signedDistance) < rectHalfSize
        || Math.abs(futhers.max.signedDistance) < rectHalfSize);

      const w = Canvas.ctx.lineWidth;
      Canvas.ctx.lineWidth = 2;
      // Draw projection line on other Rect axis
      Canvas.drawLine({
        from: futhers.min.projected,
        to: futhers.max.projected,
        rgb: projectionCollide ? '255,0,0' : rect.rgb,
      });
      Canvas.ctx.lineWidth = w;
    });


  },

};

export default Canvas;

