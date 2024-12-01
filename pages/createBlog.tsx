import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const CreateBlogPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [comments, setComments] = useState('');
    const [codeTemplates, setCodeTemplates] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [theme, setTheme] = useState("light");

    const router = useRouter();

    useEffect(() => {
        const token = `${typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : ''}`
        const savedTheme = `${typeof window !== 'undefined' ? localStorage.getItem('theme') : ''}`
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, [router]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        if (typeof window !== 'undefined') {
        localStorage.setItem("theme", newTheme);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !comments || !codeTemplates || !tags) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        setError('');

        const newBlog = { title, description, comments, codeTemplates, tags };

        try {
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');

            const refreshToken = `${typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : ''}`
            if (refreshToken) {
                headers.set('authorization', refreshToken);
            }
            const response = await fetch('/api/blog/', {
                method: 'POST',
                headers,
                body: JSON.stringify(newBlog),
            });

            if (response.ok) {
                router.push('/blog');
            } else {
                const result = await response.json();
                setError(result.message || 'Failed to create blog.');
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred while creating the blog.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-gray-100"}`}>
            <header className={`flex justify-between items-center p-4 bg-purple-600 text-white`}>
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

            <div className="container mx-auto p-4">
                <div className={`rounded ${theme === "light" ? "bg-gray-200" : "bg-gray-800"} flex flex-col space-y-4 p-4 mb-4`}>
                    <h2 className="text-2xl font-semibold text-center text-purple-700">Create a New Blog</h2>

                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm">Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="Enter the blog title"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="Enter a brief description of your blog"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="comments" className="block text-sm">Comments</label>
                            <textarea
                                id="comments"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="Add comments or notes"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="codeTemplates" className="block text-sm">Code Templates</label>
                            <textarea
                                id="codeTemplates"
                                value={codeTemplates}
                                onChange={(e) => setCodeTemplates(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="Add any code templates related to the blog"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="tags" className="block text-sm">Tags</label>
                            <input
                                id="tags"
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder="Add tags (comma-separated)"
                                required
                            />
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className={`px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Blog'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateBlogPage;
