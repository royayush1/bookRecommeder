/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PacmanLoader } from 'react-spinners';

interface Recommendation {
    title: string;
    author: string;
    cover_url: string;
    reason:  string;
}

const RecsContext = createContext<Recommendation[] | null>(null);
export function useRecs(){
    const ctx = useContext(RecsContext)
    if (!ctx) throw new Error('useRecs must be inside RecommendationsLayout');
    return ctx
}

export default function RecommendationsLayout({children}: {children: ReactNode}){
    const router = useRouter()
    const sp = useSearchParams()
    const [recs, setRecs] = useState<Recommendation[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const qsString = sp.toString();


    useEffect(() => {
        async function load(){
            try{
                const qs = Object.fromEntries(sp.entries())
                const resp = await fetch('/api/recommend', {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify({
                            book:     qs.book,
                            genre:    qs.genre,
                            era:      qs.era,
                            feelings: qs.feelings.split(','),
                            count:    Number(qs.count)
                        })
                    });
                if (!resp.ok) throw new Error(`Server returned ${resp.status}`)
                const data = await resp.json();
                setRecs(data);    
            } catch(e: any){
                console.error(`Error fetching recommendations`);
                setError(e.message || 'Unknown Error')

            }
        }

        load()
    }, [qsString]);

    if(error){

    return(
      <div className="flex h-screen w-full bg-red-900 items-center justify-center">
        <p className="text-[#DE9B72]">Error: {error}</p>
      </div>
    )
    }

    if (!recs) {return (
    <div className='flex h-screen w-full bg-red-900 items-center justify-center'>
        <PacmanLoader loading={!recs} size={50} color='#DE9B72'/>
    </div>);};


    return(
        <RecsContext.Provider value={recs}>
            {children}
        </RecsContext.Provider>
    )
}