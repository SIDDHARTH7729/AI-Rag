import 'dotenv/config';
import {  Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        try {
            console.log('Processing job:', job.data);
            const data = JSON.parse(job.data);

            // path: data.path
            // readingg pdf from path -> chunking the pdf -> calling embedding -> saving to qdrant

            console.log("Starting loading the docs")
            const loader = new PDFLoader(data.path);
            const rawdocs = await loader.load();
            if (rawdocs) {
                console.log("Docs are loaded")
            }

            console.log("Starting splitting the docs")
            const splitter = new CharacterTextSplitter({
                separator: "\n",
                chunkSize: 1000,
                chunkOverlap: 200
            })


            const docs = await splitter.splitDocuments(rawdocs);

            if (docs) {
                console.log("Docs are splitted")
            }

            console.log(`Splitted docs count: ${docs.length}`)

            console.log("Starting embedding the docs")
            const embeddings = new OpenAIEmbeddings({
                model: 'text-embedding-ada-002',
                openAIApiKey: process.env.OPENAI_API_KEY
            })

            console.log("Starting adding the docs to vector store")
            const vectorStore = await QdrantVectorStore.fromExistingCollection(
                embeddings,
                {
                    url: `http://${process.env.QDRANT_HOST}:${process.env.QDRANT_PORT}`,
                    collectionName: process.env.QDRANT_COLLECTION_NAME
                }
            )

            console.log("Adding the docs to vector store")
            await vectorStore.addDocuments(docs);
            console.log("All jobs are added to a vector store")
        } catch (err) {
            console.log(err);
        }
    }, {
    concurrency: 100,
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
}
)