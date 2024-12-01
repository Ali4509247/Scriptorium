import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommentsSection from '../CommentsSection';

type Blog = {
  id: number;
  title: string;
  description: string;
  userId: number;
  codeTemplates: string;
  tags: string;
  abuseReports: number;
  netRatings: number;
};

type Template = {
  explanation: string;
  title: string;
  id: number;
  name: string;
  description: string;
};

export default function BlogDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [abuseReason, setAbuseReason] = useState('');
  const [theme, setTheme] = useState("light");

  const [userName, setUserName] = useState<string | null>(null); // State to hold user name
  const [loading, setLoading] = useState(true);   // State for loading status
  const [error, setError] = useState(null);       // State for error handling

  useEffect(() => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
          setTheme(savedTheme);
      }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    // Function to fetch user name
    async function fetchUserName() {
      try {
        if (!blog) return;
        const response = await fetch(`/api/user/${blog.userId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        const newUserName = data.firstname + ' ' + data.lastname;
        setUserName(newUserName); 
      } catch (err) {
        // setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserName();
  }, [blog ? blog.userId : null]);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      const response = await fetch(`/api/blog/${id}`);
      const data = await response.json();
      setBlog(data);
    };

    fetchBlog();
  }, [id]);

  useEffect(() => {
    if (!blog) return;

    const fetchTemplates = async () => {
      const templateIds = blog.codeTemplates
        .replace(/,\s*$/, '') // Remove trailing commas and whitespaces
        .split(',')
        .map((id) => id.trim());
      const templateFetches = templateIds.map((templateId) =>
        fetch(`/api/codeTemplates/${templateId}`).then((res) => res.json())
      );
      const templateData = await Promise.all(templateFetches);
      setTemplates(templateData);
    };

    fetchTemplates();
  }, [blog]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!blog || userVote === voteType) return;

    try {
      const response = await fetch(`/api/blog/${blog.id}/rate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `${localStorage.getItem("refreshToken")}`
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        setBlog((prev) =>
          prev
            ? {
                ...prev,
                netRatings:
                  prev.netRatings +
                  (voteType === 'upvote' ? (userVote === 'downvote' ? 2 : 1) : (userVote === 'upvote' ? -2 : -1)),
              }
            : null
        );
        setUserVote(voteType);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleAbuseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blog || !abuseReason) return;

    try {
      const response = await fetch(`/api/blog/${blog.id}/abuse`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(localStorage.getItem("refreshToken") && { "authorization": localStorage.getItem("refreshToken") })
        },
        
        body: JSON.stringify({ reason: abuseReason }),
      });

      if (response.ok) {
        setBlog((prev) =>
          prev ? { ...prev, abuseReports: prev.abuseReports + 1 } : null
        );
        setAbuseReason('');
      } else {
        console.error('Failed to report abuse.');
      }
    } catch (error) {
      console.error('Error reporting abuse:', error);
    }
  };

  if (!blog) return <div>Loading...</div>;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
      {/* Header */}
      <header className={`flex justify-between items-center p-4 bg-purple-600 text-white`}>
        <Link href="/">
          <h1 className="text-2xl font-bold">Scriptorium</h1>
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

      {/* Blog Content */}
      <main className={`container mx-auto p-6 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} shadow-lg rounded-lg mt-6`}>
        {/* Title and Description Section */}
        <section className="mb-6">
          <h1 className={`text-5xl font-extrabold mb-4 ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}>{blog.title}</h1>
          <div className="flex items-start justify-between">
            <p className={`text-xl ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} flex-1`}>{blog.description}</p>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} ml-4`}>Author: {userName}</p>
          </div>
        </section>

        {/* Info Bar */}
        <section className={`p-4 rounded-md shadow-sm flex justify-between items-center mb-6 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}>
          {/* Abuse Reports */}
          <div>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} mb-2`}>Abuse Reports: {blog.abuseReports}</p>
            <form onSubmit={handleAbuseSubmit} className="flex flex-col w-full">
              <textarea
                value={abuseReason}
                onChange={(e) => setAbuseReason(e.target.value)}
                placeholder="Reason for reporting abuse..."
                className={`mb-2 p-2 border rounded text-sm w-full ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'}`}
                rows={10}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Submit Abuse Report
              </button>
            </form>
          </div>

          {/* Net Ratings */}
          <div className="flex items-center">
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} mr-2`}>Net Ratings: {blog.netRatings}</p>
            <button
              onClick={() => handleVote('upvote')}
              className={`px-2 py-1 text-sm rounded ${
                userVote === 'upvote'
                  ? 'bg-green-700 text-white'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Upvote
            </button>
            <button
              onClick={() => handleVote('downvote')}
              className={`px-2 py-1 text-sm rounded ml-2 ${
                userVote === 'downvote'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Downvote
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {blog.tags.split(',').map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 ${theme === 'light' ? 'bg-gray-200 text-gray-800' : 'bg-gray-600 text-gray-200'} text-sm rounded-full shadow-sm`}
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </section>

        {/* Templates Section */}
        <section className="mb-6">
          <h2 className={`text-3xl font-bold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>Templates</h2>
          <div className="flex flex-wrap gap-4">
            {templates.map((template) => (
              <Link
              href={{ pathname: '/code', query: { id: template.id } }}
              key={template.id}
              passHref
            >
              <div
                key={template.id}
                className={`p-4 rounded shadow-sm ${theme === 'light' ? 'bg-purple-100 text-gray-800' : 'bg-gray-700 text-gray-300'}`}
              >
                <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>{template.title}</h3>
                <p className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>{template.explanation}</p>
              </div>
            </Link>
            ))}
          </div>
        </section>

        {/* Comments Section */}
        <section className="mb-6">
          <h2 className={`text-3xl font-bold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>Comments</h2>
          <CommentsSection blogId={blog.id} />
        </section>
      </main>
    </div>
  );
}