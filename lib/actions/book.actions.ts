import { CreateBook } from "@/types";
import { success } from "zod";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug } from "../utils";



export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();
        const slug = generateSlug(data.title)
    } catch (e) {
        console.error('error creating book', e);
        return {
            success:false,
            error: e,
        }
    }
}