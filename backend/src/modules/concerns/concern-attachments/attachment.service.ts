import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

import { env } from "../../../config/env";
import { BadRequestError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types/auth.types";
import { concernService } from "../service/concern.service";

export const attachmentService = {
  async uploadImage(concernId: string, file: Express.Multer.File, actor: AuthenticatedUser) {
    await concernService.assertCanAddAttachment(concernId, actor);

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_BUCKET) {
      throw new BadRequestError("Supabase Storage is not configured");
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const extension = extensionForMimeType(file.mimetype);
    const storagePath = `concerns/${concernId}/${randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(env.SUPABASE_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw new BadRequestError("Image upload failed", [{ message: error.message }]);
    }

    const { data } = supabase.storage.from(env.SUPABASE_BUCKET).getPublicUrl(storagePath);

    try {
      return await concernService.addAttachment(
        concernId,
        {
          fileName: file.originalname,
          fileUrl: data.publicUrl,
          mimeType: file.mimetype,
          fileSize: file.size
        },
        actor
      );
    } catch (databaseError) {
      await supabase.storage.from(env.SUPABASE_BUCKET).remove([storagePath]);
      throw databaseError;
    }
  }
};

function extensionForMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };

  const extension = extensions[mimeType];
  if (!extension) throw new BadRequestError("Unsupported image type");
  return extension;
}
