import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./lib/auth.jsx";
import router from "./routes/index.jsx";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
