import { useGetAllUsersByAdminQuery } from "@/store/user/userApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import type { AppState } from "@/store";
import { useNavigate } from "react-router-dom";

function ChatList() {
  const navigate = useNavigate();
  const { user } = useSelector((state: AppState) => state.user);
  const { onlineUserIds } = useSelector((state: AppState) => state.message);
  const { data, isLoading, error } = useGetAllUsersByAdminQuery();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-37.5" />
        <Skeleton className="h-100 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-destructive font-medium">
        Something went wrong. Please try again later.
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none md:border md:shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold tracking-tight">
            Users
          </CardTitle>
          <Badge variant="secondary">{data?.users?.length || 0}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-125 pr-4">
          <div className="space-y-2">
            {data?.users
              ?.filter((i) => i._id !== user?._id)
              .map((user) => (
                <div
                  onClick={() => navigate(`/chat/${user._id}`)}
                  key={user._id}
                  className="flex items-center gap-3 p-3 transition-colors rounded-lg cursor-pointer hover:bg-accent group"
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-none truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  {onlineUserIds.includes(user._id) ? (
                    <span className="h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-gray-500 ring-2 ring-background" />
                  )}
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ChatList;