import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Define the type for a template object
type Template = {
  id: number;
  title: string;
  explanation: string;
  code: string; // The 'code' attribute
};

export default function TemplatePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filters, setFilters] = useState({
    title: '',
    tags: '',
    code: '',
  });
  const [theme, setTheme] = useState("light");

  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("refreshToken");

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

  // Fetch templates with applied filters
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/codeTemplates', {
        method: 'PUT', // Use PUT to send filters in the request body
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters), // Send filters to the backend
      });

      if (response.ok) {
        const data: Template[] = await response.json();
        setTemplates(data);
      } else {
        console.error('Failed to fetch templates:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Handle changes in filter inputs
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Apply filters
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates(); // Fetch templates on mount
  }, []);

  return (
    <div className={`templates min-h-screen flex flex-col ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-gray-100"}`}>
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
          <h1 className="text-2xl font-bold rounded">Template Browser</h1>

          <div className="flex flex-col">
            <label htmlFor="title" className="text-sm">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Filter by title"
              value={filters.title}
              onChange={(e) => handleFilterChange(e, 'title')}
              className="rounded p-1 text-black border border-gray-800"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="tags" className="text-sm">Tags</label>
            <input
              id="tags"
              type="text"
              placeholder="Filter by tags"
              value={filters.tags}
              onChange={(e) => handleFilterChange(e, 'tags')}
              className="rounded p-1 text-black border border-gray-800"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="code" className="text-sm">Code</label>
            <input
              id="code"
              type="text"
              placeholder="Filter by code"
              value={filters.code}
              onChange={(e) => handleFilterChange(e, 'code')}
              className="rounded p-1 text-black border border-gray-800"
            />
          </div>

          <button
            onClick={handleApplyFilters}
            className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            Apply Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <Link
              href={{ pathname: '/code', query: { id: template.id } }}
              key={template.id}
              passHref
            >
              <div className={`cursor-pointer ${theme === "light" ? "bg-purple-200" : "bg-purple-800"} p-2 border border-purple-900 rounded shadow hover:shadow-lg transition-shadow h-full flex flex-col`}>
                <h2 className={`text-xl font-semibold text-purple-100 bg-purple-900 p-3 rounded`}>
                  {template.title}
                </h2>
                <p className={`mt-2 ${theme === "light" ? "text-purple-800" : "text-purple-200"}`}>{template.explanation}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}