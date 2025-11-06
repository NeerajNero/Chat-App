"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/axios";
import { Message } from "@/types";
import { useEffect, useState, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

// --- API ---
const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const { data } = await api.get(`/conversations/${conversationId}/messages`);
  return data;
};

export default function ChatPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { socket, isConnected } = useSocket();
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversationId = id as string;

  // --- Auth protection ---
  useEffect(() => {
    if (!isAuthLoading && !user) router.push("/login");
  }, [user, isAuthLoading, router]);

  // --- Fetch messages ---
  const {
    data: messages,
    isLoading: isMessagesLoading,
    isError,
  } = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!user && !!conversationId,
    staleTime: 1000 * 60,
  });

  // --- Real-time message listener ---
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        queryClient.setQueryData(
          ["messages", conversationId],
          (oldData: Message[] = []) => [...oldData, message]
        );

        // ✅ Scroll to bottom when a new message arrives
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, isConnected, conversationId, queryClient]);

  // --- Scroll to bottom when messages initially load ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Send message handler ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim()) return;

    socket.emit("sendMessage", {
      content: newMessage,
      conversationId,
    });

    setNewMessage("");

    // ✅ Scroll to bottom immediately after sending
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // --- Loading ---
  if (isAuthLoading || !user || isMessagesLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- Error ---
  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-destructive font-medium">
          Failed to load messages 😢
        </p>
      </div>
    );
  }

  // --- UI ---
  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 h-[calc(100vh-70px)] max-w-5xl">
      <Card className="h-full flex flex-col border shadow-md">
        {/* Header */}
        <CardHeader className="border-b py-3 sm:py-4 bg-muted/30">
          <CardTitle className="text-base sm:text-lg font-semibold flex justify-between items-center">
            <span>Chat Room</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isConnected ? "bg-green-100 text-green-600" : "bg-gray-200"
              }`}
            >
              {isConnected ? "Connected" : "Offline"}
            </span>
          </CardTitle>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            {messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.sender.id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwn && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender.profileImage || ""} />
                          <AvatarFallback>
                            {msg.sender.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2 max-w-[75%] shadow-sm ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-xs font-semibold mb-1 opacity-80">
                            {msg.sender.userName}
                          </p>
                        )}
                        <p className="wrap-break-word text-sm leading-snug">
                          {msg.content}
                        </p>
                        <p className="text-[10px] mt-1 opacity-60 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No messages yet. Start the conversation 💬
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <div className="border-t p-3 sm:p-4 bg-background">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 sm:gap-3"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
