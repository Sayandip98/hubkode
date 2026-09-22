import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleDot } from "lucide-react";
import { useCreateIssue } from "@hooks/useIssues.js";
import Input from "@components/common/Input.jsx";
import Textarea from "@components/common/Textarea.jsx";
import Button from "@components/common/Button.jsx";
import PageHeader from "@components/layout/PageHeader.jsx";

const schema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(500, "Title cannot exceed 500 characters"),
  body: z.string().max(65536).optional(),
});

const NewIssuePage = () => {
  const { owner, repoName } = useParams();
  const { mutate: createIssue, isPending } = useCreateIssue(owner, repoName);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const bodyValue = watch("body", "");

  const onSubmit = (data) => {
    createIssue(data);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="New issue" border={false} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="Brief description of the issue"
          required
          autoFocus
          error={errors.title?.message}
          {...register("title")}
        />

        <Textarea
          label="Description"
          placeholder="Provide more details about the issue, steps to reproduce, expected vs actual behavior..."
          rows={12}
          showCount
          maxLength={65536}
          value={bodyValue}
          error={errors.body?.message}
          {...register("body")}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
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
            leftIcon={!isPending && <CircleDot size={15} />}
          >
            Submit new issue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewIssuePage;
