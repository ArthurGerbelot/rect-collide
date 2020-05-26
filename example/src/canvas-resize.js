export default (function({canvas, onRezise, x, y}={}) {
  // resize the canvas to fill browser window dynamically
  window.addEventListener("resize", resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = window.innerWidth * (x || 1);
    canvas.height = window.innerHeight * (y || 1);

    onRezise && onRezise();
  }
  resizeCanvas();
});
