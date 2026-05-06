'use server'

import { CreateBook, TextSegment } from "@/types";
import { success } from "zod";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData,  } from "../utils";
import Book from "@/database/models/books.models";
import BookSegment from "@/database/models/bookSegments.models";

export const checkBookExist = async (title: string) => {
    try{
        await connectToDatabase()
        const slug = generateSlug(title)
        const existingBook = await Book.findOne({slug}).lean()

        if(existingBook) {
            return {
                exist: true,
                book: serializeData(existingBook)
            }
        }

        return {
            exist: false
        }
    } catch (e) {
        console.error('Error checking book exist');
        return {
            exist: false,
            error: e
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();
        const slug = generateSlug(data.title)
        const existingBook = await Book.findOne({slug}).lean();

        if(existingBook) {
            return {
                success: false,
                data: serializeData(existingBook),
                alreadyExists: true
            }
        }

        // TODO: check if subscription limit before creating a book

        const book = await Book.create({
            ...data, slug, totalSegments: 0,
        });
        return({
            success: true,
            data: serializeData(book),
        })
    } catch (e) {
        console.error('error creating book', e);
        return {
            success:false,
            error: e,
        }
    }
}

export const saveBookSegments = async (bookId: string, segments: TextSegment[], clerkId: string) => {
    try {
        await connectToDatabase();
        console.log('saving book segments...');

        const segmentToInsert = segments.map(({segmentIndex, text, pageNumber, wordCount}) => ({
            clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount
        }));

        await BookSegment.insertMany(segmentToInsert)

        await Book.findByIdAndUpdate(bookId, {totalSegments: segments.length})

        console.log('book segments saved sucessfully');

        return {
            success: true,
            data: { segmetsCreated: segments.length }
        }
    } catch (e) {
        console.error('error saving book segments', e);

        await BookSegment.deleteMany({bookId});
        await Book.findByIdAndDelete(bookId);
        console.log('deleted book and segments due to failure in saving segments');
    }
}  