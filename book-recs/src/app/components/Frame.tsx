import Image from 'next/image';
import React from 'react';

export default function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="outer-border bg-red-900">
        <div className="mid-border">
            <div className='inner-border'>
                <Image
                    src="/frame/corner-decoration.png"
                    alt=""
                    width={64} height={64}
                    className="corner-decoration corner-left-top"
                />
                <Image
                    src="/frame/corner-decoration.png"
                    alt=""
                    width={64} height={64}
                    className="corner-decoration corner-right-top"
                />
                <Image
                    src="/frame/corner-decoration.png"
                    alt=""
                    width={64} height={64}
                    className="corner-decoration corner-right-bottom"
                />
                <Image
                    src="/frame/corner-decoration.png"
                    alt=""
                    width={64} height={64}
                    className="corner-decoration corner-left-bottom"
                />
                <Image
                    src="/frame/vertical-decoration.png"
                    alt=""
                    width={200} height={200}
                    className="vertical-decoration top"
                />
                <Image
                    src="/frame/vertical-decoration.png"
                    alt=""
                    width={200} height={200}
                    className="vertical-decoration bottom"
                />

                    {children}
            </div>
        </div>
    </div>
)}