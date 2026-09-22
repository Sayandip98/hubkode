import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as orgService from "@services/organization.service.js";
import Input from "@components/common/Input.jsx";
import Textarea from "@components/common/Textarea.jsx";
import Button from "@components/common/Button.jsx";
import PageHeader from "@components/layout/PageHeader.jsx";
import ROUTES from "@constants/routes.js";
import toast from "react-hot-toast";

const schema = z.object({
  name: z
    .string()
    .min(3, "Organization name must be at least 3 characters")
    .max(39, "Organization name cannot exceed 39 characters")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "Only alphanumeric characters and hyphens allowed",
    ),
  displayName: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  website: z.string().max(255).optional(),
  location: z.string().max(100).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

const NewOrganizationPage = () => {
  const navigate = useNavigate();

  const { mutate: createOrg, isPending } = useMutation({
    mutationFn: orgService.createOrganization,
    onSuccess: (response) => {
      const org = response.data.organization;
      toast.success("Organization created successfully");
      navigate(ROUTES.ORGANIZATIONS.DETAIL(org.name));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create organization");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data) => {
    createOrg(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Create a new organization"
        description="Organizations are shared accounts that help you collaborate across many projects."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="bg-surface-secondary border border-border-default rounded-lg p-6 flex flex-col gap-5">
          <Input
            label="Organization name"
            placeholder="my-organization"
            required
            error={errors.name?.message}
            hint="This will be your organization's unique identifier."
            {...register("name")}
          />

          <Input
            label="Display name"
            placeholder="My Organization"
            error={errors.displayName?.message}
            hint="This is the friendly name shown on your organization's profile."
            {...register("displayName")}
          />

          <Textarea
            label="Description"
            placeholder="Tell people what your organization does..."
            rows={3}
            {...register("description")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Website"
              placeholder="https://example.com"
              type="url"
              error={errors.website?.message}
              {...register("website")}
            />

            <Input
              label="Location"
              placeholder="San Francisco, CA"
              {...register("location")}
            />
          </div>

          <Input
            label="Email"
            placeholder="org@example.com"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            leftIcon={!isPending && <Building2 size={15} />}
          >
            Create organization
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewOrganizationPage;
