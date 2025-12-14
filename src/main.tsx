import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import AbstractInput from "./components/AbstractInput.tsx";
import AbstractReport from "./components/AbstractReport.tsx";
import { getAllSchools } from "./util/schools";

const schools = getAllSchools();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  ...schools.flatMap((school) => [
    {
      path: `/${school.id}`,
      element: (
        <AbstractInput
          schoolParser={school.parser}
          schoolName={school.id}
          instructions={school.instructions}
          exampleTable={school.exampleTable}
        />
      ),
    },
    {
      path: `/report/${school.id}`,
      element: (
        <AbstractReport schoolName={school.id} schoolParser={school.parser} />
      ),
    },
  ]),
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
