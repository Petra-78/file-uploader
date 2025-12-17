import { prisma } from "../lib/prisma.js";
import path from "node:path";
import fs from "fs/promises";

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

  const allFolders = await prisma.folders.findMany({
    where: { userId: req.user.id },
  });

  let currentFolder = null;

  if (req.params.id) {
    const folderId = Number(req.params.id);
    const folder = await prisma.folders.findUnique({
      where: { id: folderId },
      include: { files: true },
    });
    if (folder) currentFolder = folder;
  }

  let openPath = [];
  if (currentFolder) {
    let parent = currentFolder;
    while (parent?.parentId) {
      openPath.push(parent.parentId);
      parent = allFolders.find((f) => f.id === parent.parentId);
    }
  }

  res.render("index", {
    folders: allFolders.filter((f) => !f.parentId),
    allFolders,
    currentFolder,
    openPath,
  });
}

export async function deleteFolder(req, res) {
  const folderId = Number(req.params.id);
  const files = await prisma.files.findMany({ where: { folderId } });
  for (const file of files) {
    try {
      await fs.unlink(path.join(process.cwd(), "public", file.fileUrl));
    } catch (err) {
      console.error(`Failed to delete file ${file.fileUrl}:`, err);
    }
  }
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

async function getFolderPath(folderId) {
  const path = [];

  let current = await prisma.folders.findUnique({
    where: { id: folderId },
  });

  while (current) {
    path.unshift(current.id);

    if (!current.parentId) break;

    current = await prisma.folders.findUnique({
      where: { id: current.parentId },
    });
  }

  return path;
}
