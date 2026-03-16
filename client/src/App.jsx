import { Routes, Route } from "react-router-dom";

import Loader from "./components/ui/Loader.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

const Landing = () => (
  <div className="p-10 flex flex-col gap-6">
    {/* test Button */}
    <Button>Primary Button</Button>
    <Button variant="outline">Outline Button</Button>
    <Button variant="ghost">Ghost Button</Button>
    <Button isLoading={true}>Loading Button</Button>

    {/* test Input */}
    <Input placeholder="Type something..." />
    <Input placeholder="With label" label="Email" />
    <Input placeholder="With error" error="This field is required" />

    {/* test Loader */}
    <Loader />
  </div>
);

const App = () => {
  return (
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/workspace" element={<Dashboard />} /> */}
    </Routes>
  );
};

export default App;