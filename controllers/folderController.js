import { prisma } from "../lib/prisma.js";

export async function createFolder(req, res) {
  const { name, parentId } = req.body;

  await prisma.folders.create({
    data: {
      name,
      userId: req.user.id,
      parentId: parentId ? Number(parentId) : null,
    },
  });

  res.redirect("/");
}

export async function renderFolders(req, res) {
  const allFolders = await prisma.folders.findMany({
    where: { userId: req.user.id, parentId: null },
  });

  res.render("index", { folders: allFolders });
}

export async function viewFolder(req, res) {
  const folderId = Number(req.params.id);

  const folder = await prisma.folders.findUnique({
    where: { id: folderId },
    include: {
      children: true,
      files: true,
    },
  });

  if (!folder || folder.userId !== req.user.id) {
    return res.status(403).send("Unauthorized");
  }

  res.render("folder-view", { folder });
}

export async function deleteFolder(req, res) {
  const folderId = Number(req.params.id);

  await prisma.files.deleteMany({ where: { folderId } });
  await prisma.folders.delete({ where: { id: folderId } });

  res.redirect("/folders");
}
