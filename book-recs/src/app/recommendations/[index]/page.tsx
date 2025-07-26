/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Frame from '@/app/components/Frame';
import { useRecs } from '../layout';

export default function RecPage() {
  const { index } = useParams();               
  const idx      = Number(index);
  const router = useRouter();
  const sp = useSearchParams();
  const recs = useRecs();
  const rec = recs[idx];

  const count = recs.length;
  const qs = sp.toString();


  return (
    <Frame>
    <div className='h-full w-full bg-red-900'>
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">{rec.title} by {rec.author}</h2>
      <img src={rec.cover_url} alt={rec.title} className="w-full h-auto rounded" />
      <p>{rec.reason}</p>

      <div className='flex w-full justify-between p-2 items-center'>
         {/*Previous button*/}
         <button
            onClick={() => router.push(`/recommendations/${idx-1}?${qs}`)}
            disabled={idx===0}
            className='border-2 text-white text-xs py-2 px-4 rounded disabled:opacity-50'>&larr;</button>

        {/*Home Button*/}
         <button
            onClick={() => router.push('/')}
            className='border-2 text-white text-xs py-2 px-4 rounded'>Home</button>

        {/*Next Button*/}
        <button
            onClick={() => router.push(`/recommendations/${idx+1}?${qs}`)}
            disabled={idx + 1>=count}
            className='border-2 text-white text-xs py-2 px-4 rounded disabled:opacity-50'>&rarr;</button>

      </div>
    </div>
    </div>
    </Frame>
  );
}