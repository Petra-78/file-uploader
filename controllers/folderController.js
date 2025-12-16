import { prisma } from "../lib/prisma.js";

export async function createFolder(req, res, next) {
  try {
    const { name, parentId } = req.body;

    const folder = await prisma.folders.create({
      data: {
        name,
        userId: req.user.id,
        parentId: parentId ? Number(parentId) : null,
      },
    });

    res.redirect(`/folders/${folder.id}`);
  } catch (err) {
    next(err);
  }
}

export async function renderDashboard(req, res) {
  if (!req.user) return res.render("index");

  const folders = await prisma.folders.findMany({
    where: { userId: req.user.id, parentId: null },
  });

  let currentFolder = null;

  if (req.params.id) {
    const folderId = Number(req.params.id);

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

  const childFolders = await prisma.folders.findMany({
    where: { parentId: folderId },
  });

  for (const child of childFolders) {
    await deleteFolder({ params: { id: child.id }, user: req.user }, res);
  }
  await prisma.folders.delete({ where: { id: folderId } });

  res.redirect("/");
}
