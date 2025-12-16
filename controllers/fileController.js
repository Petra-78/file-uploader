import { prisma } from "../lib/prisma.js";
import path from "node:path";
import fs from "fs";

export async function renderNewFileForm(req, res, next) {
  try {
    const folderId = Number(req.params.folderId);
    const folder = await prisma.folders.findUnique({ where: { id: folderId } });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    res.render("partials/new-file", { currentFolder: folder });
  } catch (err) {
    next(err);
  }
}

export async function postFile(req, res, next) {
  try {
    const folderId = Number(req.params.folderId);
    const folder = await prisma.folders.findUnique({ where: { id: folderId } });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    const files = await prisma.files.create({
      data: {
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        folderId: folder.id,
        userId: req.user.id,
      },
    });

    console.log(files);

    res.redirect(`/folders/${folderId}`);
  } catch (err) {
    next(err);
  }
}

export async function fileDetails(req, res, next) {
  try {
    const folderId = Number(req.params.folderId);
    const fileId = Number(req.params.fileId);

    const file = await prisma.files.findUnique({
      where: { id: fileId },
      include: { folder: true },
    });

    if (!file || file.userId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    res.render("partials/file-details", { file, folderId });
  } catch (err) {
    next(err);
  }
}

export async function deleteFile(req, res, next) {
  try {
    const fileId = Number(req.params.fileId);
    const folderId = Number(req.params.folderId);

    const file = await prisma.files.findUnique({ where: { id: fileId } });

    if (!file || file.userId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }

    const filePath = path.join(process.cwd(), "public", file.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.files.delete({ where: { id: fileId } });

    res.redirect(`/folders/${folderId}`);
  } catch (err) {
    next(err);
  }
}
