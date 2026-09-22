import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@store/authStore.js";
import * as userService from "@services/user.service.js";
import Input from "@components/common/Input.jsx";
import Textarea from "@components/common/Textarea.jsx";
import Button from "@components/common/Button.jsx";
import Avatar from "@components/common/Avatar.jsx";
import PageHeader from "@components/layout/PageHeader.jsx";
import QUERY_KEYS from "@constants/queryKeys.js";
import toast from "react-hot-toast";

const schema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().max(255).optional(),
  company: z.string().max(100).optional(),
});

const ProfileSettingsPage = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (response) => {
      const updatedUser = response.data.user;
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const { mutate: uploadAvatar, isPending: isUploading } = useMutation({
    mutationFn: (formData) => userService.uploadAvatar(formData),
    onSuccess: (response) => {
      const updatedUser = response.data.user;
      updateUser(updatedUser);
      setAvatarPreview(null);
      toast.success("Avatar updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload avatar");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user?.displayName || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
      company: user?.company || "",
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    const formData = new FormData();
    formData.append("avatar", file);
    uploadAvatar(formData);
  };

  const onSubmit = (data) => {
    updateProfile(data);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile settings" border={false} />

      <div className="flex flex-col gap-6">
        <section className="bg-surface-secondary border border-border-default rounded-lg p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4 border-b border-border-muted pb-3">
            Profile picture
          </h2>

          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar
                src={avatarPreview || user?.avatarUrl}
                name={user?.displayName || user?.username}
                size="4xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                aria-label="Change avatar"
              >
                <Camera size={20} className="text-white" />
              </button>
            </div>

            <div>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? "Uploading..." : "Change avatar"}
              </Button>
              <p className="text-xs text-text-muted mt-2">
                JPEG, PNG, WebP or GIF. Max 5MB.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </section>

        <section className="bg-surface-secondary border border-border-default rounded-lg p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4 border-b border-border-muted pb-3">
            Public profile
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Username"
                value={user?.username}
                disabled
                hint="Username cannot be changed."
              />
              <Input
                label="Display name"
                placeholder="Your name"
                error={errors.displayName?.message}
                {...register("displayName")}
              />
            </div>

            <Textarea
              label="Bio"
              placeholder="Tell people a little about yourself..."
              rows={4}
              showCount
              maxLength={500}
              error={errors.bio?.message}
              {...register("bio")}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Location"
                placeholder="City, Country"
                error={errors.location?.message}
                {...register("location")}
              />
              <Input
                label="Company"
                placeholder="@company"
                error={errors.company?.message}
                {...register("company")}
              />
            </div>

            <Input
              label="Website"
              placeholder="https://example.com"
              type="url"
              error={errors.website?.message}
              {...register("website")}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdating}
                disabled={!isDirty}
              >
                Save changes
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
