# Rect Collide

Provide a way to test if 2 rects are colliding.

### Install and Run Demo

```
cd example
npm i
npm start
```

### Java-Script usage

```
import { isRectCollide } from './src/'

const rects = [
  {x:200, y: 450, w:250, h:200, angle: 60},
  {x:350, y: 100, w:50, h:125, angle: -10},
];

const isColliding = isRectCollide(...rects);
```