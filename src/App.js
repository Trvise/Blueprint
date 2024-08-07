import Login from "./components/AuthComponents/Login";
import Register from "./components/AuthComponents/Register";

import Header from "./components/pages/Header";
import UploadVideos from "./components/pages/UploadVideos";
import VideosList from "./components/pages/VideosList";

import { AuthProvider } from "./contexts/authContext";
import { useRoutes } from "react-router-dom";

function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <UploadVideos />,
    },
    {
      path: "/videos",
      element: <VideosList />,
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <Header />
      <div className="w-full h-screen flex flex-col">{routesElement}</div>
    </AuthProvider>
  );
}

export default App;