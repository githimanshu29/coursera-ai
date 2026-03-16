import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import useAuth from "../../hooks/useAuth.js";

const AVATARS = [
  "https://avatar.iran.liara.run/public/boy?username=1",
  "https://avatar.iran.liara.run/public/boy?username=2",
  "https://avatar.iran.liara.run/public/girl?username=1",
  "https://avatar.iran.liara.run/public/girl?username=2",
];

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "male",
    avatar: AVATARS[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.gender,
        formData.avatar
      );
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gray-900/50 border border-gray-800">
        {/* logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded-lg" />
          <span className="text-white font-bold text-xl">Coursera-AI</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-gray-400 text-sm mb-6">
          Start your AI learning journey
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* avatar selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">
              Choose Avatar
            </label>
            <div className="flex gap-3">
              {AVATARS.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt="avatar"
                  onClick={() => setFormData({ ...formData, avatar })}
                  className={`w-12 h-12 rounded-full cursor-pointer border-2 transition-all ${
                    formData.avatar === avatar
                      ? "border-purple-500 scale-110"
                      : "border-transparent opacity-60"
                  }`}
                />
              ))}
            </div>
          </div>

          <Input
            label="Full Name"
            name="name"
            placeholder="Himanshu Kumar"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="himanshu@gmail.com"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />

          {/* gender */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400 font-medium">Gender</label>
            <div className="flex gap-4">
              {["male", "female"].map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-2 text-gray-300 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="accent-purple-500"
                  />
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:text-purple-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;