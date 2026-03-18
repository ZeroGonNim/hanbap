import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const drive = google.drive({ version: 'v3', auth: GOOGLE_API_KEY });

async function listFiles() {
    console.log(`Checking folder: ${FOLDER_ID}`);
    if (!GOOGLE_API_KEY) {
        console.error("❌ GOOGLE_API_KEY is missing in .env");
        return;
    }

    try {
        const res = await drive.files.list({
            q: `'${FOLDER_ID}' in parents and trashed = false`,
            fields: 'files(id, name, webViewLink, webContentLink)',
        });
        const files = res.data.files;
        if (files.length === 0) {
            console.log('No files found.');
        } else {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        }
    } catch (err) {
        console.error('❌ The API returned an error: ' + err);
    }
}

listFiles();
