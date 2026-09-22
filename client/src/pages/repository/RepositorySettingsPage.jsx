import { useOutletContext, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import {
  useUpdateRepository,
  useDeleteRepository,
} from "@hooks/useRepository.js";
import Input from "@components/common/Input.jsx";
import Textarea from "@components/common/Textarea.jsx";
import Button from "@components/common/Button.jsx";
import Modal from "@components/common/Modal.jsx";
import PageHeader from "@components/layout/PageHeader.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";

const schema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/),
  description: z.string().max(500).optional(),
  website: z.string().max(255).optional(),
  isPrivate: z.boolean(),
  hasIssues: z.boolean(),
  hasWiki: z.boolean(),
  hasDiscussions: z.boolean(),
});

const RepositorySettingsPage = () => {
  const { owner, repoName } = useParams();
  const { repository, isOwner } = useOutletContext() || {};
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const { mutate: updateRepository, isPending: isUpdating } =
    useUpdateRepository(owner, repoName);

  const { mutate: deleteRepository, isPending: isDeleting } =
    useDeleteRepository(owner, repoName);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: repository?.name || "",
      description: repository?.description || "",
      website: repository?.website || "",
      isPrivate: repository?.isPrivate || false,
      hasIssues: repository?.hasIssues ?? true,
      hasWiki: repository?.hasWiki ?? true,
      hasDiscussions: repository?.hasDiscussions || false,
    },
  });

  const isPrivate = watch("isPrivate");
  const hasIssues = watch("hasIssues");
  const hasWiki = watch("hasWiki");
  const hasDiscussions = watch("hasDiscussions");

  if (!isOwner) {
    return (
      <ErrorMessage
        title="Access denied"
        message="Only the repository owner can access settings."
      />
    );
  }

  const onSubmit = (data) => {
    updateRepository(data);
  };

  const handleDelete = () => {
    if (deleteConfirmation === `${owner}/${repoName}`) {
      deleteRepository();
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Repository settings" border={false} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <section className="bg-surface-secondary border border-border-default rounded-lg p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border-muted pb-3">
            General
          </h2>

          <Input
            label="Repository name"
            required
            error={errors.name?.message}
            {...register("name")}
          />

          <Textarea label="Description" rows={3} {...register("description")} />

          <Input
            label="Website"
            type="url"
            placeholder="https://example.com"
            {...register("website")}
          />
        </section>

        <section className="bg-surface-secondary border border-border-default rounded-lg p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border-muted pb-3">
            Features
          </h2>

          {[
            { field: "hasIssues", label: "Issues", value: hasIssues },
            { field: "hasWiki", label: "Wikis", value: hasWiki },
            {
              field: "hasDiscussions",
              label: "Discussions",
              value: hasDiscussions,
            },
          ].map(({ field, label, value }) => (
            <label
              key={field}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setValue(field, e.target.checked)}
                className="accent-brand-500"
              />
              <span className="text-sm text-text-primary">{label}</span>
            </label>
          ))}
        </section>

        <section className="bg-surface-secondary border border-border-default rounded-lg p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-primary border-b border-border-muted pb-3">
            Visibility
          </h2>

          <div className="flex flex-col gap-3">
            {[
              {
                value: false,
                label: "Public",
                desc: "Anyone can see this repository.",
              },
              {
                value: true,
                label: "Private",
                desc: "Only you and collaborators can see this.",
              },
            ].map((option) => (
              <label
                key={String(option.value)}
                className="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={isPrivate === option.value}
                  onChange={() => setValue("isPrivate", option.value)}
                  className="mt-0.5 accent-brand-500"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {option.label}
                  </p>
                  <p className="text-xs text-text-secondary">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
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

      <section className="mt-8 bg-surface-secondary border border-accent-red/30 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-accent-red mb-1">
          Danger zone
        </h2>
        <p className="text-xs text-text-secondary mb-4">
          Once you delete a repository, there is no going back.
        </p>
        <Button
          variant="danger"
          size="sm"
          leftIcon={<Trash2 size={14} />}
          onClick={() => setShowDeleteModal(true)}
        >
          Delete this repository
        </Button>
      </section>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation("");
        }}
        title="Delete repository"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              disabled={deleteConfirmation !== `${owner}/${repoName}`}
              onClick={handleDelete}
            >
              Delete repository
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 bg-gh-danger-muted border border-accent-red/20 rounded-lg">
            <AlertTriangle
              size={16}
              className="text-accent-red shrink-0 mt-0.5"
            />
            <p className="text-sm text-text-primary">
              This action <strong>cannot be undone</strong>. This will
              permanently delete the{" "}
              <strong>
                {owner}/{repoName}
              </strong>{" "}
              repository.
            </p>
          </div>

          <Input
            label={`Type "${owner}/${repoName}" to confirm`}
            placeholder={`${owner}/${repoName}`}
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default RepositorySettingsPage;
