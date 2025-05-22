'use client';

import { useEffect, useRef } from 'react';
import Matter, { Mouse, MouseConstraint } from 'matter-js';

const FallingLetters = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const { Engine, Render, World, Bodies, Events, Runner } = Matter;

    const engine = Engine.create();
    const canvas = canvasRef.current!;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const render = Render.create({
      canvas,
      engine,
      options: {
        width,
        height,
        background: 'transparent',
        wireframes: false,
        pixelRatio: window.devicePixelRatio,
      },
    });

    // const bodies: Matter.Body[] = [];

    // // Track mouse position and velocity
    // let mousePos = { x: 0, y: 0 };
    // let prevMousePos = { x: 0, y: 0 };
    // const updateMousePosition = (e: MouseEvent) => {
    //   const rect = canvas.getBoundingClientRect();
    //   prevMousePos = { ...mousePos };
    //   mousePos = {
    //     x: (e.clientX - rect.left) * (canvas.width / rect.width),
    //     y: (e.clientY - rect.top) * (canvas.height / rect.height),
    //   };
    // };
    // window.addEventListener('mousemove', updateMousePosition);

    // // Apply repelling force on hover
    // Events.on(engine, 'beforeUpdate', () => {
    //   const vx = mousePos.x - prevMousePos.x;
    //   const vy = mousePos.y - prevMousePos.y;
    //   const speed = Math.sqrt(vx * vx + vy * vy);

    //   for (const body of bodies) {
    //     const dx = body.position.x - mousePos.x;
    //     const dy = body.position.y - mousePos.y;
    //     const dist = Math.sqrt(dx * dx + dy * dy);

    //     if (dist < 100 && dist > 0.1) {
    //       const forceMagnitude = 0.05 + 0.2 * (speed / 10); // Repel more with movement
    //       const fx = (dx / dist) * forceMagnitude;
    //       const fy = (dy / dist) * forceMagnitude;
    //       Matter.Body.applyForce(body, body.position, { x: fx, y: fy });
    //     }
    //   }
    // });

    const bodies: (Matter.Body & { customImage?: HTMLImageElement })[] = [];

    // --- Mouse tracking ---
    let mousePos = { x: 0, y: 0 };
    let prevMousePos = { x: 0, y: 0 };

    function getRelativeMousePosition(
        e: MouseEvent,
        canvas: HTMLCanvasElement,
        pixelRatio = window.devicePixelRatio
      ): { x: number; y: number } {
        const rect = canvas.getBoundingClientRect();
        const scrollX = window.pageXOffset;
        const scrollY = window.pageYOffset;
      
        const x =
          (e.pageX - rect.left - scrollX) /
          (canvas.clientWidth / (canvas.width || canvas.clientWidth)) *
          pixelRatio;
      
        const y =
          (e.pageY - rect.top - scrollY) /
          (canvas.clientHeight / (canvas.height || canvas.clientHeight)) *
          pixelRatio;
      
        return { x, y };
      }
      
      const updateMousePosition = (e: MouseEvent) => {
        prevMousePos = { ...mousePos };
        mousePos = getRelativeMousePosition(e, canvas);
      };
      
    window.addEventListener('mousemove', updateMousePosition);

    Events.on(engine, 'beforeUpdate', () => {
        for (const body of bodies) {
          const dx = body.position.x - mousePos.x;
          const dy = body.position.y - mousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
      
          const radius = 150; // Repulsion radius
          if (dist < radius && dist > 1) {
            const forceMagnitude = 0.01 * (1 - dist / radius); // Stronger when closer
            const fx = (dx / dist) * forceMagnitude;
            const fy = (dy / dist) * forceMagnitude;
      
            Matter.Body.applyForce(body, body.position, { x: fx, y: fy });
          }
        }
      });
      
      

     // Mouse interaction
    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.1,
        render: { visible: false },
      },
    });
    World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Boundaries: ground, left & right walls
    const ground = Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true });
    const leftWall = Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true });
    World.add(engine.world, [ground, leftWall, rightWall]);

   // SVG icon to render
   const svg = `<svg width="171" height="171" viewBox="0 0 171 171" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="63" y="18" width="45" height="45" stroke="black" stroke-width="6"/>
<path d="M78 30V63" stroke="black" stroke-width="6"/>
<path d="M93 30V63" stroke="black" stroke-width="6"/>
<rect x="18" y="63" width="45" height="45" stroke="black" stroke-width="6"/>
<path d="M33 75V108" stroke="black" stroke-width="6"/>
<path d="M48 75V108" stroke="black" stroke-width="6"/>
<rect x="108" y="63" width="45" height="45" stroke="black" stroke-width="6"/>
<path d="M123 75V108" stroke="black" stroke-width="6"/>
<path d="M138 75V108" stroke="black" stroke-width="6"/>
<rect x="63" y="108" width="45" height="45" stroke="black" stroke-width="6"/>
<path d="M78 120V153" stroke="black" stroke-width="6"/>
<path d="M93 120V153" stroke="black" stroke-width="6"/>
</svg>
`
   const svgImg = new Image();
   svgImg.src = 'data:image/svg+xml;base64,' + btoa(svg);

   // Spawn 30 SVG bodies
   const itemCount = 45;
   for (let i = 0; i < itemCount; i++) {
     setTimeout(() => {
       const body = Bodies.circle(
         Math.random() * width,
         -100 - Math.random() * 200,
         40,
         {
           restitution: 0.9,
           render: { fillStyle: 'transparent' },
         }
       ) as Matter.Body & { customImage?: HTMLImageElement };

       body.customImage = svgImg;
       World.add(engine.world, body);
       bodies.push(body);
     }, i * 150);
   }

    // Draw SVGs
    Events.on(render, 'afterRender', () => {
        const ctx = render.context;
        bodies.forEach((body) => {
          if (body.customImage?.complete) {
            const size = 100;
            ctx.drawImage(
              body.customImage,
              body.position.x - size / 2,
              body.position.y - size / 2,
              size,
              size
            );
          }
        });
      });

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  return (
    <canvas
      id='falling-letters'
      ref={canvasRef}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'block',
      }}
    />
  );
};

export default FallingLetters;
