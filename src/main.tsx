import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Report from "./components/Report.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/report",
    element: <Report />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
