import { prisma } from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";

export async function renderNewFileForm(req, res, next) {
  try {
    const folderId = Number(req.params.folderId);
    const folder = await prisma.folders.findUnique({ where: { id: folderId } });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).render("error", {
        status: 403,
        title: "Unauthorized",
        message: "Something went wrong",
      });
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
      return res.status(403).render("error", {
        status: 403,
        title: "Unauthorized",
        message: "Something went wrong",
      });
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).render("error", {
        status: 400,
        title: "File size too big",
        message: "",
      });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).render("error", {
        status: 400,
        title: "Invalid file type",
        message: "",
      });
    }

    const uploadFromBuffer = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `user_${req.user.id}/folders_${folderId}`,
            resource_type: "raw",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

    const result = await uploadFromBuffer(req.file.buffer);

    await prisma.files.create({
      data: {
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        mimeType: req.file.mimetype,
        size: req.file.size,
        folderId: folder.id,
        userId: req.user.id,
        publicId: result.public_id,
      },
    });

    res.redirect(`/folders/${folderId}`);
  } catch (err) {
    next(err);
  }
}

export async function fileDetails(req, res, next) {
  try {
    const fileId = Number(req.params.fileId);
    const file = await prisma.files.findUnique({
      where: { id: fileId },
      include: { folder: true },
    });

    if (!file || file.userId !== req.user.id) {
      return res.status(403).render("error", {
        status: 403,
        title: "Unauthorized",
        message: "Something went wrong",
      });
    }

    res.render("partials/file-details", { file, folderId: file.folderId });
  } catch (err) {
    next(err);
  }
}

export async function deleteFile(req, res, next) {
  try {
    const fileId = Number(req.params.fileId);
    const file = await prisma.files.findUnique({ where: { id: fileId } });

    if (!file || file.userId !== req.user.id) {
      return res.status(403).render("error", {
        status: 403,
        title: "Unauthorized",
        message: "Something went wrong",
      });
    }

    if (file.publicId) {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: "raw",
      });
    }

    await prisma.files.delete({ where: { id: fileId } });

    res.redirect(`/folders/${file.folderId}`);
  } catch (err) {
    next(err);
  }
}
