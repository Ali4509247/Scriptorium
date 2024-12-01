import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

const Dashboard: React.FC = () => {
    const { user, getUserData, setUser } = useUser();
    const router = useRouter();
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        if (!user) {
            const fetchUser = async () => {
                await getUserData();
            };
            fetchUser();
        }
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    const handleLogout = () => {
        localStorage.removeItem("refreshToken");
        setUser(null);
        router.push("/");
    };

    const goToProfile = () => {
        router.push("/profile");
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-gray-100"}`}>
            <header className="flex justify-between items-center p-4 bg-purple-600 text-white">
                <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push("/")}>
                    Scriptorium
                </h1>
                <nav className="flex space-x-2">
                    <button
                        className="bg-purple-800 hover:bg-purple-900 hover:scale-105 px-4 py-2 rounded shadow transition"
                        onClick={() => router.push("/code")}
                    >
                        Create Code
                    </button>
                    <button
                        className="bg-purple-800 hover:bg-purple-900 hover:scale-105 px-4 py-2 rounded shadow transition"
                        onClick={() => router.push("/templates")}
                    >
                        Code Templates
                    </button>
                    <button
                        className="bg-purple-800 hover:bg-purple-900 hover:scale-105 px-4 py-2 rounded shadow transition"
                        onClick={() => router.push("/blog")}
                    >
                        Blog Posts
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="bg-purple-800 hover:bg-purple-900 hover:scale-105 px-4 py-2 rounded shadow transition"
                    >
                        Toggle Theme
                    </button>
                </nav>
                <button
                    className="bg-red-500 hover:bg-red-700 px-4 py-2 rounded shadow transition"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <main className="flex-1 flex flex-col justify-center items-center text-center p-4">
                <h2 className="text-3xl font-bold mb-4">
                    Welcome, {user?.firstname} {user?.lastname}!
                </h2>
                <p className="text-lg max-w-2xl mb-8">
                    Explore the features of Scriptorium:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className={`p-4 rounded shadow-lg transition ${theme === "light" ? "bg-purple-200" : "bg-purple-800"}`}>
                        <h3 className={`text-xl font-bold mb-2 ${theme === "light" ? "text-purple-900" : "text-purple-200"}`}>
                            Create Code
                        </h3>
                        <p className={`text-sm ${theme === "light" ? "text-purple-800" : "text-purple-300"}`}>
                            Write and run your code in a collaborative environment.
                        </p>
                    </div>
                    {/* Card 2 */}
                    <div className={`p-4 rounded shadow-lg transition ${theme === "light" ? "bg-purple-200" : "bg-purple-800"}`}>
                        <h3 className={`text-xl font-bold mb-2 ${theme === "light" ? "text-purple-900" : "text-purple-200"}`}>
                            Code Templates
                        </h3>
                        <p className={`text-sm ${theme === "light" ? "text-purple-800" : "text-purple-300"}`}>
                            Save and reuse your favorite code snippets.
                        </p>
                    </div>
                    {/* Card 3 */}
                    <div className={`p-4 rounded shadow-lg transition ${theme === "light" ? "bg-purple-200" : "bg-purple-800"}`}>
                        <h3 className={`text-xl font-bold mb-2 ${theme === "light" ? "text-purple-900" : "text-purple-200"}`}>
                            Blog Posts
                        </h3>
                        <p className={`text-sm ${theme === "light" ? "text-purple-800" : "text-purple-300"}`}>
                            Share your ideas and knowledge with the community.
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        className="px-6 py-3 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition"
                        onClick={goToProfile}
                    >
                        Go to Profile
                    </button>
                </div>
            </main>

            <footer className="p-4 bg-purple-600 text-white text-center">
                <p>© 2024 Scriptorium. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Dashboard;
