import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen } from "lucide-react";
import { useCreateRepository } from "@hooks/useRepository.js";
import Input from "@components/common/Input.jsx";
import Textarea from "@components/common/Textarea.jsx";
import Button from "@components/common/Button.jsx";
import PageHeader from "@components/layout/PageHeader.jsx";

const schema = z.object({
  name: z
    .string()
    .min(1, "Repository name is required")
    .max(100, "Repository name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Only alphanumeric characters, hyphens, underscores, and dots allowed",
    ),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
  autoInit: z.boolean().default(false),
  hasIssues: z.boolean().default(true),
  hasWiki: z.boolean().default(true),
});

const NewRepositoryPage = () => {
  const { mutate: createRepository, isPending } = useCreateRepository();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      isPrivate: false,
      autoInit: false,
      hasIssues: true,
      hasWiki: true,
    },
  });

  const isPrivate = watch("isPrivate");
  const autoInit = watch("autoInit");

  const onSubmit = (data) => {
    createRepository(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Create a new repository"
        description="A repository contains all project files, including the revision history."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="bg-surface-secondary border border-border-default rounded-lg p-6 flex flex-col gap-5">
          <Input
            label="Repository name"
            placeholder="my-awesome-project"
            required
            error={errors.name?.message}
            hint="Great repository names are short and memorable."
            {...register("name")}
          />

          <Textarea
            label="Description"
            placeholder="A short description of your repository (optional)"
            rows={3}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-text-primary">Visibility</p>

            <label className="flex items-start gap-3 p-3 border border-border-default rounded-lg cursor-pointer hover:bg-surface-tertiary transition-colors">
              <input
                type="radio"
                name="visibility"
                checked={!isPrivate}
                onChange={() => setValue("isPrivate", false)}
                className="mt-0.5 accent-brand-500"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">Public</p>
                <p className="text-xs text-text-secondary">
                  Anyone can see this repository. You choose who can commit.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-border-default rounded-lg cursor-pointer hover:bg-surface-tertiary transition-colors">
              <input
                type="radio"
                name="visibility"
                checked={isPrivate}
                onChange={() => setValue("isPrivate", true)}
                className="mt-0.5 accent-brand-500"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">Private</p>
                <p className="text-xs text-text-secondary">
                  You choose who can see and commit to this repository.
                </p>
              </div>
            </label>
          </div>

          <div className="border-t border-border-muted pt-4 flex flex-col gap-3">
            <p className="text-sm font-medium text-text-primary">
              Initialize this repository
            </p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoInit}
                onChange={(e) => setValue("autoInit", e.target.checked)}
                className="mt-0.5 accent-brand-500"
              />
              <div>
                <p className="text-sm text-text-primary">Add a README file</p>
                <p className="text-xs text-text-secondary">
                  This will let you clone the repository immediately.
                </p>
              </div>
            </label>
          </div>
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
            leftIcon={!isPending && <BookOpen size={15} />}
          >
            Create repository
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewRepositoryPage;
