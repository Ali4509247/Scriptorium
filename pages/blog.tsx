import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Define the type for a blog object
type Blog = {
  id: number;
  title: string;
  description: string;
  codeTemplates: string;
  tags: string;
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [theme, setTheme] = useState("light");
  const [filters, setFilters] = useState({
    title: '',
    description: '',
    tags: '',
    codeTemplates: '',
  });

  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }

    fetchBlogs(); // Fetch blogs immediately on first load
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blog', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const data: Blog[] = await response.json();
        setBlogs(data);
      } else {
        console.error("Failed to fetch blogs:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogs(); // Fetch blogs with updated filters
  };

  return (
    <div className={`blogs min-h-screen flex flex-col ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-gray-100"}`}>
      {/* Header */}
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

      {/* Filters */}
      <div className="container mx-auto p-4">
        <div className={`rounded ${theme === "light" ? "bg-gray-200" : "bg-gray-800"} flex flex-col space-y-4 p-4 mb-4`}>
          <h1 className="text-2xl font-bold">Blog Browser</h1>

          {["title", "description", "tags", "codeTemplates"].map((field) => (
            <div className="flex flex-col" key={field}>
              <label htmlFor={field} className="text-sm capitalize">{field}</label>
              <input
                id={field}
                type="text"
                placeholder={`Filter by ${field}`}
                value={filters[field as keyof typeof filters]}
                onChange={(e) => handleFilterChange(e, field)}
                className="rounded p-1 text-black border border-gray-800"
              />
            </div>
          ))}

          <button
            onClick={handleApplyFilters}
            className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            Apply Filters
          </button>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {blogs.map((blog) => (
            <Link href={`/blogs/${blog.id}`} key={blog.id} passHref>
              <div
                className={`cursor-pointer ${theme === "light" ? "bg-purple-200" : "bg-purple-800"} p-2 border border-purple-900 rounded shadow hover:shadow-lg transition-shadow h-full flex flex-col`}
              >
                <h2 className={`text-xl font-semibold text-purple-100 bg-purple-900 p-3 rounded`}>
                  {blog.title}
                </h2>
                <p className={`mt-2 ${theme === "light" ? "text-purple-800" : "text-purple-200"}`}>
                  {blog.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
