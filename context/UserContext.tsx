import { createContext, useContext, useState, ReactNode } from "react";

interface User {
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    phone: string | null;
    password: string | null;
    avatar: string | null;
    id: number | null;
}
interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    getUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const getUserData = async (): Promise<void> => {
        try {
            const token = localStorage.getItem("refreshToken");
            if (!token) {
                console.error("No token found");
            }
            
            const user = await fetch("/api/auth/fetchForToken", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });
            const user1: User = await user.json();
            setUser(user1);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, getUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};