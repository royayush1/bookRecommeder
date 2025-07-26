from dotenv import load_dotenv
import os
import pandas as pd
import openai
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from supabase import create_client

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY') or ''
url = os.getenv('SUPABASE_URL') or ''
key = os.getenv('SUPABASE_API_KEY') or ''
client = create_client(url, key)

df = pd.read_csv(Path('datasets/book.csv'))

docs = []
for _,row in df.iterrows():
    text = f"{row.title} by {row.authors}: {row.description}"
    meta={
        'book_id': row.book_id,
        'title': row.title,
        'author': row.authors,
        'year': int(row.original_publication_year),
        'language_code': row.language_code,
        'rating': float(row.average_rating),
        'cover_url': row.image_url
    }
    docs.append(Document(page_content=text, metadata=meta))

splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
chunks = splitter.split_documents(docs)

for chunk in chunks:
    resp = openai.embeddings.create(input=chunk.page_content, model='text-embedding-3-small')
    emb = resp.data[0].embedding
    m = chunk.metadata
    client.table('book_chunks').upsert({
        'book_id': m['book_id'],
        'title': m['title'],
        'author': m['author'],
        'year': m['year'],
        'language_code': m['language_code'],
        'rating': m['rating'],
        'cover_url': m['cover_url'],
        'chunk': chunk.page_content,
        'embedding': emb
    }).execute()
