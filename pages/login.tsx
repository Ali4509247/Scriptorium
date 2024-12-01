import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState("light");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("refreshToken");

    if (token) {
      router.push("/dashboard");
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        setTheme(savedTheme);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      const refreshToken = data.refreshToken;

      localStorage.setItem("refreshToken", refreshToken);

      router.push("/dashboard");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme === "light" ? "bg-gray-100" : "bg-gray-900"}`}>
      <form
        onSubmit={handleSubmit}
        className={`p-6 rounded shadow-md w-full max-w-md ${theme === "light" ? "bg-white" : "bg-gray-800"}`}
      >
        <h1 className={`text-xl font-semibold text-center mb-4 ${theme === "light" ? "text-gray-700" : "text-white"}`}>
          Login
        </h1>
        <div className="mb-4">
          <label className={`block font-semibold mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme === "light" ? "focus:ring-purple-600 text-black" : "focus:ring-purple-400 text-white bg-gray-700"}`}
            required
          />
        </div>
        <div className="mb-4">
          <label className={`block font-semibold mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme === "light" ? "focus:ring-purple-600 text-black" : "focus:ring-purple-400 text-white bg-gray-700"}`}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg hover:bg-purple-700 ${theme === "light" ? "bg-purple-600 text-white" : "bg-purple-500 text-white"}`}
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
