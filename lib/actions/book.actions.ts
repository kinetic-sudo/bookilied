'use server'

import { CreateBook, TextSegment } from "@/types";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/books.models";
import BookSegment from "@/database/models/bookSegments.models";
import mongoose, { Types } from "mongoose";

export const getAllBooks = async () => {
    try {
        await connectToDatabase()
        const books =  await Book.find().sort({ createdAt: -1 }).lean()

        return {
            success: true,
            data: serializeData(books)
        }
    } catch (e) {
        console.error('Error connecting to database', e);
        return {
            success: false,
            error: e
        }
    }
}

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

        const bookObjectId = new Types.ObjectId(bookId)

        const segmentToInsert = segments.map(({ segmentIndex, text, pageNumber, wordCount }) => ({
            clerkId, bookId: bookObjectId, content: text, segmentIndex, pageNumber, wordCount
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

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        const book = await Book.findOne({ slug }).lean();
 
        if (!book) {
            return { success: false, data: null };
        }
 
        return {
            success: true,
            data: serializeData(book) as {
                _id: string;
                title: string;
                author: string;
                coverURL: string;
                persona: string;
                slug: string;
                fileURL: string;
                totalSegments: number;
            }
        };
    } catch (e) {
            const message =
      e instanceof Error ? e.message : "An unknown error occurred";
    const status =
      e instanceof SyntaxError
        ? 400
        : /unauthori[sz]ed/i.test(message)
          ? 401
          : 500;
        return {
            success: false,
            data: null,
            error: e instanceof Error ? e.message : 'Unknown error'
        };
    }
};

export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
    try {
        await connectToDatabase();

        console.log(`Searching for: "${query}" in book ${bookId}`);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        // Try MongoDB text search first (requires text index)
        let segments: Record<string, unknown>[] = [];
        try {
            segments = await BookSegment.find({
                bookId: bookObjectId,
                $text: { $search: query },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .lean();
        } catch {
            // Text index may not exist — fall through to regex fallback
            segments = [];
        }

        // Fallback: regex search matching ANY keyword
        if (segments.length === 0) {
            const keywords = query.split(/\s+/).filter((k) => k.length > 2);
            const pattern = keywords.map(escapeRegex).join('|');

            segments = await BookSegment.find({
                bookId: bookObjectId,
                content: { $regex: pattern, $options: 'i' },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ segmentIndex: 1 })
                .limit(limit)
                .lean();
        }

        console.log(`Search complete. Found ${segments.length} results`);

        return {
            success: true,
            data: serializeData(segments),
        };
    } catch (error) {
        console.error('Error searching segments:', error);
        return {
            success: false,
            error: (error as Error).message,
            data: [],
        };
    }
};
 