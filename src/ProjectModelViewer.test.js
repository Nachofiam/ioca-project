import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import ProjectModelViewer from "./ProjectModelViewer";

jest.mock("./ModelViewer", () => function MockModelViewer({ slug }) {
  return <div data-model={slug}>{slug}</div>;
});

let container, root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

test("switches between both FAMIQ models and resets when reopened", () => {
  const props = { model:"famiq-con-hormigon", accent:"#7ab87a", variants:[
    { model:"famiq-con-hormigon", label:"Con hormigón" },
    { model:"famiq-sin-hormigon", label:"Sin hormigón" },
  ] };
  act(() => root.render(<ProjectModelViewer {...props} />));
  const buttons = () => [...container.querySelectorAll("button")].filter(b => !b.getAttribute("aria-label"));
  expect(container.querySelector("[data-model]").dataset.model).toBe("famiq-con-hormigon");
  expect(buttons()).toHaveLength(2);
  expect(buttons()[0].textContent).toBe("Con hormigón");
  expect(buttons()[1].textContent).toBe("Sin hormigón");
  act(() => buttons()[1].click());
  expect(container.querySelector("[data-model]").dataset.model).toBe("famiq-sin-hormigon");
  act(() => buttons()[0].click());
  expect(container.querySelector("[data-model]").dataset.model).toBe("famiq-con-hormigon");
  act(() => root.render(null));
  act(() => root.render(<ProjectModelViewer {...props} />));
  expect(container.querySelector("[data-model]").dataset.model).toBe("famiq-con-hormigon");
});

test("single-model projects have no variant switch", () => {
  act(() => root.render(<ProjectModelViewer model="ausol" accent="#7ab87a" />));
  expect(container.querySelector("[data-model]").dataset.model).toBe("ausol");
  expect([...container.querySelectorAll("button")].map(b => b.getAttribute("aria-label"))).toEqual(["Ampliar"]);
});

test("model + images shows a tab to switch to the image slider", () => {
  act(() => root.render(<ProjectModelViewer model="armada" images={["/a.jpg", "/b.jpg"]} accent="#7ab87a" />));
  const tabs = [...container.querySelectorAll("button")].filter(b => ["Estructura 3D", "Imágenes"].includes(b.textContent));
  expect(tabs.map(b => b.textContent)).toEqual(["Estructura 3D", "Imágenes"]);
  expect(container.querySelector("[data-model]").dataset.model).toBe("armada");
  act(() => tabs[1].click());
  expect(container.querySelector("[data-model]")).toBeNull();
  expect([...container.querySelectorAll("img")].map(i => i.getAttribute("src"))).toEqual(["/a.jpg", "/b.jpg"]);
});

test("image-only projects show the slider without tabs", () => {
  act(() => root.render(<ProjectModelViewer images={["/a.png", "/b.png", "/c.png"]} accent="#7ab87a" />));
  expect(container.querySelector("[data-model]")).toBeNull();
  expect(container.querySelectorAll("img")).toHaveLength(3);
  expect([...container.querySelectorAll("button")].some(b => b.textContent === "Imágenes")).toBe(false);
});

test("expand opens the viewer full screen and Escape closes it", () => {
  act(() => root.render(<ProjectModelViewer model="ausol" accent="#7ab87a" />));
  act(() => container.querySelector('[aria-label="Ampliar"]').click());
  const overlay = () => document.body.querySelector('[aria-label="Cerrar vista ampliada"]');
  expect(overlay()).not.toBeNull();
  expect(document.body.querySelector("[data-model]").dataset.model).toBe("ausol");
  act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
  expect(overlay()).toBeNull();
  expect(container.querySelector('[aria-label="Ampliar"]')).not.toBeNull();
});
