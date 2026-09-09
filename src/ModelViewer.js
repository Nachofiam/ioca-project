import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Colores por categoría estructural (tonos hormigón, consistentes con planos reales)
const CATEGORY_STYLE = {
  PILAR:       { color: 0xb8bcc0, roughness: 0.85 }, // columnas
  VIGA:        { color: 0xc7cbce, roughness: 0.85 }, // vigas
  MURO:        { color: 0xa9adb2, roughness: 0.9  }, // muros
  CIMENTACION: { color: 0x8d9095, roughness: 0.95 }, // fundaciones
  LOSA:        { color: 0xd6d9db, roughness: 0.8, opacity: 0.92, transparent: true }, // losas
  OTRO:        { color: 0xb0b3b6, roughness: 0.9  },
};

export default function ModelViewer({ slug, accent }) {
  const mountRef = useRef(null);
  const zoomRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let disposed = false;
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f94, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(30, 50, 35);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-25, 20, -20);
    scene.add(fill);

    let target = new THREE.Vector3(0, 0, 0);
    let radius = 40, theta = 0.8, phi = 1.05;
    let autoRotate = true;
    const MIN_PHI = 0.15, MAX_PHI = Math.PI / 2 - 0.02;
    let minR = 5, maxR = 200;

    function updateCamera() {
      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);
    }

    let dragging = false, px = 0, py = 0;
    const el = renderer.domElement;
    const onDown = e => { dragging = true; autoRotate = false; px = e.clientX; py = e.clientY; el.setPointerCapture(e.pointerId); };
    const onMove = e => {
      if (!dragging) return;
      theta -= (e.clientX - px) * 0.007;
      phi -= (e.clientY - py) * 0.007;
      phi = Math.max(MIN_PHI, Math.min(MAX_PHI, phi));
      px = e.clientX; py = e.clientY;
    };
    const onUp = () => { dragging = false; };
    const onWheel = e => {
      e.preventDefault();
      e.stopPropagation();
      radius *= 1 + (e.deltaY > 0 ? 0.08 : -0.08);
      radius = Math.max(minR, Math.min(maxR, radius));
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    zoomRef.current = factor => {
      autoRotate = false;
      radius = Math.max(minR, Math.min(maxR, radius * factor));
    };

    let rafId;
    function animate() {
      rafId = requestAnimationFrame(animate);
      if (autoRotate) theta += 0.0018;
      updateCamera();
      renderer.render(scene, camera);
    }
    animate();

    async function load() {
      try {
        const [manifest, buf] = await Promise.all([
          fetch(`/models/${slug}.json`).then(r => r.json()),
          fetch(`/models/${slug}.bin`).then(r => r.arrayBuffer()),
        ]);
        if (disposed) return;

        const { bounds, categories } = manifest;
        const group = new THREE.Group();

        for (const [cat, { offset, count }] of Object.entries(categories)) {
          const positions = new Float32Array(buf, offset, count * 9);
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          geo.computeVertexNormals();
          const style = CATEGORY_STYLE[cat] || CATEGORY_STYLE.OTRO;
          const mat = new THREE.MeshStandardMaterial({
            color: style.color, roughness: style.roughness, metalness: 0.02,
            opacity: style.opacity ?? 1, transparent: !!style.transparent,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          group.add(mesh);
        }

        const cx = (bounds.minX + bounds.maxX) / 2;
        const cy = (bounds.minY + bounds.maxY) / 2;
        const cz = (bounds.minZ + bounds.maxZ) / 2;
        group.position.set(-cx, -bounds.minY, -cz);
        scene.add(group);

        const dx = bounds.maxX - bounds.minX;
        const dy = bounds.maxY - bounds.minY;
        const dz = bounds.maxZ - bounds.minZ;
        const diag = Math.sqrt(dx * dx + dy * dy + dz * dz);
        // Encajar la esfera envolvente en el campo de visión más estrecho.
        const halfVerticalFov = THREE.MathUtils.degToRad(camera.fov / 2);
        const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * camera.aspect);
        radius = (diag / 2) / Math.sin(Math.min(halfVerticalFov, halfHorizontalFov)) * 1.05;
        minR = diag * 0.18;
        maxR = Math.max(diag * 2.5, radius * 2);
        target = new THREE.Vector3(0, dy / 2, 0);

        const ground = new THREE.Mesh(
          new THREE.CircleGeometry(diag * 1.4, 48),
          new THREE.MeshStandardMaterial({ color: 0xd8dde0, roughness: 1 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        setStatus("ready");
      } catch (err) {
        console.error("ModelViewer load error:", err);
        if (!disposed) setStatus("error");
      }
    }
    load();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      zoomRef.current = null;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [slug]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />
      {status === "loading" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.14em",
          color: accent, opacity: 0.7, textTransform: "uppercase", pointerEvents: "none",
        }}>Cargando modelo…</div>
      )}
      {status === "error" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.1em",
          color: "#e08a8a", opacity: 0.85, textAlign: "center", padding: "0 20px", pointerEvents: "none",
        }}>No se pudo cargar el modelo 3D</div>
      )}
      {status === "ready" && (
        <div
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          style={{
            position: "absolute", bottom: "10px", right: "10px",
            display: "flex", flexDirection: "column",
            background: "rgba(20,22,26,0.72)", backdropFilter: "blur(3px)",
            border: `1px solid ${accent}55`, borderRadius: "3px", overflow: "hidden",
          }}
        >
          {[["＋", 0.8, "Acercar"], ["－", 1.25, "Alejar"]].map(([glyph, factor, label], i) => (
            <button
              key={label}
              type="button"
              onClick={() => zoomRef.current && zoomRef.current(factor)}
              title={label}
              style={{
                width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none",
                borderTop: i === 1 ? `1px solid ${accent}33` : "none",
                color: accent, fontFamily: "'Courier New', monospace", fontSize: "13px", fontWeight: "bold",
                lineHeight: 1, cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}22`; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >{glyph}</button>
          ))}
        </div>
      )}
    </div>
  );
}
