// The imports
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// This will be our landing page

/* TODO list:
Create home page - All? (index.tsx)
Create blog Page - E (possibly the same as below)? (blog_page.tsx)
Create a page for creating blogs - E
Create a page for code templates (identical to blog page) - E (templates_page.tsx)
Create login page - A (login.tsx)
Create register page - A (register.tsx)
account management page? - C (accounts.tsx)
Create IDE page (where we actually code) - C (code.tsx)
Docker stuff - All? (Btw deployment in optional. Though we do have to dockerize)
*/

const LandingPage = () => {
    const router = useRouter();
    const [theme, setTheme] = useState("light");
    useEffect(() => {
        if (typeof window !== 'undefined') {
        const token = localStorage.getItem("refreshToken");

        if (token) {
            router.push("/dashboard");
        }

        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }
    }, [router]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        if (typeof window !== 'undefined') {
        localStorage.setItem("theme", newTheme);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme === "light" ? "bg-gradient-to-b from-purple-50 to-purple-200" : "bg-gradient-to-b from-gray-800 to-gray-900"}`}>
            <header className="flex justify-between items-center p-4 bg-purple-600 text-white shadow-md">
            <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">Scriptorium</h1>
            </Link>
            <button onClick={toggleTheme} className="bg-purple-800 hover:bg-purple-900 hover:scale-105 px-4 py-2 rounded shadow transition">
                Toggle Theme
            </button>
                {/*
                <Link href="/login">
                    <button className="bg-white text-purple-600 px-4 py-2 rounded shadow hover:bg-gray-100 transition">
                        Login
                    </button>
                </Link>
                */}
            </header>
            <main className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <h2 className="text-4xl font-extrabold text-purple-700 mb-6">
                    Empower Your Creativity
                </h2>
                <p className={`text-lg max-w-2xl ${theme === "light" ? "text-gray-700" : "text-gray-300"} leading-relaxed mb-8`}>
                    Scriptorium is your all-in-one platform to run code, create reusable templates, 
                    and share your knowledge through blog posts. Join us and take your projects to the next level.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/signup">
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition">
                          Signup    
                        </button>
                    </Link>
                    <Link href="/login">
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition">
                          Login    
                        </button>
                    </Link>
                    <Link href="/code">
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition">
                          Start Coding!
                        </button>
                    </Link>
                    <Link href="/templates">
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition">
                            View Code Templates
                        </button>
                    </Link>
                    <Link href="/blog">
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition">
                            View Blog Posts
                        </button>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 bg-purple-800 text-white text-center">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} <span className="font-bold">Scriptorium</span>. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;


