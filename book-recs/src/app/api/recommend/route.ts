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

type ChunkRow = {
    title: string;
    author: string;
    cover_url: string;
    chunk: string;
}

function normalise(s: string){
    return (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function titleOnly(s: string){
    const i = s.toLowerCase().indexOf(" by ");
    return i > -1 ? s.slice(0, i).trim() : s.trim();
}

function seriesKeyFromTitle(title:string){
    const m = title.match(/\(([^)]+?)(?:\s*series)?\s*[,#]\s*\d+\)/i)
    if (m && m[1]) return normalise(m[1]);

    const stop = new Set(["and","of","the","a","an","in","on","for","to",":","–","-","—"])
    const words = title.split(/\s+/)
    const caps: string[] = []

    for (let i=0; i < words.length; i++){
        const w = words[i]
        const plain = w.replace(/[^A-Za-z']/g, "");
        if (!plain) break;

        const lower = plain.toLowerCase();
        const isCap = plain[0] === plain[0]?.toUpperCase();

        if(i===0 && stop.has(lower)) continue;
        if(!isCap || stop.has(lower)) break;

        caps.push(lower)
        if(caps.length >= 3) break;
    }

    if (caps.length >= 2) return caps.join(" ");

    if (caps.length === 1){
        const only = caps[0]

        const generic = new Set(["chronicles","trilogy","series","saga","collection","volume"])
        if (generic.has(only)) return "";

        if (/^[A-Za-z']+\s*[:—-]/.test(title)) return only;
        if (!/\s/.test(title.trim())) return only;
        if (only.length >= 6) return only;

        return ""
    }

}

export async function POST(req: Request){
    try{
        
    const {book, reason, genre, era, feelings, count: rawCount, excludeSameSeries} = await req.json();

    const parsed = Number.parseInt(String(rawCount ?? ''), 10);
    const count = Math.min(Math.max(Number.isNaN(parsed) ? 1 : parsed, 1), 5)
    const exclude = String(excludeSameSeries).toLowerCase() === "true";
    const prompt = `Fav book: ${book}. Why I like it: ${reason}. I prefer ${genre} genre. It has to be a ${era} era book, and I want to feel the following feelings: ${feelings.join(', ')}. Give me your top ${count} recommendations`
    const embRes = await openai.embeddings.create({model: 'text-embedding-3-small', input: prompt})
    const userEmb = embRes.data[0].embedding;

    const OVERFETCH = Math.max(20, count * 10);

    const {data, error} = await supa.rpc('match_book_chunks', {query_embedding: userEmb, match_count: OVERFETCH})

    if (error) throw error;

    const rows = (data ?? []) as ChunkRow[]
 
    const favTitle = titleOnly(book || "");
    const seriesKey = seriesKeyFromTitle(favTitle);
    const seriesNeedle = normalise(seriesKey!);

    const seen = new Set<string>();
    const shortList: ChunkRow[] = []

    for (const row of rows){
        const normTitle = normalise(row.title);
        if (!normTitle || seen.has(normTitle)) continue;

        if (excludeSameSeries && seriesNeedle){
            if (normTitle.includes(seriesNeedle)) continue;
        }

        seen.add(normTitle);
        shortList.push(row);

        if (shortList.length >= count * 2) break;
    }

    const picks = shortList.slice(0, count);

    const recs = await Promise.all(picks.map(async (chunk: any, index: number) => {

        const system =
          `You are a helpful and friendly book expert. ` +
          `Write a short, specific reason on why the user should check out the book: ${chunk.title} by ${chunk.author} based on the user's preferences: ${prompt} and using the provided Context Chunk: ${chunk.chunk} as context. ` +
          `If the chunk doesn't support it, say you don't know. Keep it to within 150 words. Don't mention any chunks. Don't recommend any more books.`;

        const user =
          `Why should I read ${chunk.title} by ${chunk.author} based on my preferences: ${prompt} and why is it the ${index + 1} ranked recommendation? Please don't give me any other recommendations. Just talk about book: ${chunk.title} by ${chunk.author}`;

        const chat = await openai.chat.completions.create({
          model: "gpt-4.1",
          temperature: 0.5,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
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