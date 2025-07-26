/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supa = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_API_KEY!
);

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function POST(req: Request){
    try{
        
    const {book, genre, era, feelings, count} = await req.json();
    const prompt = `Fav book and why I like it: ${book}. I prefer ${genre} genre. It has to be a ${era} era book, and I want to feel the following feelings: ${feelings.join(', ')}. Give me your top ${count} recommendations`
    const embRes = await openai.embeddings.create({model: 'text-embedding-3-small', input: prompt})
    const userEmb = embRes.data[0].embedding;
    const {data} = await supa.rpc('match_book_chunks', {query_embedding: userEmb, match_count: count})
    const recs = await Promise.all(data.map(async (chunk: any, index: number) => {
        const chat = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages:[
                {
                    role: 'system', content: `You are an enthusiastic book expert who loves recommending books to people. You will be given 3 pieces of information - some text about what the user likes/wants and a question which includes the book title and author as well as some context. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.` 
                },
                {
                    role:'user', content: `This is what I had asked for: ${prompt}. So why was ${chunk.title} by ${chunk.author} the number ${index + 1} ranked recommendation based on Context: ${chunk.chunk}`
                }
            ]
        });
        return { title: chunk.title, author: chunk.author, cover_url: chunk.cover_url, reason: chat.choices[0].message.content!.trim() }
    }))
    return NextResponse.json(recs);
} catch(e: any) {
    console.error('Error in /api/recommend: ', e);
    return NextResponse.json(
        {error: e.message || 'Internal Server Error'},
        {status: 500}
    )
}}