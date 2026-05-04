import { CreateBook } from "@/types";
import { success } from "zod";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/books.models";



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