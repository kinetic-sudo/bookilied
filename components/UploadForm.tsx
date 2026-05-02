'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, Upload, X } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import LoadingOverlay from '@/components/LoadingOverlay';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UploadSchema, type UploadVoiceId } from '@/lib/zod';
import { cn } from '@/lib/utils';

type UploadFormInput = z.input<typeof UploadSchema>;
type UploadFormOutput = z.infer<typeof UploadSchema>;

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}

const dropzoneFrame =
  'border-2 border-dashed border-[#d4c4a8] rounded-[6px] transition-colors';

const maleVoices: {
  id: UploadVoiceId;
  name: string;
  description: string;
}[] = [
  {
    id: 'dave',
    name: 'Dave',
    description: 'Young male, British-Essex, casual & conversational',
  },
  {
    id: 'daniel',
    name: 'Daniel',
    description: 'Mature male, British, warm & articulate',
  },
  {
    id: 'chris',
    name: 'Chris',
    description: 'Male, American, confident & friendly',
  },
];

const femaleVoices: {
  id: UploadVoiceId;
  name: string;
  description: string;
}[] = [
  {
    id: 'rachel',
    name: 'Rachel',
    description: 'Young female, American, calm & clear',
  },
  {
    id: 'sarah',
    name: 'Sarah',
    description: 'Female, British, expressive & engaging',
  },
];

const UploadForm = () => {
  const pdfInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const voiceGroupLabelId = React.useId();

  const form = useForm<UploadFormInput, unknown, UploadFormOutput>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      pdfFile: undefined,
      coverImage: undefined,
      title: '',
      author: '',
      voice: 'rachel',
    },
  });

  const onSubmit = async (data: UploadFormOutput) => {
    await new Promise((r) => setTimeout(r, 1400));
    console.log('book upload', {
      title: data.title,
      author: data.author,
      voice: data.voice,
      pdfName: data.pdfFile.name,
      coverName: data.coverImage?.name,
    });
  };

  return (
    <div className="new-book-wrapper">
      <LoadingOverlay open={form.formState.isSubmitting} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8 space-y-8"
        >
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Book PDF File</FormLabel>
                <div
                  className={cn(
                    'upload-dropzone',
                    dropzoneFrame,
                    field.value instanceof File &&
                      'upload-dropzone-uploaded !h-auto min-h-[165px] !flex-row !justify-between px-5 py-6',
                  )}
                  role="presentation"
                  tabIndex={-1}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file?.type === 'application/pdf') {
                      field.onChange(file);
                    }
                  }}
                >
                  <FormControl>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file ?? undefined);
                      }}
                      ref={mergeRefs(field.ref, pdfInputRef)}
                    />
                  </FormControl>
                  {field.value instanceof File ? (
                    <>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="upload-dropzone-text truncate font-medium">
                          {field.value.name}
                        </p>
                        <p className="upload-dropzone-hint">
                          {(field.value.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        className="upload-dropzone-remove shrink-0"
                        aria-label="Remove PDF"
                        onClick={(e) => {
                          e.stopPropagation();
                          field.onChange(undefined);
                          if (pdfInputRef.current) {
                            pdfInputRef.current.value = '';
                          }
                        }}
                      >
                        <X className="size-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="file-upload-shadow flex w-full flex-col items-center border-0 bg-transparent p-0"
                      onClick={() => pdfInputRef.current?.click()}
                    >
                      <Upload
                        className="upload-dropzone-icon"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                      <span className="upload-dropzone-text">
                        Click to upload PDF
                      </span>
                      <span className="upload-dropzone-hint">
                        PDF file (max 50MB)
                      </span>
                    </button>
                  )}
                </div>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">
                  Cover Image (Optional)
                </FormLabel>
                <div
                  className={cn(
                    'upload-dropzone',
                    dropzoneFrame,
                    field.value instanceof File &&
                      'upload-dropzone-uploaded !h-auto min-h-[165px] !flex-row !justify-between px-5 py-6',
                  )}
                  role="presentation"
                  tabIndex={-1}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file?.type.startsWith('image/')) {
                      field.onChange(file);
                    }
                  }}
                >
                  <FormControl>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file ?? undefined);
                      }}
                      ref={mergeRefs(field.ref, coverInputRef)}
                    />
                  </FormControl>
                  {field.value instanceof File ? (
                    <>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="upload-dropzone-text truncate font-medium">
                          {field.value.name}
                        </p>
                        <p className="upload-dropzone-hint">Cover image</p>
                      </div>
                      <button
                        type="button"
                        className="upload-dropzone-remove shrink-0"
                        aria-label="Remove cover image"
                        onClick={(e) => {
                          e.stopPropagation();
                          field.onChange(undefined);
                          if (coverInputRef.current) {
                            coverInputRef.current.value = '';
                          }
                        }}
                      >
                        <X className="size-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="file-upload-shadow flex w-full flex-col items-center border-0 bg-transparent p-0"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <ImageIcon
                        className="upload-dropzone-icon"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                      <span className="upload-dropzone-text">
                        Click to upload cover image
                      </span>
                      <span className="upload-dropzone-hint">
                        Leave empty to auto-generate from PDF
                      </span>
                    </button>
                  )}
                </div>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Title</FormLabel>
                <FormControl>
                  <Input
                    className="form-input !h-auto border-0 shadow-none focus-visible:ring-0 md:text-lg"
                    placeholder="ex: Rich Dad Poor Dad"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Author Name</FormLabel>
                <FormControl>
                  <Input
                    className="form-input !h-auto border-0 shadow-none focus-visible:ring-0 md:text-lg"
                    placeholder="ex: Robert Kiyosaki"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem className="space-y-6">
                <p id={voiceGroupLabelId} className="form-label">
                  Choose Assistant Voice
                </p>
                <div
                  className="space-y-5"
                  role="radiogroup"
                  aria-labelledby={voiceGroupLabelId}
                >
                  <div>
                    <p className="mb-3 text-sm font-medium text-[var(--text-secondary)]">
                      Male Voices
                    </p>
                    <div className="voice-selector-options flex-wrap">
                      {maleVoices.map((v, index) => {
                        const selected = field.value === v.id;
                        return (
                          <label
                            key={v.id}
                            className={cn(
                              'voice-selector-option min-w-[140px] flex-1 basis-[30%] cursor-pointer !justify-start',
                              selected
                                ? 'voice-selector-option-selected'
                                : 'voice-selector-option-default',
                            )}
                          >
                            <input
                              type="radio"
                              className="sr-only"
                              name={field.name}
                              value={v.id}
                              checked={selected}
                              onChange={() => field.onChange(v.id)}
                              onBlur={field.onBlur}
                              ref={index === 0 ? field.ref : undefined}
                            />
                            <span
                              className={cn(
                                'mt-0.5 size-4 shrink-0 rounded-full border-2 border-[var(--accent-warm)]',
                                selected && 'border-[#663820] bg-[#663820]',
                              )}
                              aria-hidden
                            />
                            <div className="min-w-0 flex flex-col gap-1 text-left">
                              <span className="font-semibold text-[var(--text-primary)]">
                                {v.name}
                              </span>
                              <span className="text-sm leading-snug text-[var(--text-secondary)]">
                                {v.description}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-medium text-[var(--text-secondary)]">
                      Female Voices
                    </p>
                    <div className="voice-selector-options flex-wrap">
                      {femaleVoices.map((v) => {
                        const selected = field.value === v.id;
                        return (
                          <label
                            key={v.id}
                            className={cn(
                              'voice-selector-option min-w-[140px] flex-1 basis-[30%] cursor-pointer !justify-start',
                              selected
                                ? 'voice-selector-option-selected'
                                : 'voice-selector-option-default',
                            )}
                          >
                            <input
                              type="radio"
                              className="sr-only"
                              name={field.name}
                              value={v.id}
                              checked={selected}
                              onChange={() => field.onChange(v.id)}
                              onBlur={field.onBlur}
                            />
                            <span
                              className={cn(
                                'mt-0.5 size-4 shrink-0 rounded-full border-2 border-[var(--accent-warm)]',
                                selected && 'border-[#663820] bg-[#663820]',
                              )}
                              aria-hidden
                            />
                            <div className="min-w-0 flex flex-col gap-1 text-left">
                              <span className="font-semibold text-[var(--text-primary)]">
                                {v.name}
                              </span>
                              <span className="text-sm leading-snug text-[var(--text-secondary)]">
                                {v.description}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <button type="submit" className="form-btn">
            Begin Synthesis
          </button>
        </form>
      </Form>
    </div>
  );
};

export default UploadForm;
