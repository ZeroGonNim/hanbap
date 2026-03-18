import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;

async function checkMedia() {
    console.log("--- Checking Instagram Media List ---");
    try {
        const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id,caption,media_type,timestamp,permalink&access_token=${ACCESS_TOKEN}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) throw new Error(JSON.stringify(data));

        console.log(`Current Posts Count: ${data.data.length}`);
        data.data.forEach((media, index) => {
            console.log(`[${index + 1}] ID: ${media.id}`);
            console.log(`    Caption: ${media.caption?.substring(0, 50)}...`);
            console.log(`    Link: ${media.permalink}`);
            console.log(`    Time: ${media.timestamp}`);
        });

    } catch (error) {
        console.error("❌ Failed to fetch media list:");
        console.error(`   ${error.message}`);
    }
}

checkMedia();
