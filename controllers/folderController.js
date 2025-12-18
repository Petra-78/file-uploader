import { prisma } from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";

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
  try {
    if (!req.user) return res.render("index");

    const allFolders = await prisma.folders.findMany({
      where: { userId: req.user.id },
    });

    let currentFolder = null;

    if (req.params.id) {
      const folderId = Number(req.params.id);
      currentFolder = await prisma.folders.findUnique({
        where: { id: folderId },
        include: { files: true },
      });

      if (!currentFolder) {
        return res.redirect("/error");
      }
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
  } catch (err) {
    console.error(err);
    return res.render("error");
  }
}

export async function deleteFolder(req, res, next) {
  try {
    const folderId = Number(req.params.id);

    const folder = await prisma.folders.findUnique({ where: { id: folderId } });
    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    const files = await prisma.files.findMany({ where: { folderId } });
    for (const file of files) {
      if (file.publicId) {
        try {
          await cloudinary.uploader.destroy(file.publicId, {
            resource_type: "raw",
          });
        } catch (err) {
          console.error(
            `Failed to delete Cloudinary file ${file.fileUrl}:`,
            err
          );
        }
      }
      await prisma.files.delete({ where: { id: file.id } });
    }

    const childFolders = await prisma.folders.findMany({
      where: { parentId: folderId },
    });
    for (const child of childFolders) {
      await deleteFolder({ params: { id: child.id }, user: req.user }, res);
    }

    await prisma.folders.delete({ where: { id: folderId } });

    next();
  } catch (err) {
    next(err);
  }
}
