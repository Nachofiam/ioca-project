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
  const buttons = () => container.querySelectorAll("button");
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
  expect(container.querySelector("button")).toBeNull();
});
