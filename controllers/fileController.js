import { prisma } from "../lib/prisma.js";

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
