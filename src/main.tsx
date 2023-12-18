import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthContextProvider } from "./contexts/AuthContext.tsx";
import { Flowbite } from "flowbite-react";
import { LazyMotion } from "framer-motion";

const loadFeatures = () =>
  import("./framerFeatures").then((res) => res.default);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LazyMotion features={loadFeatures}>
      <Flowbite>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </Flowbite>
    </LazyMotion>
  </React.StrictMode>,
);
