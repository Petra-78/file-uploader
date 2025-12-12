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

export async function renderDashboard(req, res) {
  if (!req.user) return res.render("index");

  const folders = await prisma.folders.findMany({
    where: { userId: req.user.id, parentId: null },
  });

  let currentFolder = null;
  if (req.query.folderId) {
    const folderId = Number(req.query.folderId);
    const folder = await prisma.folders.findUnique({
      where: { id: folderId },
      include: { files: true, children: true },
    });
    if (folder && folder.userId === req.user.id) {
      currentFolder = folder;
    }
  }

  res.render("index", { folders, currentFolder });
}

export async function deleteFolder(req, res) {
  const folderId = Number(req.params.id);

  await prisma.files.deleteMany({ where: { folderId } });
  await prisma.folders.delete({ where: { id: folderId } });

  res.redirect("/folders");
}
