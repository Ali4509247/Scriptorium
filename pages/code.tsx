import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
import { useUser } from "../context/UserContext";
import { minimalSetup, EditorView } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { csharp } from '@replit/codemirror-lang-csharp';
import { rust } from '@codemirror/lang-rust';
import { php } from '@codemirror/lang-php';
import { go } from '@codemirror/lang-go';
import { lineNumbers } from '@codemirror/view';
import { aura } from "@uiw/codemirror-theme-aura";
import { bbedit } from "@uiw/codemirror-theme-bbedit";

type Template = {
  id: number; // Assuming id is a number, adjust based on your database
  userId: number;
  language: string;
  code: string;
};


export default function Code() {
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [forked, setForked] = useState<boolean>(false)
  const [ownsTemplate, setOwnsTemplate] = useState<boolean>(false)
  const [notification, setNotification] = useState<{ message: string, type: string } | null>(null);
  const [theme, setTheme] = useState("light");
  const editorRef = useRef<HTMLDivElement | null>(null);


  // TODO: check if user is logged in or not
  const { user, getUserData } = useUser();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      await getUserData();
      setIsLoggedIn(!!user);
    };

    checkUserLoggedIn();
  }, []);


  const getLanguageExtension = () => {
    switch (language) {
      case 'python':
        return python();
      case 'js':
        return javascript();
      case 'java':
        return java();
      case 'cpp':
        return cpp();
      case 'c':
        return cpp();
      case 'csharp':
        return csharp();
      case 'rust':
        return rust();
      case 'php':
        return php();
      case 'ts':
        return javascript();
      case 'go':
        return go();
      default:
        return python();
    }
  };

  
  useEffect(() => {
    if (editorRef.current) {
      const view = new EditorView({
        doc: code,
        extensions: [minimalSetup, getLanguageExtension(), theme === "light" ? bbedit : aura, lineNumbers(), EditorView.lineWrapping],
        parent: editorRef.current,
        dispatch: (tr) => {
          view.update([tr]);
          if (tr.docChanged) {
            setCode(view.state.doc.toString());
          }
        }
      });
      // Brute force the editor to fill the parent container
      editorRef.current.style.height = "100%"; // Parent height
      view.dom.style.height = "100%"; // CodeMirror's height
      view.dom.style.display = "flex"; // Ensure flex behavior
      view.dom.style.flexDirection = "column";

      return () => {
        view.destroy();
      };
    }
  }, [editorRef, language, theme]);


  // Handle language change
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };


  // Handle input box change
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    if (id) {
      setForked(true);
      getTemplate();
    }

    const savedTheme = `${typeof window !== 'undefined' ? localStorage.getItem('theme') : ''}`;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [id]);


  const executeCode = async () => {
    setIsExecuting(true);
    try {
      const response = await fetch('/api/codeExecution/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code, language: language, input: input }),
      });

      const result = await response.json();
      setOutput(result.output || '');

    } catch (error) {
      console.error('Error executing code:', error);
      setOutput('Error executing code');
    } finally {
      setIsExecuting(false);
    }
  };


  const getTemplate = async () => {
    try {
      const templates = await fetch(`/api/codeTemplates?id=${id}`, {
        method: 'GET'
      });
      
      const data: Template[] = await templates.json();
      const template = data[0]
      setCode(template.code);
      setLanguage(template.language)
      setNotification({ message: 'Template Forked!', type: 'success' });
      console.log(`template author: ${template.userId}`)
      console.log(`user: ${user?.id}`)
      if (template.userId == user?.id){
        setOwnsTemplate(true);
        setForked(false);
        setNotification({ message: 'Template Loaded!', type: 'success' });
        setIsLoggedIn(true)
      }

    } catch (error) {
      setNotification({ message: 'Failed to save template', type: 'error' });
      setForked(false)
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const openSaveTemplateModal = () => {
    if (isLoggedIn) {
      setIsModalOpen(true);
    }
  };

  const saveTemplate = async (title: string, tags: string, description: string) => {
    setIsSaving(true);
    try {
      let response;
      if (ownsTemplate){
        response = await fetch(`/api/codeTemplates/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : ''}`
          },
          body: JSON.stringify({
            tags: tags || '',
            explanation: description || null,
            code,
          }),
        });
      } else{
        response = await fetch('/api/codeTemplates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : ''}`
          },
          body: JSON.stringify({
            title,
            tags: tags,
            explanation: description,
            forked,
            code,
            language,
            userID: user?.id
          }),
        });
      } 

      if (response.ok) {
        setNotification({ message: 'Template saved successfully!', type: 'success' });
        setIsModalOpen(false);
      } else {
        setNotification({ message: 'Failed to save template', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Error saving template', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const deleteTemplate = async () => {
    try {
      const response = await fetch(`/api/codeTemplates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : ''}`
        }
      });
  
      if (response.ok) {
        setNotification({ message: 'Template deleted successfully!', type: 'success' });
        setIsModalOpen(false);
        router.push("/templates"); // Redirect to templates page after deletion
      } else {
        setNotification({ message: 'Failed to delete template', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Error deleting template', type: 'error' });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
    localStorage.setItem("theme", newTheme);
    }
  };

  return (
    <div className={`coding min-h-screen flex flex-col ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-gray-100"}`}>

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

    <div className={`flex justify-between items-center p-4 ${theme === "light" ? "bg-gray-200" : "bg-gray-800"}`}>
      <select
        value={language}
        onChange={handleLanguageChange}
        id="language-selector"
        className={`px-4 py-2 ${theme === "light" ? "bg-gray-100 text-black border-gray-300" : "bg-gray-700 text-white border-gray-600"} rounded-md`}
      >
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="c">C</option>
        <option value="cpp">C++</option>
        <option value="csharp">C#</option>
        <option value="js">JavaScript</option>
        <option value="ts">TypeScript</option>
        <option value="rust">RUST</option>
        <option value="php">PHP</option>
        <option value="go">Go</option>
      </select>
      <div className="flex space-x-4">
        <button
          onClick={openSaveTemplateModal}
          disabled={!isLoggedIn}
          className="px-4 py-2 rounded-md transition-all bg-purple-700 hover:bg-purple-800 hover:scale-105 text-white"
        >
          {ownsTemplate ? 'Update Template' : 'Save Template'}
        </button>
        <button
          onClick={executeCode}
          disabled={isExecuting}
          className="px-4 py-2 rounded-md transition-all bg-purple-700 hover:bg-purple-800 hover:scale-105 text-white"
        >
          {isExecuting ? 'Running' : 'Execute Code'}
        </button>
      </div>
    </div>

    <div className="container grid sm:grid-cols-[1fr,auto] grid-rows-1 gap-4 p-4 flex-1">

      {/* Code Editor Area (main area with flexible width) */}
      <div className="flex flex-col h-full">
        <div
          ref={editorRef}
          className={`code-area w-full h-full min-h-[20rem] p-2 border rounded-md ${theme === "light" ? "bg-gray-100 text-black border-gray-300" : "bg-gray-800 text-white border-gray-600"} font-mono resize-none`}
        />
      </div>

      <div className="right-panel flex flex-col h-full space-y-4">
        {/* Input Box */}
        <div className={`box p-2 border rounded-md ${theme === "light" ? "bg-gray-100 text-black border-gray-300" : "bg-gray-800 text-white border-gray-600"}`}>
          <label htmlFor="input-box" className={`text-sm font-semibold ${theme === "light" ? "text-purple-600" : "text-purple-400"}`}>Input</label>
          <textarea
            id="input-box"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter input here..."
            className={`w-full p-2 border rounded-md resize-none ${theme === "light" ? "bg-gray-200 text-black border-gray-300" : "bg-gray-700 text-white border-gray-600"}`}
            rows={10}
          />
        </div>

        {/* Output Box */}
        <div className={`box p-2 border rounded-md ${theme === "light" ? "bg-gray-100 text-black border-gray-300" : "bg-gray-800 text-white border-gray-600"}`}>
          <label htmlFor="output-box" className={`text-sm font-semibold ${theme === "light" ? "text-purple-600" : "text-purple-400"}`}>Output / Warnings</label>
          <textarea
            id="output-box"
            value={output}
            placeholder="Output / Warnings will appear here..."
            readOnly
            className={`w-full p-2 border rounded-md resize-none ${theme === "light" ? "bg-gray-200 text-black border-gray-300" : "bg-gray-700 text-white border-gray-600"}`}
            rows={10}
          />
        </div>
      </div>
    </div>
    {notification && (
      <div className={`notification fixed bottom-4 right-4 p-4 rounded-md shadow-md ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {notification.message}
      </div>
    )}

    {isModalOpen && (
      <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className={`p-6 rounded-md shadow-md w-96 ${theme === "light" ? "bg-gray-100 text-black" : "bg-gray-800 text-white"}`}>
          <h2 className="text-lg font-bold mb-4">Save Template</h2>
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-1 ${theme === "light" ? "text-purple-600" : "text-purple-400"}`}>Title</label>
            <input
              type="text"
              id="title"
              className={`w-full p-2 border rounded-md ${theme === "light" ? "bg-gray-200 text-black border-gray-300" : "bg-gray-700 text-white border-gray-600"}`}
            />
          </div>
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-1 ${theme === "light" ? "text-purple-600" : "text-purple-400"}`}>Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              className={`w-full p-2 border rounded-md ${theme === "light" ? "bg-gray-200 text-black border-gray-300" : "bg-gray-700 text-white border-gray-600"}`}
            />
          </div>
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-1 ${theme === "light" ? "text-purple-600" : "text-purple-400"}`}>Description</label>
            <textarea
              id="description"
              className={`w-full p-2 border rounded-md resize-none ${theme === "light" ? "bg-gray-200 text-black border-gray-300" : "bg-gray-700 text-white border-gray-600"}`}
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-1 ${theme === "light" ? "text-purple-600" : "text-purple-400"}`}>Forked</label>
            <input
              type="checkbox"
              checked={forked}
              readOnly
              className="form-checkbox h-5 w-5 text-purple-600"
            />
          </div>
          <div className="flex justify-end space-x-4">
          {ownsTemplate && (
          <button
            onClick={deleteTemplate}
            disabled={isSaving}
            className={`px-4 py-2 rounded-md ${theme === "light" ? "bg-red-500 text-white hover:bg-red-600" : "bg-red-700 text-white hover:bg-red-800"}`}
          >
            Delete Template
          </button>
          )}
            <button
              onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2 rounded-md ${theme === "light" ? "bg-gray-300 text-black hover:bg-gray-400" : "bg-gray-600 text-white hover:bg-gray-700"}`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const title = (document.getElementById('title') as HTMLInputElement).value;
                const tags = (document.getElementById('tags') as HTMLInputElement).value;
                const description = (document.getElementById('description') as HTMLTextAreaElement).value;
                saveTemplate(title, tags, description);
              }}
              disabled={isSaving}
              className="px-4 py-2 rounded-md transition-all bg-purple-700 hover:bg-purple-800 hover:scale-105"
            >
              {isSaving ? 'Saving' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}