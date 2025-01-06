import axios from 'axios';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query) {
        return new Response('Query parameter "q" is required', { status: 400 });
    }

    try {
        const apiKey = process.env.JAMENDO_API_KEY;
        const response = await axios.get(`https://api.jamendo.com/v3.0/tracks`, {
            params: {
                client_id: apiKey,
                format: 'json',
                search: query,
            },
        });

        return new Response(JSON.stringify(response.data.results), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response('Error fetching data from Jamendo', { status: 500 });
    }
}
