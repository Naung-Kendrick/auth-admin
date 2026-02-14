import { useState } from "react";
import {
  useGetAllUsersByAdminQuery,
  useUpdateUserRoleMutation,
  useUpdateUserPwdByAdminMutation,
  useDeleteUserMutation,
} from "@/store/user/userApi";
import { toast } from "sonner";
import {
  KeyRound,
  Trash2,
  Mail,
  Phone,
  UserCog,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";

// Shadcn UI Imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import type { AppState } from "@/store";

function UserList() {
  const { user } = useSelector((state: AppState) => state.user);
  const { data, isLoading } = useGetAllUsersByAdminQuery();
  const [updateRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation();
  const [resetPwd, { isLoading: isResetting }] =
    useUpdateUserPwdByAdminMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Dialog States
  const [pwdDialog, setPwdDialog] = useState<{ open: boolean; userId: string }>(
    { open: false, userId: "" },
  );
  const [newPassword, setNewPassword] = useState("");

  // --- Handlers ---
  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateRole({ userId, role: Number(role) }).unwrap();
      toast.success("User role updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update role");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password too short");

    try {
      await resetPwd({ userId: pwdDialog.userId, newPassword }).unwrap();
      toast.success("Password reset successfully");
      setPwdDialog({ open: false, userId: "" });
      setNewPassword("");
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      try {
        await deleteUser(userId).unwrap();
        toast.success("User deleted");
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <UserCog className="text-indigo-600" /> User Management
          </h1>
          <p className="text-slate-500 text-sm">
            Control access levels and manage system users
          </p>
        </div>
      </div>

<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-20 animate-pulse"
                >
                  Fetching users...
                </TableCell>
              </TableRow>
            ) : (
              data?.users.map((u) => (
                <TableRow
                  key={u._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                          {u.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-800">{u.name}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-4 uppercase ${u.active ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "text-slate-400"}`}
                        >
                          {u.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail size={12} /> {u.email}
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone size={12} /> {u.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={String(u.role)}
                      onValueChange={(val) => handleRoleChange(u._id, val)}
                      disabled={isUpdatingRole}
                    >
                      <SelectTrigger className="w-32.5 h-8 text-xs border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">User</SelectItem>
                        <SelectItem value="1">Staff</SelectItem>
                        <SelectItem value="2">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {format(new Date(u.createdAt), "dd MMM, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs border-slate-200 text-slate-600 hover:text-indigo-600"
                        onClick={() =>
                          setPwdDialog({ open: true, userId: u._id })
                        }
                      >
                        <KeyRound size={14} /> Reset
                      </Button>

{/* Only allow deletion for role 2 */}
                      {user?.role === 2 && u._id !== user._id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(u._id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Password Reset Dialog --- */}
      <Dialog
        open={pwdDialog.open}
        onOpenChange={(val) =>
          !val && setPwdDialog({ open: false, userId: "" })
        }
      >
        <DialogContent className="sm:max-w-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="text-amber-500" /> Force Password Reset
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Secure Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-400 italic">
                User will be able to log in with this new password immediately.
              </p>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPwdDialog({ open: false, userId: "" })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isResetting}
                className="bg-indigo-600 rounded-xl px-6"
              >
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserList;