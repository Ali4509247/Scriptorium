import { useRouter } from "next/router";
import { useState, useEffect } from "react";

type Comment = {
  id: number;
  content: string;
  netRatings: number;
};

type CommentsSectionProps = {
  blogId: number;
};

export default function CommentsSection({ blogId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
      const savedTheme = `${typeof window !== 'undefined' ? localStorage.getItem('theme') : ''}`
      if (savedTheme) {
          setTheme(savedTheme);
      }
  }, [`${typeof window !== 'undefined' ? localStorage.getItem('theme') : ''}`]);


  // Fetch comments when the component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments/${blogId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data); // Assuming API returns an array of comments
        } else {
          console.error("Failed to fetch comments");
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [blogId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, content: newComment.trim() }),
      });

      if (response.ok) {
        const savedComment = await response.json(); // Assuming the response contains the saved comment
        setComments((prev) => [...prev, savedComment]);
        setNewComment(""); // Clear input field
      } else {
        console.error("Failed to post comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleVote = async (commentId: number, voteType: "upvote" | "downvote") => {
    try {
      const response = await fetch(`/api/comments/${commentId}/rate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          'Authorization': `${typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : ''}`
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        // Update the netRatings locally
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  netRatings:
                    comment.netRatings + (voteType === "upvote" ? 1 : -1),
                }
              : comment
          )
        );
      } else {
        console.error("Failed to vote on comment");
      }
    } catch (error) {
      console.error("Error voting on comment:", error);
    }
  };

  // Sort comments in descending order of netRatings
  const sortedComments = [...comments].sort((a, b) => b.netRatings - a.netRatings);

  return (
    <div className={`min-h-screen flex flex-col ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
      <header className="flex justify-between items-center p-4">
        <h1 className={`text-2xl font-bold ${theme === "light" ? "text-black" : "text-white"}`}></h1>
      </header>
      <ul className="mb-4">
        {sortedComments.map((comment) => (
          <li
            key={comment.id}
            className={`border-b py-2 flex justify-between items-center ${theme === "light" ? "border-gray-200 text-gray-700" : "border-gray-700 text-gray-300"}`}
          >
            <span>{comment.content}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{`Rating: ${comment.netRatings}`}</span>
              <button
                onClick={() => handleVote(comment.id, "upvote")}
                className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Upvote
              </button>
              <button
                onClick={() => handleVote(comment.id, "downvote")}
                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Downvote
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className={`flex-1 px-4 py-2 border rounded-md focus:outline-none text-black focus:ring-2 ${theme === "light" ? "border-gray-300 focus:ring-purple-500" : "border-gray-700 focus:ring-purple-400"}`}
        />
        <button
          onClick={handleAddComment}
          className="ml-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}