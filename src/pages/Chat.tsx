import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import type { AppState } from "@/store";
import { useCreateMessageMutation, useLazyGetAllMessagesQuery } from "@/store/message/messageApi";
import { useGetUserByIdQuery } from "@/store/user/userApi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SendHorizontal } from "lucide-react";

function Chat() {
  const { receiverId } = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { onlineUserIds, messages } = useSelector((state: AppState) => state.message);
  
  const { data, isLoading, error } = useGetUserByIdQuery(receiverId!);
  const [getMessages] = useLazyGetAllMessagesQuery();

  const receiver = data?.user;
  const isOnline = onlineUserIds.includes(receiverId!);
  const [message, setMessage] = useState("");
  const [sendMessage, { isLoading: isSending }] = useCreateMessageMutation();

  // Fetch messages on mount/id change
  useEffect(() => {
    if (receiverId) {
      getMessages(receiverId);
    }
  }, [receiverId, getMessages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!receiverId?.trim() || !message.trim()) return;
    try {
      await sendMessage({ receiverId, message }).unwrap();
      setMessage("");
      getMessages(receiverId)
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  if (isLoading) return <ChatLoadingSkeleton />;
  if (error) return <div className="p-8 text-center text-destructive">User not found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-2xl mx-auto border rounded-xl bg-background overflow-hidden shadow-sm">
      {/* Header */}
      <CardHeader className="border-b bg-card/50 py-3 px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarImage src={receiver?.avatar} />
              <AvatarFallback>{receiver?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-none">{receiver?.name}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </CardHeader>
      {/* Messages Area */}
      <CardContent 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <p className="text-xs">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId !== receiverId;
            return (
              <div
                key={msg._id}
                className={cn(
                  "flex w-full mb-2",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-white text-foreground border rounded-tl-none"
                  )}
                >
                  <p className="leading-relaxed wrap-break-word">{msg.message}</p>
                  <p className={cn(
                    "text-[10px] mt-1 opacity-70",
                    isMe ? "text-right" : "text-left"
                  )}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Input Area */}
      <CardFooter className="p-4 border-t bg-background shrink-0">
        <div className="flex w-full items-end gap-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-11 max-h-32 resize-none focus-visible:ring-1 bg-muted/50 border-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            size="icon" 
            disabled={!message.trim() || isSending} 
            onClick={handleSendMessage}
            className="rounded-full shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </div>
  );
}

function ChatLoadingSkeleton() {
  return (
    <div className="flex flex-col h-125 max-w-2xl mx-auto border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-12 w-3/4 ml-auto rounded-xl" />
        <Skeleton className="h-12 w-2/3 rounded-xl" />
        <Skeleton className="h-12 w-1/2 ml-auto rounded-xl" />
      </div>
    </div>
  );
}

export default Chat;