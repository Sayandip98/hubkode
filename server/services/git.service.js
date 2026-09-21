import git from "isomorphic-git";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mime from "mime-types";
import Repository from "../models/Repository.js";
import Branch from "../models/Branch.js";
import Commit from "../models/Commit.js";
import { ApiError } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPOS_BASE_PATH = path.join(__dirname, "../../repos");

const getRepoPath = (fullName) => {
  return path.join(REPOS_BASE_PATH, fullName);
};

const ensureRepoDirectory = async (repoPath) => {
  await fs.promises.mkdir(repoPath, { recursive: true });
};

const initRepository = async (repository, user) => {
  const repoPath = getRepoPath(repository.fullName);

  await ensureRepoDirectory(repoPath);

  await git.init({ fs, dir: repoPath, defaultBranch: "main" });

  const readmePath = path.join(repoPath, "README.md");
  const readmeContent = `# ${repository.name}\n\n${repository.description || ""}\n`;
  await fs.promises.writeFile(readmePath, readmeContent);

  await git.add({ fs, dir: repoPath, filepath: "README.md" });

  const sha = await git.commit({
    fs,
    dir: repoPath,
    message: "Initial commit",
    author: {
      name: user.displayName || user.username,
      email: user.email,
    },
  });

  const branch = await Branch.create({
    name: "main",
    repository: repository._id,
    isDefault: true,
    isProtected: false,
    createdBy: user._id,
    latestCommitSha: sha,
  });

  const commit = await Commit.create({
    sha,
    repository: repository._id,
    branch: branch._id,
    message: "Initial commit",
    author: {
      user: user._id,
      name: user.displayName || user.username,
      email: user.email,
      date: new Date(),
    },
    committer: {
      name: user.displayName || user.username,
      email: user.email,
      date: new Date(),
    },
    parents: [],
    stats: {
      additions: 1,
      deletions: 0,
      filesChanged: 1,
    },
    files: [
      {
        path: "README.md",
        status: "added",
        additions: 1,
        deletions: 0,
      },
    ],
  });

  await Branch.findByIdAndUpdate(branch._id, {
    latestCommit: commit._id,
  });

  await Repository.findByIdAndUpdate(repository._id, {
    isInitialized: true,
    lastPushedAt: new Date(),
  });

  return { branch, commit };
};

const getBranches = async (repository) => {
  const repoPath = getRepoPath(repository.fullName);

  const branches = await Branch.find({ repository: repository._id })
    .populate("latestCommit")
    .populate("createdBy", "username displayName avatarUrl")
    .sort({ isDefault: -1, createdAt: -1 });

  return branches;
};

const createBranch = async (repository, branchName, sourceBranch, user) => {
  const repoPath = getRepoPath(repository.fullName);

  const existingBranch = await Branch.findOne({
    repository: repository._id,
    name: branchName,
  });

  if (existingBranch) {
    throw new ApiError(409, `Branch "${branchName}" already exists`);
  }

  const sourceRef = await Branch.findOne({
    repository: repository._id,
    name: sourceBranch,
  });

  if (!sourceRef) {
    throw new ApiError(404, `Source branch "${sourceBranch}" not found`);
  }

  await git.branch({
    fs,
    dir: repoPath,
    ref: branchName,
    object: sourceRef.latestCommitSha,
    checkout: false,
  });

  const branch = await Branch.create({
    name: branchName,
    repository: repository._id,
    isDefault: false,
    isProtected: false,
    createdBy: user._id,
    latestCommit: sourceRef.latestCommit,
    latestCommitSha: sourceRef.latestCommitSha,
  });

  return branch;
};

const deleteBranch = async (repository, branchName) => {
  const repoPath = getRepoPath(repository.fullName);

  const branch = await Branch.findOne({
    repository: repository._id,
    name: branchName,
  });

  if (!branch) {
    throw new ApiError(404, `Branch "${branchName}" not found`);
  }

  if (branch.isDefault) {
    throw new ApiError(400, "Cannot delete the default branch");
  }

  if (branch.isProtected) {
    throw new ApiError(
      403,
      `Branch "${branchName}" is protected and cannot be deleted`,
    );
  }

  await git.deleteBranch({ fs, dir: repoPath, ref: branchName });
  await Branch.findByIdAndDelete(branch._id);

  return { message: `Branch "${branchName}" deleted successfully` };
};

const getFileTree = async (repository, branchName, treePath = "") => {
  const repoPath = getRepoPath(repository.fullName);

  const branch = await Branch.findOne({
    repository: repository._id,
    name: branchName,
  });

  if (!branch) {
    throw new ApiError(404, `Branch "${branchName}" not found`);
  }

  const commitSha = branch.latestCommitSha;

  if (!commitSha) {
    return { tree: [], path: treePath, branch: branchName };
  }

  const commitObject = await git.readCommit({
    fs,
    dir: repoPath,
    oid: commitSha,
  });

  let treeOid = commitObject.commit.tree;

  if (treePath) {
    const pathParts = treePath.split("/").filter(Boolean);

    for (const part of pathParts) {
      const treeEntries = await git.readTree({
        fs,
        dir: repoPath,
        oid: treeOid,
      });
      const entry = treeEntries.tree.find((e) => e.path === part);

      if (!entry) {
        throw new ApiError(404, `Path "${treePath}" not found`);
      }

      if (entry.type !== "tree") {
        throw new ApiError(400, `"${treePath}" is a file, not a directory`);
      }

      treeOid = entry.oid;
    }
  }

  const treeResult = await git.readTree({ fs, dir: repoPath, oid: treeOid });

  const tree = await Promise.all(
    treeResult.tree.map(async (entry) => {
      const lastCommit = await getLastCommitForPath(
        repoPath,
        commitSha,
        treePath ? `${treePath}/${entry.path}` : entry.path,
      );

      return {
        name: entry.path,
        type: entry.type === "tree" ? "dir" : "file",
        oid: entry.oid,
        mode: entry.mode,
        path: treePath ? `${treePath}/${entry.path}` : entry.path,
        mimeType:
          entry.type === "blob"
            ? mime.lookup(entry.path) || "application/octet-stream"
            : null,
        lastCommit,
      };
    }),
  );

  tree.sort((a, b) => {
    if (a.type === "dir" && b.type !== "dir") return -1;
    if (a.type !== "dir" && b.type === "dir") return 1;
    return a.name.localeCompare(b.name);
  });

  return { tree, path: treePath, branch: branchName };
};

const getLastCommitForPath = async (repoPath, commitSha, filePath) => {
  try {
    const commits = await git.log({
      fs,
      dir: repoPath,
      ref: commitSha,
      depth: 50,
    });

    for (const commitEntry of commits) {
      if (commitEntry.oid === commitSha) continue;

      try {
        const [A, B] = await Promise.all([
          git.readCommit({ fs, dir: repoPath, oid: commitEntry.oid }),
          git.readCommit({ fs, dir: repoPath, oid: commitSha }),
        ]);

        const [treeA, treeB] = await Promise.all([
          getTreeEntry(repoPath, A.commit.tree, filePath),
          getTreeEntry(repoPath, B.commit.tree, filePath),
        ]);

        if (treeA?.oid !== treeB?.oid) {
          return {
            sha: commitSha,
            message: B.commit.message.split("\n")[0],
            date: new Date(B.commit.author.timestamp * 1000),
            author: B.commit.author.name,
          };
        }

        commitSha = commitEntry.oid;
      } catch {
        break;
      }
    }

    const latestCommit = await git.readCommit({
      fs,
      dir: repoPath,
      oid: commitSha,
    });
    return {
      sha: latestCommit.oid,
      message: latestCommit.commit.message.split("\n")[0],
      date: new Date(latestCommit.commit.author.timestamp * 1000),
      author: latestCommit.commit.author.name,
    };
  } catch {
    return null;
  }
};

const getTreeEntry = async (repoPath, treeOid, filePath) => {
  try {
    const parts = filePath.split("/").filter(Boolean);
    let currentOid = treeOid;

    for (let i = 0; i < parts.length; i++) {
      const tree = await git.readTree({ fs, dir: repoPath, oid: currentOid });
      const entry = tree.tree.find((e) => e.path === parts[i]);

      if (!entry) return null;
      if (i === parts.length - 1) return entry;

      currentOid = entry.oid;
    }

    return null;
  } catch {
    return null;
  }
};

const getFileContent = async (repository, branchName, filePath) => {
  const repoPath = getRepoPath(repository.fullName);

  const branch = await Branch.findOne({
    repository: repository._id,
    name: branchName,
  });

  if (!branch) {
    throw new ApiError(404, `Branch "${branchName}" not found`);
  }

  const commitObject = await git.readCommit({
    fs,
    dir: repoPath,
    oid: branch.latestCommitSha,
  });

  const pathParts = filePath.split("/").filter(Boolean);
  let currentOid = commitObject.commit.tree;

  for (let i = 0; i < pathParts.length; i++) {
    const tree = await git.readTree({ fs, dir: repoPath, oid: currentOid });
    const entry = tree.tree.find((e) => e.path === pathParts[i]);

    if (!entry) {
      throw new ApiError(404, `File "${filePath}" not found`);
    }

    if (i === pathParts.length - 1) {
      if (entry.type !== "blob") {
        throw new ApiError(400, `"${filePath}" is a directory, not a file`);
      }

      const blobResult = await git.readBlob({
        fs,
        dir: repoPath,
        oid: entry.oid,
      });

      const mimeType = mime.lookup(filePath) || "application/octet-stream";
      const isBinary = isBinaryFile(blobResult.blob);
      const content = isBinary
        ? null
        : Buffer.from(blobResult.blob).toString("utf-8");

      return {
        path: filePath,
        name: pathParts[pathParts.length - 1],
        content,
        isBinary,
        size: blobResult.blob.byteLength,
        mimeType,
        encoding: isBinary ? "binary" : "utf-8",
        oid: entry.oid,
        branch: branchName,
      };
    }

    if (entry.type !== "tree") {
      throw new ApiError(404, `Path "${filePath}" not found`);
    }

    currentOid = entry.oid;
  }

  throw new ApiError(404, `File "${filePath}" not found`);
};

const isBinaryFile = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const checkLength = Math.min(bytes.length, 8000);

  for (let i = 0; i < checkLength; i++) {
    const byte = bytes[i];
    if (byte === 0) return true;
    if (byte < 8 || (byte > 13 && byte < 32 && byte !== 27)) {
      return true;
    }
  }

  return false;
};

const getCommitHistory = async (repository, branchName, query) => {
  const repoPath = getRepoPath(repository.fullName);

  const branch = await Branch.findOne({
    repository: repository._id,
    name: branchName,
  });

  if (!branch) {
    throw new ApiError(404, `Branch "${branchName}" not found`);
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const commits = await Commit.find({
    repository: repository._id,
    branch: branch._id,
  })
    .populate("author.user", "username displayName avatarUrl")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Commit.countDocuments({
    repository: repository._id,
    branch: branch._id,
  });

  return {
    commits,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getCommitBySha = async (repository, sha) => {
  const repoPath = getRepoPath(repository.fullName);

  const commit = await Commit.findOne({
    repository: repository._id,
    sha,
  })
    .populate("author.user", "username displayName avatarUrl")
    .populate("branch", "name");

  if (!commit) {
    throw new ApiError(404, `Commit "${sha}" not found`);
  }

  let diff = null;

  try {
    const gitCommit = await git.readCommit({ fs, dir: repoPath, oid: sha });

    if (gitCommit.commit.parent && gitCommit.commit.parent.length > 0) {
      const parentSha = gitCommit.commit.parent[0];

      diff = await git.walk({
        fs,
        dir: repoPath,
        trees: [git.TREE({ ref: parentSha }), git.TREE({ ref: sha })],
        map: async (filepath, [parentEntry, currentEntry]) => {
          if (filepath === ".") return;

          const parentOid = parentEntry ? await parentEntry.oid() : null;
          const currentOid = currentEntry ? await currentEntry.oid() : null;

          if (parentOid === currentOid) return;

          let status = "modified";
          if (!parentOid) status = "added";
          if (!currentOid) status = "deleted";

          return { path: filepath, status, parentOid, currentOid };
        },
      });

      diff = diff.filter(Boolean);
    }
  } catch (error) {
    logger.warn(`Could not generate diff for commit ${sha}: ${error.message}`);
  }

  return { commit, diff };
};

const createCommit = async ({
  repository,
  branch,
  message,
  description,
  files,
  user,
}) => {
  const repoPath = getRepoPath(repository.fullName);

  const branchDoc = await Branch.findOne({
    repository: repository._id,
    name: branch,
  });

  if (!branchDoc) {
    throw new ApiError(404, `Branch "${branch}" not found`);
  }

  if (branchDoc.isProtected) {
    throw new ApiError(403, `Branch "${branch}" is protected`);
  }

  await git.checkout({ fs, dir: repoPath, ref: branch });

  for (const file of files) {
    const absolutePath = path.join(repoPath, file.path);

    if (file.action === "delete") {
      await fs.promises.unlink(absolutePath);
      await git.remove({ fs, dir: repoPath, filepath: file.path });
    } else {
      await fs.promises.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.promises.writeFile(absolutePath, file.content || "");
      await git.add({ fs, dir: repoPath, filepath: file.path });
    }
  }

  const sha = await git.commit({
    fs,
    dir: repoPath,
    message: description ? `${message}\n\n${description}` : message,
    author: {
      name: user.displayName || user.username,
      email: user.email,
    },
  });

  const commitFiles = files.map((file) => ({
    path: file.path,
    status:
      file.action === "delete" ? "deleted" : file.isNew ? "added" : "modified",
    additions: file.additions || 0,
    deletions: file.deletions || 0,
  }));

  const commit = await Commit.create({
    sha,
    repository: repository._id,
    branch: branchDoc._id,
    message,
    description: description || "",
    author: {
      user: user._id,
      name: user.displayName || user.username,
      email: user.email,
      date: new Date(),
    },
    committer: {
      name: user.displayName || user.username,
      email: user.email,
      date: new Date(),
    },
    parents: branchDoc.latestCommitSha ? [branchDoc.latestCommitSha] : [],
    files: commitFiles,
    stats: {
      additions: files.reduce((sum, f) => sum + (f.additions || 0), 0),
      deletions: files.reduce((sum, f) => sum + (f.deletions || 0), 0),
      filesChanged: files.length,
    },
  });

  await Branch.findByIdAndUpdate(branchDoc._id, {
    latestCommit: commit._id,
    latestCommitSha: sha,
  });

  await Repository.findByIdAndUpdate(repository._id, {
    lastPushedAt: new Date(),
  });

  return commit;
};

const deleteRepositoryFromDisk = async (fullName) => {
  const repoPath = getRepoPath(fullName);

  try {
    await fs.promises.rm(repoPath, { recursive: true, force: true });
    logger.info(`Repository "${fullName}" deleted from disk`);
  } catch (error) {
    logger.warn(`Failed to delete repository from disk: ${error.message}`);
  }
};

export {
  initRepository,
  getBranches,
  createBranch,
  deleteBranch,
  getFileTree,
  getFileContent,
  getCommitHistory,
  getCommitBySha,
  createCommit,
  deleteRepositoryFromDisk,
  getRepoPath,
};
