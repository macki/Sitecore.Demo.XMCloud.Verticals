/* eslint-disable */
import { NextApiRequest, NextApiResponse } from 'next';
import config from 'temp/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        // Create form data that matches what the Sitecore controller expects
        const formData = new URLSearchParams();
        formData.append('username', username);

        // Make sure the sitecoreApiHost is properly defined with protocol
        let sitecoreApiHost = config.sitecoreApiHost;

        // Add protocol if missing
        if (sitecoreApiHost && !sitecoreApiHost.startsWith('http')) {
            sitecoreApiHost = `https://${sitecoreApiHost}`;
        }

        // Use a fallback if sitecoreApiHost is undefined
        if (!sitecoreApiHost) {
            // Try to derive from request hostname
            const host = req.headers.host || 'localhost:3000';
            sitecoreApiHost = `https://${host}`;
        }

        // Forward the request to Sitecore's controller endpoint
        const sitecoreApiUrl = `${sitecoreApiHost}/api/sitecore/Login/VirtualLogin`;

        console.log(`Forwarding login request to: ${sitecoreApiUrl}`);

        const response = await fetch(sitecoreApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
            credentials: 'include',
        });

        // Forward cookies from Sitecore to maintain authentication state
        const cookies = response.headers.get('set-cookie');
        if (cookies) {
            res.setHeader('Set-Cookie', cookies);
        }

        // Check content type before trying to parse as JSON
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            // If it's JSON, parse it and return
            const data = await response.json();
            return res.status(response.status).json(data);
        } else {
            // If it's not JSON, it's likely an error page or HTML
            const text = await response.text();

            // Log the first 500 characters for debugging
            console.error('Non-JSON response:', text.substring(0, 500));

            // Return a more helpful error
            return res.status(500).json({
                success: false,
                message: 'Sitecore returned a non-JSON response',
                error: {
                    statusCode: response.status,
                    statusText: response.statusText,
                    contentType: contentType || 'unknown'
                }
            });
        }
    } catch (error) {
        console.error('Error forwarding login request:', error);

        // Convert error to a serializable object
        const errorObj = {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            toString: String(error)
        };

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the login request',
            error: errorObj
        });
    }
}