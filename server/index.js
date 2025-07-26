import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import multer from 'multer';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';
import { Queue } from 'bullmq';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const queue = new Queue('file-upload-queue',{
    connection:{
        host:process.env.REDIS_HOST,
        port:process.env.REDIS_PORT
    }
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSufix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSufix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage
})

const app = express();
app.use(cors());

app.get("/",(req,res)=>{
    return res.json({
        status:"ALl Good fellas"
    })
})

app.post("/upload/pdf",upload.single('pdf'),async(req,res)=>{
    await queue.add(
        'file-ready',
        JSON.stringify({
            filename:req.file.originalname,
            destination:req.file.destination,
            path:req.file.path
        })
    )
    return res.json({
        status:"Uploaded"
    })
})

app.get("/chat",async(req,res)=>{
    const userQuery = req.query.message;
    const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-ada-002',
        openAIApiKey: process.env.OPENAI_API_KEY
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url:`http://${process.env.QDRANT_HOST}:${process.env.QDRANT_PORT}`,
            collectionName:process.env.QDRANT_COLLECTION_NAME
        }
    )

    const ret = vectorStore.asRetriever({
        k:3
    })
    const result = await ret.invoke(userQuery)

    const SYSTEM_PROMPT = `
     You are a helpful AI Assistant who answers the user query based on the available context from the
     PDF file.
     Context:
     ${JSON.stringify(result)}
    `
    const chatResult = await client.chat.completions.create({
        model: "gpt-4.1",
        messages:[
            {role:'system',content:SYSTEM_PROMPT},
            {role:'user',content:userQuery}
        ]
    })

    return res.json({
        message:chatResult.choices[0].message.content,
        docs:result
    })
})

app.listen(process.env.PORT,()=>{
    console.log("Server is running on port 8000");
})
