import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useChangePassword } from "@hooks/useAuth.js";
import Input from "@components/common/Input.jsx";
import Button from "@components/common/Button.jsx";
import PageHeader from "@components/layout/PageHeader.jsx";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

const SecuritySettingsPage = () => {
  const { mutate: changePassword, isPending } = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data) => {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      { onSuccess: () => reset() },
    );
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Security settings" border={false} />

      <section className="bg-surface-secondary border border-border-default rounded-lg p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-4 border-b border-border-muted pb-3">
          Change password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            required
            error={errors.currentPassword?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                className="text-text-muted hover:text-text-secondary"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            {...register("currentPassword")}
          />

          <Input
            label="New password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            required
            error={errors.newPassword?.message}
            hint="Min 8 characters with uppercase, lowercase and number."
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="text-text-muted hover:text-text-secondary"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            {...register("newPassword")}
          />

          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isPending}
              leftIcon={!isPending && <Shield size={14} />}
            >
              Update password
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default SecuritySettingsPage;
