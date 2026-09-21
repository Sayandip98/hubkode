import logger from "../utils/logger.js";

const registerRepositorySocket = (io, socket) => {
  socket.on("repository:join", (fullName) => {
    if (!fullName) return;

    socket.join(`repo:${fullName}`);
    logger.info(`Socket ${socket.id} joined repository room: repo:${fullName}`);
  });

  socket.on("repository:leave", (fullName) => {
    if (!fullName) return;

    socket.leave(`repo:${fullName}`);
    logger.info(`Socket ${socket.id} left repository room: repo:${fullName}`);
  });
};

const emitRepositoryEvent = (io, fullName, event, data) => {
  io.to(`repo:${fullName}`).emit(event, data);
};

const emitIssueUpdate = (io, fullName, issue) => {
  emitRepositoryEvent(io, fullName, "repository:issue_updated", { issue });
};

const emitPRUpdate = (io, fullName, pullRequest) => {
  emitRepositoryEvent(io, fullName, "repository:pr_updated", { pullRequest });
};

const emitCommitPushed = (io, fullName, commit) => {
  emitRepositoryEvent(io, fullName, "repository:commit_pushed", { commit });
};

export {
  registerRepositorySocket,
  emitRepositoryEvent,
  emitIssueUpdate,
  emitPRUpdate,
  emitCommitPushed,
};
