import { z } from 'zod';

export const MAX_PDF_BYTES = 50 * 1024 * 1024;

const uploadVoiceSchema = z.enum([
  'dave',
  'daniel',
  'chris',
  'rachel',
  'sarah',
]);

export type UploadVoiceId = z.infer<typeof uploadVoiceSchema>;

export const UploadSchema = z.object({
  pdfFile: z
    .custom<File | undefined>(
      (val) => val === undefined || val instanceof File,
      'Invalid file',
    )
    .refine((val) => val instanceof File, { message: 'Please select a PDF' })
    .refine(
      (val) => !val || val.size <= MAX_PDF_BYTES,
      { message: 'PDF must be at most 50MB' },
    ),
  coverImage: z
    .custom<File | undefined>(
      (val) => val === undefined || val instanceof File,
      'Invalid file',
    )
    .optional(),
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author name is required').max(200),
  voice: uploadVoiceSchema,
});

export { uploadVoiceSchema };
