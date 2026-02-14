import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegisterUserMutation } from "@/store/user/userApi";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const initialValues = { name: "", email: "", password: "" };
  const [values, setValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false); // Password state

  const [register, { isLoading, isSuccess, error }] = useRegisterUserMutation();

  useEffect(() => {
    if (!isLoading && isSuccess) {
      toast.success("Account created successfully!");
      setValues(initialValues);
      navigate("/login", { replace: true });
    }
    if (!isLoading && error) {
      const message = (error as any)?.data?.message || "Something went wrong!";
      toast.error(message);
    }
  }, [isLoading, isSuccess, error, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setValues({ ...values, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name || !values.email || values.password.length < 6) {
      toast.error("Please fill all fields correctly (Password min 6 chars)");
      return;
    }
    await register(values);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create an account</h1>
          <p className="text-slate-500 text-sm mt-1">Start managing your expenses today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel className="text-slate-700 font-medium">Full Name</FieldLabel>
              <Input
                id="name"
                className="h-11 border-slate-200 focus:ring-indigo-500"
                placeholder="Jordan Lee"
                value={values.name}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel className="text-slate-700 font-medium">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                className="h-11 border-slate-200"
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
              {isLoading ? "Creating account..." : "Register"}
            </Button>
            
            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;