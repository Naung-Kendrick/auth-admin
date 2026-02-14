import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  useUpdateUserInfoMutation,
  useUpdateUserPwdMutation,
  useUpdateUserAvatarMutation,
} from "@/store/user/userApi";
import { type AppState } from "@/store";
import { toast } from "sonner";
import {
  User,
  Lock,
  Camera,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

// Shadcn UI Imports
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Profile() {
  const { user } = useSelector((state: AppState) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const [updateInfo, { isLoading: isUpdatingInfo }] =
    useUpdateUserInfoMutation();
  const [updatePwd, { isLoading: isUpdatingPwd }] = useUpdateUserPwdMutation();
  const [updateAvatar, { isLoading: isUploading }] =
    useUpdateUserAvatarMutation();

  // Form States
  const [infoForm, setInfoForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [pwdForm, setPwdForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- Handlers ---
  const handleInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateInfo(infoForm).unwrap();
      toast.success("Profile information updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const handlePwdUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      await updatePwd({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      }).unwrap();
      toast.success("Password changed successfully");
      setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Password update failed");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await updateAvatar(formData).unwrap();
        toast.success("Avatar updated successfully");
      } catch (err) {
        toast.error("Failed to upload image");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Account Settings
        </h1>
        <p className="text-slate-500">
          Manage your profile, security, and preferences
        </p>
      </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <Card className="md:col-span-1 h-fit rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage className="object-cover" src={user?.avatar} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              {user?.name}
            </h2>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              <ShieldCheck size={14} className="text-indigo-500" />
              {user?.role === 2 ? "Administrator" : user?.role === 1 ? "Staff" : "User Account"}
            </p>
          </CardContent>
          <CardFooter className="bg-slate-50/50 flex justify-center py-4 rounded-b-2xl border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Member since{" "}
              {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
            </p>
          </CardFooter>
        </Card>

        {/* Right Column: Detailed Forms */}
        <div className="md:col-span-2">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-xl mb-2">
              <TabsTrigger
                value="general"
                className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <User size={16} /> General
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Lock size={16} /> Security
              </TabsTrigger>
            </TabsList>

<TabsContent value="general">
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your name and contact details here.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleInfoUpdate}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-2.5 text-slate-400"
                          size={18}
                        />
                        <Input
                          id="name"
                          className="pl-10"
                          value={infoForm.name}
                          onChange={(e) =>
                            setInfoForm({ ...infoForm, name: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-2.5 text-slate-400"
                          size={18}
                        />
                        <Input
                          id="email"
                          className="pl-10"
                          value={infoForm.email}
                          onChange={(e) =>
                            setInfoForm({ ...infoForm, email: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-2.5 text-slate-400"
                          size={18}
                        />
                        <Input
                          id="phone"
                          className="pl-10"
                          placeholder="+1 234 567 890"
                          value={infoForm.phone}
                          onChange={(e) =>
                            setInfoForm({ ...infoForm, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-100 pt-6">
                    <Button
                      type="submit"
                      disabled={isUpdatingInfo}
                      className="bg-indigo-600 rounded-xl px-8 ml-auto"
                    >
                      {isUpdatingInfo && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

<TabsContent value="security">
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Ensure your account is using a long, random password to stay
                    secure.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handlePwdUpdate}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="old">Current Password</Label>
                      <Input
                        id="old"
                        type="password"
                        value={pwdForm.oldPassword}
                        onChange={(e) =>
                          setPwdForm({
                            ...pwdForm,
                            oldPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new">New Password</Label>
                      <Input
                        id="new"
                        type="password"
                        value={pwdForm.newPassword}
                        onChange={(e) =>
                          setPwdForm({
                            ...pwdForm,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">Confirm New Password</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={pwdForm.confirmPassword}
                        onChange={(e) =>
                          setPwdForm({
                            ...pwdForm,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-100 pt-6">
                    <Button
                      type="submit"
                      disabled={isUpdatingPwd}
                      className="bg-indigo-600 rounded-xl px-8 ml-auto"
                    >
                      {isUpdatingPwd && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Password
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Profile;