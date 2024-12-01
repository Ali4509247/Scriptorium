import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../context/UserContext";
import Link from "next/link";

interface User {
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    phone: string | null;
    password: string | null;
    avatar: string | null;
    id: number | null;
}

interface Template {
    id: number;
    title: string;
    explanation: string;
    userId: number;
}

interface Blog {
    id: number;
    title: string;
    description: string;
    comments: string;
    codeTemplates: string;
    tags: string;
    userId: number;
}

const Profile = () => {
    const { user, getUserData } = useUser();
    const router = useRouter();

    const [firstName, setFirstName] = useState(user?.firstname || "");
    const [lastName, setLastName] = useState(user?.lastname || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState(user?.avatar || "/images/p1.webp");
    const [templates, setTemplates] = useState<Template[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [theme, setTheme] = useState("light");

    const profilePictures = [
        "/images/p1.webp",
        "/images/p2.webp",
        "/images/p3.webp",
        "/images/p4.webp",
        "/images/p5.webp",
        "/images/p6.webp",
        "/images/p7.webp",
        "/images/p8.webp",
        "/images/p9.webp",
        "/images/p10.webp",
    ];

    useEffect(() => {
        const token = localStorage.getItem("refreshToken");
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, [router]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    // Fetch templates
    useEffect(() => {
        if (!user || !user.id) return;

        const fetchTemplates = async () => {
            try {
                const response = await fetch("/api/codeTemplates/", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: user.id }),
                });

                if (response.ok) {
                    const fetchedTemplates: Template[] = await response.json();
                    console.log("Fetched templates:", fetchedTemplates); // Log the fetched templates
                    setTemplates(fetchedTemplates);
                } else {
                    console.error("Failed to fetch templates");
                }
            } catch (error) {
                console.error("Error fetching templates:", error);
            }
        };

        fetchTemplates();
    }, [user]);

    // Fetch blogs
    useEffect(() => {
        if (!user || !user.id) return;

        const fetchBlogs = async () => {
            try {
                const response = await fetch("/api/blog", {
                    method: "PUT",  // Assuming 'PUT' to fetch all blogs with filters (userId)
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: user.id }),
                });

                if (response.ok) {
                    const fetchedBlogs: Blog[] = await response.json();
                    console.log("Fetched blogs:", fetchedBlogs); // Log the fetched blogs
                    setBlogs(fetchedBlogs);
                } else {
                    console.error("Failed to fetch blogs");
                }
            } catch (error) {
                console.error("Error fetching blogs:", error);
            }
        };

        fetchBlogs();
    }, [user]);

    // Profile update logic
    const handleProfileUpdate = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const updatedUserData = {
            firstname: firstName,
            lastname: lastName,
            email: user?.email,
            phone: phoneNumber,
            password: password,
            avatar: avatar,
        };

        try {
            const response = await fetch("/api/user/edit", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    authorization: localStorage.getItem("refreshToken") || "",
                },
                body: JSON.stringify(updatedUserData),
            });

            if (response.ok) {
                getUserData();
                router.push("/dashboard");
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating your profile.");
        }
    };

    return (
        <div className={`min-h-screen ${theme === "light" ? "bg-gray-100" : "bg-gray-900"} flex flex-col`}>
            {/* Header */}
            <header className={`flex justify-between items-center p-4 bg-purple-600 text-white fixed w-full top-0 left-0 z-10`}>
                <Link href="/">
                    <h1 className="text-2xl font-bold cursor-pointer">Scriptorium</h1>
                </Link>
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
            </header>

            {/* Main Content */}
            <div className="mt-20 p-4 flex flex-col items-center w-full">
                <h2 className={`text-3xl font-bold mb-6 ${theme === "light" ? "text-black" : "text-white"}`}>Profile</h2>

                <div className="mb-8 flex justify-center">
                    <img
                        src={avatar}
                        alt="Profile Picture"
                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-600"
                    />
                </div>

                {/* Profile Form */}
                <div className={`p-6 shadow-md rounded-lg w-full sm:max-w-md lg:max-w-lg mx-auto ${theme === "light" ? "bg-white text-black" : "bg-gray-800 text-black"}`}>
                    <div className="mb-4">
                        <label htmlFor="firstName" className="block">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="lastName" className="block">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="phoneNumber" className="block">Phone Number</label>
                        <input
                            id="phoneNumber"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block">Email</label>
                        <input
                            id="email"
                            type="text"
                            value={email}
                            disabled
                            className="w-full px-4 py-2 border rounded-md bg-gray-200"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>

                    <button
                        onClick={handleProfileUpdate}
                        className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white"
                    >
                        Update Profile
                    </button>
                </div>

                {/* Your Templates Section */}
                <div className="mt-12 w-full max-w-screen-xl mx-auto">
                    <h3 className={`text-2xl font-semibold mb-4 ${theme === "light" ? "text-black" : "text-white"}`}>
                        My Templates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <div key={template.id} className="border p-4 rounded-md bg-purple-600 shadow-md">
                                <h4 className="font-bold">{template.title}</h4>
                                <p>{template.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Blogs Section */}
                <div className="mt-12 w-full max-w-screen-xl mx-auto">
                    <h3 className={`text-2xl font-semibold mb-4 ${theme === "light" ? "text-black" : "text-black"}`}>
                        My Blogs
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="border p-4 rounded-md bg-purple-600 shadow-md">
                                <h4 className="font-bold">{blog.title}</h4>
                                <p>{blog.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
