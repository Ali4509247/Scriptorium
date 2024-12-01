import { useState } from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";

const SignupPage = () => {
    const router = useRouter();
    const [theme, setTheme] = useState("light");

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

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        profilePicture: ""
    });
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

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
        "/images/p10.webp"
    ];

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (confirmPassword && e.target.value !== confirmPassword) {
            setPasswordError("Passwords do not match");
        } else {
            setPasswordError("");
        }
    };
    
    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (password && e.target.value !== password) {
            setPasswordError("Passwords do not match");
        } else {
            setPasswordError("");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleProfilePictureSelect = (picture: string) => {
        setFormData({ ...formData, profilePicture: picture });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    email: formData.email,
                    phone: formData.phoneNumber,
                    password: password,
                    avatar: formData.profilePicture,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit");
            }
            router.push("/login");
        } catch (error) {
            alert("There was an error submitting your sign-up. Please try again.");
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme === "light" ? "bg-gradient-to-b from-purple-50 to-purple-200" : "bg-gradient-to-b from-gray-800 to-gray-900"}`}>
            <header className="flex justify-between items-center p-4 bg-purple-600 text-white shadow-md">
            <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">Scriptorium</h1>
            </Link>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-8">
                <h2 className={`text-3xl font-bold mb-6 ${theme === "light" ? "text-purple-700" : "text-white"}`}>Sign Up</h2>
                <form onSubmit={handleSubmit} className={`p-6 rounded-lg shadow-lg w-full max-w-md space-y-4 ${theme === "light" ? "bg-white" : "bg-gray-800"}`}>
                    <div>
                        <label className={`block font-semibold mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme === "light" ? "focus:ring-purple-600 text-black" : "focus:ring-purple-400 text-white bg-gray-700"}`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block font-semibold mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme === "light" ? "focus:ring-purple-600 text-black" : "focus:ring-purple-400 text-white bg-gray-700"}`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block font-semibold mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme === "light" ? "focus:ring-purple-600 text-black" : "focus:ring-purple-400 text-white bg-gray-700"}`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block font-semibold mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme === "light" ? "focus:ring-purple-600 text-black" : "focus:ring-purple-400 text-white bg-gray-700"}`}
                            required
                        />
                    </div>

                    <div>
                        <label className={`block font-semibold mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={handlePasswordChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme === "light" ? "focus:ring-purple-600 text-black" : "focus:ring-purple-400 text-white bg-gray-700"}`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block font-semibold mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${theme === "light" ? "focus:ring-purple-600 text-black" : "focus:ring-purple-400 text-white bg-gray-700"}`}
                            required
                        />
                        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                    </div>

                    <div>
                        <label className={`block font-semibold mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Select a Profile Picture</label>
                        <div className="grid grid-cols-5 gap-4">
                            {profilePictures.map((picture) => (
                                <img
                                    key={picture}
                                    src={picture}
                                    alt="Profile"
                                    className={`w-16 h-16 rounded-full cursor-pointer border-2 ${
                                        formData.profilePicture === picture
                                            ? "border-purple-600"
                                            : "border-gray-300"
                                    }`}
                                    onClick={() => handleProfilePictureSelect(picture)}
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-2 rounded-lg hover:bg-purple-700 transition ${theme === "light" ? "bg-purple-600 text-white" : "bg-purple-500 text-white"}`}
                    >
                        Submit
                    </button>
                </form>
            </main>

            <footer className={`p-6 ${theme === "light" ? "bg-purple-800" : "bg-gray-800"} text-white text-center`}>
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} <span className="font-bold">Scriptorium</span>. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default SignupPage;
