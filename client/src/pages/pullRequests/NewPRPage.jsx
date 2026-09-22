import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GitPullRequest } from "lucide-react";
import { useCreatePullRequest } from "@hooks/usePullRequests.js";
import { useBranches } from "@hooks/useRepository.js";
import Input from "@components/common/Input.jsx";
import Textarea from "@components/common/Textarea.jsx";
import Select from "@components/common/Select.jsx";
import Button from "@components/common/Button.jsx";
import PageHeader from "@components/layout/PageHeader.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  body: z.string().max(65536).optional(),
  sourceBranch: z.string().min(1, "Source branch is required"),
  targetBranch: z.string().min(1, "Target branch is required"),
  isDraft: z.boolean().default(false),
});

const NewPRPage = () => {
  const { owner, repoName } = useParams();
  const { mutate: createPR, isPending } = useCreatePullRequest(owner, repoName);
  const { data: branches, isLoading: loadingBranches } = useBranches(
    owner,
    repoName,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isDraft: false },
  });

  const isDraft = watch("isDraft");
  const bodyValue = watch("body", "");

  const branchOptions = (branches || []).map((b) => ({
    value: b.name,
    label: b.name,
  }));

  const onSubmit = (data) => {
    createPR(data);
  };

  if (loadingBranches) return <PageLoader label="Loading branches..." />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Open a pull request" border={false} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="bg-surface-secondary border border-border-default rounded-lg p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Base branch"
              options={branchOptions}
              placeholder="Select base..."
              required
              error={errors.targetBranch?.message}
              {...register("targetBranch")}
            />
            <Select
              label="Compare branch"
              options={branchOptions}
              placeholder="Select compare..."
              required
              error={errors.sourceBranch?.message}
              {...register("sourceBranch")}
            />
          </div>
        </div>

        <Input
          label="Title"
          placeholder="Brief description of your changes"
          required
          autoFocus
          error={errors.title?.message}
          {...register("title")}
        />

        <Textarea
          label="Description"
          placeholder="Describe what changes you made and why..."
          rows={10}
          showCount
          maxLength={65536}
          value={bodyValue}
          error={errors.body?.message}
          {...register("body")}
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDraft}
            onChange={(e) => setValue("isDraft", e.target.checked)}
            className="accent-brand-500"
          />
          <div>
            <p className="text-sm font-medium text-text-primary">
              Create as draft
            </p>
            <p className="text-xs text-text-secondary">
              Draft pull requests cannot be merged until marked ready for
              review.
            </p>
          </div>
        </label>

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
            leftIcon={!isPending && <GitPullRequest size={15} />}
          >
            {isDraft ? "Create draft pull request" : "Create pull request"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewPRPage;
