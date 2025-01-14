import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));

// API endpoint to fetch WEBTOON episodes
app.get('/api/episodes', async (req, res) => {
    try {
        const response = await fetch('https://www.webtoons.com/en/rss?title_no=567651');
        const xml = await response.text();
        
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: ''
        });
        
        const result = parser.parse(xml);
        const episodes = result.rss.channel.item.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            thumbnail: item.thumbnail || '/placeholder.svg'
        }));
        
        res.json(episodes);
    } catch (error) {
        console.error('Error fetching episodes:', error);
        res.status(500).json({ error: 'Failed to fetch episodes' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});