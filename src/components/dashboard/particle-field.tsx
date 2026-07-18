"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ParticleField({ overlay }: { overlay?: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);

    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", onResize);

    // Main torus knot (helix-like)
    const knotGeo = new THREE.TorusKnotGeometry(2, 0.6, 128, 16);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#3b82f6"),
      metalness: 0.3,
      roughness: 0.4,
      wireframe: false,
      emissive: new THREE.Color("#3b82f6"),
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.y = 0.5;
    scene.add(knot);

    // Wireframe overlay
    const wireKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.05, 0.65, 32, 8),
      new THREE.MeshBasicMaterial({ color: "#60a5fa", wireframe: true, transparent: true, opacity: 0.15 })
    );
    wireKnot.position.y = 0.5;
    scene.add(wireKnot);

    // Floating shapes
    const shapes: THREE.Mesh[] = [];
    const colors = ["#8b5cf6", "#06b6d4", "#a78bfa", "#22d3ee", "#60a5fa"];
    const geos = [
      new THREE.OctahedronGeometry(0.3),
      new THREE.IcosahedronGeometry(0.25),
      new THREE.DodecahedronGeometry(0.2),
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      new THREE.TetrahedronGeometry(0.3),
    ];

    for (let i = 0; i < 15; i++) {
      const mat = new THREE.MeshPhysicalMaterial({
        color: colors[i % colors.length],
        metalness: 0.4,
        roughness: 0.3,
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.05,
        transparent: true,
        opacity: 0.7 + Math.random() * 0.3,
      });
      const mesh = new THREE.Mesh(geos[i % geos.length], mat);
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 5 - 2
      );
      mesh.userData = {
        rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02 },
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.3 + Math.random() * 0.3,
        origY: mesh.position.y,
      };
      scene.add(mesh);
      shapes.push(mesh);
    }

    // Particle system
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      particleSizes[i] = Math.random() * 0.15 + 0.05;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));

    const particleMat = new THREE.PointsMaterial({
      color: "#60a5fa",
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Particle system 2 (smaller, more distant)
    const particleMat2 = new THREE.PointsMaterial({
      color: "#8b5cf6",
      size: 0.03,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles2 = new THREE.Points(particleGeo.clone(), particleMat2);
    particles2.position.z = -5;
    scene.add(particles2);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      // Rotate main knot
      knot.rotation.x += 0.005;
      knot.rotation.y += 0.01;
      wireKnot.rotation.x = knot.rotation.x;
      wireKnot.rotation.y = knot.rotation.y;

      // Subtle mouse tilt on knot
      knot.rotation.x += mouse.y * 0.01;
      knot.rotation.y += mouse.x * 0.01;

      // Animate floating shapes
      for (const shape of shapes) {
        shape.rotation.x += shape.userData.rotSpeed.x;
        shape.rotation.y += shape.userData.rotSpeed.y;
        shape.position.y = shape.userData.origY + Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.3;
      }

      // Rotate particle fields slowly
      particles.rotation.y += 0.0003;
      particles2.rotation.y -= 0.0002;

      // Color pulse on knot
      const hue = (Math.sin(time * 0.1) * 0.1 + 0.6);
      knotMat.color.setHSL(hue, 0.8, 0.5);
      knotMat.emissive.setHSL(hue, 0.8, 0.3);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleMat2.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[75vh] min-h-[500px] overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black pointer-events-none z-10" />
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          {overlay}
        </div>
      )}
    </div>
  );
}
