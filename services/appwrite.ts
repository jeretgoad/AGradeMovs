// track the searches made by user

import {Client, Databases, Query, ID} from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const db = new Databases(client);

// check if a record of that search as already been stored
// if a document is found increment the searchCount field
// if no document is found, create a new document in Appwrite database, then initialize its count by 1

export const updateSearchCount = async(query: string, movie: Movie) => {
    try {
        const result = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', query)
        ]);

        if (result.documents.length > 0) {
            const existingMov = result.documents[0];

            await db.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                existingMov.$id,
                {
                    count: existingMov.count + 1
                }
            )
        } else {
            await db.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm: query,
                    movie_id: movie.id,
                    count: 1,
                    title: movie.title,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                }
            )
        }
    } catch (error) {
        console.log(error);
        throw error;
    }

}

export const getTrendingMovies = async(): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);

        return result.documents as unknown as TrendingMovie[];
    } catch (error) {
        console.error(error);
        return undefined;
    }
};