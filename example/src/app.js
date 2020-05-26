import CanvasResize from './canvas-resize';
import Canvas from './canvas';
import Settings from './settings';

import { isRectCollide } from '../../src';

let rects = [
  {x:200, y: 450, w:250, h:200, angle: 60, speed: -10, rgb: '50,100,225', label:"Fixed Rect"},
  {x:350, y: 100, w:50, h:125, angle: -10, rgb: '220,150,5', label:"Cursor Rect"},
];

const App = {
  runId: null,
  init() {
    let canvas = document.getElementById("canvas");
    Canvas.init(canvas);

    CanvasResize({
      canvas,
      onRezise: App.draw,
      x: .5
    });

    Settings.init({
      settings: {FPS: 60},
      rects,
      onPlay: App.play,
      onPause: App.pause,
      onRectChange: App.updateRectFromSettings,
    });

    canvas.addEventListener('mousemove', e => {
      rects[1].x = e.offsetX;
      rects[1].y = e.offsetY;
      App.draw();
      Settings.refreshOnMove(rects[1]);
    });

    // At least run it one time
    App.draw();
  },

  play() {
    if (!App.runId) {
      App.runId = setInterval(App.run, 1000 / Settings.get('FPS'));
    }
  },
  pause() {
    if (App.runId) {
      clearInterval(App.runId);
      App.runId = null;
    }
  },
  run() {
    rects = rects.map(rotateRect)
    Settings.refresh(rects);
    App.draw();

    // Test and log result (without any display)
    if (isRectCollide(rects[0], rects[1]))
      console.log("Both rects are colliding");
    else
      console.log("Both rects are NOT colliding");
  },

  draw() {
    Canvas.draw(rects);
  },

  updateRectFromSettings({rect, idx}) {
    rects[idx] = rect;
    App.draw();
  }
};

export default App;

// Intern logic

const rotateRect = (rect) => {
  if (rect.speed) {
    rect.angle += rect.speed / Settings.get('FPS');
  }
  rect.angle %= 360;
  return rect;
};