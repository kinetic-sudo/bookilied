'use server'

import { CreateBook, TextSegment } from "@/types";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/books.models";
import BookSegment from "@/database/models/bookSegments.models";

export const checkBookExist = async (title: string) => {
    try {
        await connectToDatabase()
        const slug = generateSlug(title)
        const existingBook = await Book.findOne({ slug }).lean()

        if (existingBook) {
            return {
                exist: true,
                book: serializeData(existingBook)
            }
        }

        return { exist: false }
    } catch (e) {
        console.error('Error checking book exist', e);
        return {
            exist: false,
            error: e instanceof Error ? e.message : 'Unknown error'  // ✅ plain string
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();
        const slug = generateSlug(data.title)
        const existingBook = await Book.findOne({ slug }).lean();

        if (existingBook) {
            return {
                success: false,
                data: serializeData(existingBook),
                alreadyExists: true
            }
        }

        const book = await Book.create({ ...data, slug, totalSegments: 0 });

        return {
            success: true,
            data: serializeData(book),
        }
    } catch (e) {
        // Surface the real Mongoose error
        const isDuplicateKey = (e as any)?.code === 11000
        const message = isDuplicateKey
            ? `A book with this slug already exists`
            : e instanceof Error ? e.message : 'Unknown error'

        console.error('error creating book:', message, e)
        return {
            success: false,
            error: message
        }
    }
}

export const saveBookSegments = async (bookId: string, segments: TextSegment[], clerkId: string) => {
    try {
        await connectToDatabase();

        const segmentToInsert = segments.map(({ segmentIndex, text, pageNumber, wordCount }) => ({
            clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount
        }));

        await BookSegment.insertMany(segmentToInsert)
        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length })

        return {
            success: true,
            data: { segmentsCreated: segments.length }
        }
    } catch (e) {
        console.error('error saving book segments', e);

        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete(bookId);

        return {
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error'  // ✅ plain string
        }
    }
}