import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Test endpoint to check if API is working
app.get('/api/test', (req, res) => {
    res.json({ status: 'API is working' });
});

// Modified episodes endpoint with better error handling
app.get('/api/episodes', async (req, res) => {
    try {
        console.log('Fetching episodes from WEBTOON...');
        
        // For testing purposes, let's use sample data first
        // Remove this and uncomment the fetch code below once we confirm the API is working
        const sampleEpisodes = [
            {
                title: "Episode 1",
                link: "https://www.webtoons.com/en/canvas/the-guardians-of-nature/ep-1/viewer?title_no=567651&episode_no=1",
                pubDate: new Date().toISOString(),
                thumbnail: "https://sjc.microlink.io/R5sUi7fEB6_B-wot6Gqbgpm39rgTumcq7qjYcTDSGWqQVpG584Y41rLIuNAZf4PWdOLyPzZdyGxacn5NGHMzmg.jpeg"
            },
            {
                title: "Episode 2",
                link: "https://www.webtoons.com/en/canvas/the-guardians-of-nature/ep-2/viewer?title_no=567651&episode_no=2",
                pubDate: new Date().toISOString(),
                thumbnail: "https://sjc.microlink.io/R5sUi7fEB6_B-wot6Gqbgpm39rgTumcq7qjYcTDSGWqQVpG584Y41rLIuNAZf4PWdOLyPzZdyGxacn5NGHMzmg.jpeg"
            }
        ];

        res.json(sampleEpisodes);

        /* Uncomment this section once we confirm the API is working with sample data*/
        const response = await fetch('https://www.webtoons.com/en/rss?title_no=567651', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xml = await response.text();
        console.log('Received XML response');
        
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: ''
        });
        
        const result = parser.parse(xml);
        console.log('Parsed XML successfully');

        if (!result.rss || !result.rss.channel || !result.rss.channel.item) {
            throw new Error('Invalid RSS feed structure');
        }

        const episodes = result.rss.channel.item.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            thumbnail: item.thumbnail || '/placeholder.svg'
        }));

        res.json(episodes);
        //here*/

    } catch (error) {
        console.error('Error in /api/episodes:', error);
        res.status(500).json({ 
            error: 'Failed to fetch episodes',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something broke!',
        details: err.message
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`API test endpoint: http://localhost:${port}/api/test`);
    console.log(`Episodes endpoint: http://localhost:${port}/api/episodes`);
});
