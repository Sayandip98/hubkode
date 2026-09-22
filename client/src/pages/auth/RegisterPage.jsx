import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { useRegister } from "@hooks/useAuth.js";
import Input from "@components/common/Input.jsx";
import Button from "@components/common/Button.jsx";
import ROUTES from "@constants/routes.js";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(39, "Username cannot exceed 39 characters")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "Username can only contain alphanumeric characters and hyphens",
    ),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  displayName: z.string().max(100).optional(),
});

const RegisterPage = () => {
  const { mutate: register, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data) => {
    register(data);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Create your account
        </h1>
        <p className="text-sm text-text-secondary">
          Join HubKode and start building.
        </p>
      </div>

      <div className="bg-surface-secondary border border-border-default rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Username"
            type="text"
            placeholder="your-username"
            autoComplete="username"
            autoFocus
            error={errors.username?.message}
            hint="Only alphanumeric characters and hyphens allowed."
            {...formRegister("username")}
          />

          <Input
            label="Display name"
            type="text"
            placeholder="Your Name"
            autoComplete="name"
            error={errors.displayName?.message}
            hint="Optional. This is how your name will appear publicly."
            {...formRegister("displayName")}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...formRegister("email")}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password?.message}
            hint="Min 8 characters with uppercase, lowercase and number."
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
            {...formRegister("password")}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isPending}
            leftIcon={!isPending && <UserPlus size={16} />}
          >
            Create account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-6">
        Already have an account?{" "}
        <Link to={ROUTES.AUTH.LOGIN} className="text-text-link hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
