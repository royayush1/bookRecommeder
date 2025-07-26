/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Frame from './components/Frame';
import {Jacquard_12} from 'next/font/google';

const jac = Jacquard_12({
  weight: '400',
  style:"normal",
  subsets: ['latin']
  
})

type Answers = { book: string; genre: string; era: 'New' | 'Classic'; feelings: string[]; count: number };

export default function Home() {
  const router = useRouter();
  const [ans, setAns] = useState<Answers>({ book: '', genre: '', era: 'New', feelings: [], count: 3 });
  const toggleFeeling = (f: string) => setAns(a => ({ ...a, feelings: a.feelings.includes(f) ? a.feelings.filter(x => x !== f) : [...a.feelings, f] }));
  const submit = () => {
    const qs = new URLSearchParams({
      book: ans.book,
      genre: ans.genre,
      era: ans.era,
      feelings: ans.feelings.join(','),
      count: ans.count.toString()
    }).toString();
    router.push(`/recommendations/0?${qs}`);
  };
  return (
    <Frame>
    <div className='h-screen w-full bg-red-900'>
    <div className="h-full w-full mx-auto p-6 space-y-4">
      <h1 className={`text-3xl font-bold text-center ${jac.className}`}>Book Recommender</h1>
      {/* Q1: Favorite book */}
      <div>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        <label className='text-sm'>1) What is your favorite book and why? (important to properly answer why - doesn't have to be too detailed, dont worry)</label>
        
        <textarea
          id="fav-book"
          rows={3}
          className="
            w-full         /* full width */
            border         /* border around */
            p-2            /* padding inside */
            rounded        /* rounded corners */
            resize-none    /* disable user‐resize, optional */
            whitespace-normal  /* wrap text normally */
            break-words        /* break long words rather than scroll */
            mt-2
          "
          placeholder="e.g. Dune by Frank Herbert — I love its sandworm lore and political intrigue…"
          value={ans.book}
          onChange={e => setAns(a => ({ ...a, book: e.target.value }))}
        />
      </div>
      {/* Q2: Genre */}
      <div>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        <label className='text-sm'>2) Preferred genre (or "no" if not applicable):</label>
        <input
          className="w-full border-b-4 p-2 rounded"
          value={ans.genre}
          onChange={e => setAns(a => ({ ...a, genre: e.target.value }))}
        />
      </div>
      {/* Q3: Era */}
      <div>
        <label className='text-sm'>3) Mood:</label>
        <div className="space-x-4">
          {['New', 'Classic'].map(opt => (
            <label key={opt} className="inline-flex items-center text-sm">
              <input
                type="radio"
                name="era"
                value={opt}
                checked={ans.era === opt}
                onChange={() => setAns(a => ({ ...a, era: opt as any }))}
                className=""
              />{opt}
            </label>
          ))}
        </div>
      </div>
      {/* Q4: Feelings */}
      <div>
        <label className='text-sm'>4) Desired feelings:</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Fun', 'Serious', 'Inspiring', 'Scary', 'Love'].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFeeling(f)}
              className={`p-2 border rounded text-sm ${ans.feelings.includes(f) ? 'bg-blue-200' : ''}`}
            >{f}</button>
          ))}
        </div>
      </div>
      {/* Q5: Count */}
      <div>
        <label className='text-sm'>5) Number of Book Recommendations (max 5):</label>
        <input
          type="number"
          min={1} max={5}
          className="w-12 border p-2 rounded mx-2 text-sm"
          value={ans.count}
          onChange={e => setAns(a => ({ ...a, count: Number(e.target.value) }))}
        />
      </div>
      <button
        onClick={submit}
        className="border-2 text-white text-xs p-2 mb-8 rounded items-center justify-center mx-auto"
      >Get Recommendations</button>
    </div>
    </div>
    </Frame>
  );
}
