import { Component, Element, State } from '@stencil/core';

interface Charge {
  x: number;
  y: number;
  c: number;

  dRange: number,
  dAngle: number,

  angle: number;
}

@Component({
  tag: 'landing-gl',
})
export class LandingGL {

  private width: number;
  private height: number;
  private charges: Charge[] = [];

  @Element() el: Element;

  @State() data = new Float32Array(NU_PARTICLES * 3);
  @State() isReady = false;
  @State() state = 0

  constructor() {
    for (let i = 0; i < NU_PARTICLES; i++) {
      this.charges.push({
        angle: Math.random() * Math.PI * 2,
        dRange: 0.01,
        dAngle: 0,
        x: 0,
        y: 0,
        c: 0
      });
    }
  }

  componentDidLoad() {
    const shader = this.el.querySelector('shader-player') as HTMLElement;
    this.resetCapacitor(shader.offsetWidth, shader.offsetHeight);
    this.initListener();
    this.isReady = true;

    requestAnimationFrame(() => this.getFrame());
  }

  private resetCapacitor(width: number, height: number) {
    this.width = width;
    this.height = height;

    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < 7; i++) {
      const c = this.charges[i];
      c.x = centerX - 100;
      c.y = centerY + 200 - i*70;
      c.c = 350;
    }
    for (let i = 0; i < 7; i++) {
      const c = this.charges[7 + i];
      c.x = centerX + 100;
      c.y = centerY + 200 - i*70;
      c.c = -350;
    }
  }

  private initListener() {
    let captured = -1;
    document.body.addEventListener('pointerdown', (ev) => {
      const x = ev.clientX;
      const y = this.height - ev.clientY + 62;
      captured = this.charges.findIndex(c => {
        const dx = c.x - x;
        const dy = c.y - y;
        return (dx*dx + dy*dy) < 2400;
      });
      if (captured>= 0) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    });
    document.body.addEventListener('pointerup', () => captured = -1);
    document.body.addEventListener('pointermove', (ev) => {
      if (captured >= 0) {
        ev.preventDefault();
        ev.stopPropagation();

        this.charges[captured].x = ev.clientX;
        this.charges[captured].y = this.height - ev.clientY + 62;
      }
    }, {passive: false, capture: true});
  }

  private getFrame() {
    const dRange = 0.01;
    let i = 0;
    const data = this.data;
    const factor = window.devicePixelRatio;
    for (let c of this.charges) {
      const cor = dRange * Math.atan(15*c.dAngle) / Math.PI;
      const randNum = ((Math.random()*2)-1) * dRange-cor;
      c.dAngle += randNum;
      c.angle += c.dAngle;

      c.x += 0.4 * Math.cos(c.angle);
      c.y += 0.4 * Math.sin(c.angle);

      if (c.x < 0 || c.x > this.width) {
        c.angle = Math.PI - c.angle;
        c.x = clamp(c.x, 2, this.width - 2);
      }

      if (c.y < 0 || c.y > this.height) {
        c.angle = -c.angle;
        c.y = clamp(c.y, 2, this.height - 2);
      }

      data[i*3 + 0] = c.x * factor;
      data[i*3 + 1] = c.y * factor;
      data[i*3 + 2] = c.c;
      i++;
    }
    this.state = this.state + 1;
    requestAnimationFrame(() => requestAnimationFrame(() => this.getFrame()));
  }

  render() {
    return <shader-player
      frag={FRAG}
      ready={this.isReady}
      uniforms={{
        '3fv:u_data': this.data,
      }} />;
  }
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

export const FRAG = `
#define MAX_NUMBER_ITEMS 14
#define BACKGROUND_COLOR vec3(0.03, 0.05, 0.07)
#define CHARGE_COLOR vec3(0.047, 0.083, 0.116)
#define VECTOR_COLOR vec3(0.03, 0.05, 0.07)
#define ZERO_COLOR vec4(0, 0, 0, 1)
#define LINE_COLOR vec4(0.064, 0.116, 0.162, 1)
#define RANGE 0.05

precision highp float;
uniform vec3 u_data[MAX_NUMBER_ITEMS];

bool isClose(float value, float center, float radius) {
    return (value > (center-radius) && value < (center+radius));
}

void main() {
    vec2 pos = gl_FragCoord.xy * 2.0;
    float value = 0.0;

    for (int i = 0; i < MAX_NUMBER_ITEMS; ++i) {
      vec2 vector = pos.xy - u_data[i].xy;
      float dist = inversesqrt(dot(vector, vector));
      value += u_data[i].z * dist;
    }

    if (isClose(value, 0.0, RANGE)) {
      gl_FragColor = ZERO_COLOR;
    } else if (isClose(value, ceil(value), RANGE)) {
      gl_FragColor = LINE_COLOR;
    } else {
      gl_FragColor = vec4(mix(BACKGROUND_COLOR, CHARGE_COLOR, min(abs(value)*0.3, 1.0)*0.5), 1);
    }
}
`
const NU_PARTICLES = 14;
