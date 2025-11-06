"use client";

import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { PublicUser } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

// --- API Helpers ---
const fetchUsers = async (): Promise<PublicUser[]> => {
  const { data } = await api.get("/users");
  return data;
};

const startConversation = async (userId: string) => {
  const { data } = await api.post("/conversations/start", { userId });
  return data;
};

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();

  // --- Redirect unauthenticated users ---
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  // --- Fetch all users ---
  const {
    data: users,
    isLoading: isUsersLoading,
    isError,
  } = useQuery<PublicUser[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute cache
  });

  // --- Start new conversation ---
  const mutation = useMutation({
    mutationFn: startConversation,
    onSuccess: (data) => router.push(`/chat/${data.id}`),
    onError: (error) => console.error("Failed to start conversation:", error),
  });

  // --- Handle user status updates in real-time ---
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleStatusChange = (data: { userId: string; status: string }) => {
      queryClient.setQueryData(["users"], (oldData?: PublicUser[]) => {
        if (!oldData) return [];
        return oldData.map((u) =>
          u.id === data.userId ? { ...u, status: data.status } : u
        );
      });
    };

    socket.on("userStatusChange", handleStatusChange);
    return () => {
    socket.off("userStatusChange", handleStatusChange);
  };
  }, [socket, isConnected, queryClient]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- UI ---
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base text-muted-foreground">
            Hi, <span className="font-medium">{user.userName}</span>
          </span>
          <Button onClick={logout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- User List --- */}
        <Card className="col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isUsersLoading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <p className="text-destructive text-center py-4">
                Failed to load users.
              </p>
            ) : (
              <ul className="space-y-3">
                {users?.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.profileImage || ""} />
                        <AvatarFallback>
                          {u.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm sm:text-base">
                          {u.userName}
                        </span>
                        <span
                          className={`text-xs ${
                            u.status === "ONLINE"
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        >
                          {u.status === "ONLINE" ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => mutation.mutate(u.id)}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Starting..." : "Chat"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* --- Chat Section Placeholder --- */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64 sm:h-80 text-muted-foreground">
            <p className="text-center">
              Select a user from the list to start chatting 💬
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
