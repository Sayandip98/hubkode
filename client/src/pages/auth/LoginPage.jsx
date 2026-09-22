import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { useLogin } from "@hooks/useAuth.js";
import Input from "@components/common/Input.jsx";
import Button from "@components/common/Button.jsx";
import ROUTES from "@constants/routes.js";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Sign in to HubKode
        </h1>
        <p className="text-sm text-text-secondary">
          Welcome back! Please enter your details.
        </p>
      </div>

      <div className="bg-surface-secondary border border-border-default rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-text-muted hover:text-text-secondary"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            {...register("password")}
          />

          <div className="flex items-center justify-end">
            <Link to="#" className="text-xs text-text-link hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isPending}
            leftIcon={!isPending && <LogIn size={16} />}
          >
            Sign in
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-6">
        Don't have an account?{" "}
        <Link
          to={ROUTES.AUTH.REGISTER}
          className="text-text-link hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
