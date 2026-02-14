import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLoginUserMutation } from "@/store/user/userApi";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogIn, Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const initialValues = { email: "", password: "" };
  const [values, setValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading, isSuccess, error }] = useLoginUserMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) {
      toast.success("Welcome back!");
      setValues(initialValues);
      navigate("/dashboard"); // သို့မဟုတ် သင်သွားလိုသည့် page
    }
    if (!isLoading && error) {
      const message = (error as any)?.data?.message || "Invalid credentials";
      toast.error(message);
    }
  }, [isLoading, isSuccess, error, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setValues({ ...values, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.email || values.password.length < 6) {
      toast.error("Please enter valid credentials");
      return;
    }
    await login(values);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Please enter your details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel className="text-slate-700 font-medium">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                className="h-11 border-slate-200 focus:ring-indigo-500"
                placeholder="name@example.com"
                value={values.email}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel className="text-slate-700 font-medium">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="h-11 border-slate-200 pr-10"
                  placeholder="••••••••"
                  value={values.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
          </FieldGroup>

          <div className="space-y-4 pt-2">
            <Button 
              type="submit"
              disabled={isLoading} 
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
            
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;