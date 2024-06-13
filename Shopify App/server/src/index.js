const express = require('express');
const dotenv = require('dotenv');
const { shopifyApi, Auth } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');
const { MemorySessionStorage } = require('@shopify/shopify-app-session-storage-memory');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const {
    SHOPIFY_API_KEY,
    SHOPIFY_API_SECRET,
    SHOPIFY_SCOPES,
    HOST
} = process.env;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !SHOPIFY_SCOPES || !HOST) {
    throw new Error('Missing one or more required environment variables: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_SCOPES, HOST');
}

// Initialize Shopify API
const initShopify = async () => {
    try {
        const shopifyClient = shopifyApi({
            apiKey: SHOPIFY_API_KEY,
            apiSecretKey: SHOPIFY_API_SECRET,
            scopes: SHOPIFY_SCOPES.split(','),
            hostName: HOST.replace(/https?:\/\//, ''),
            isEmbeddedApp: true,
            sessionStorage: new MemorySessionStorage(),
        });

        await shopifyClient.init();
        return shopifyClient;
    } catch (error) {
        console.error('Error initializing Shopify API:', error);
        throw error;
    }
};

// Middleware to ensure Shopify API is initialized before proceeding
const ensureShopifyInitialized = async (req, res, next) => {
    try {
        req.shopify = await initShopify();
        next();
    } catch (error) {
        console.error('Error initializing Shopify API:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Middleware to ensure authenticated session
const authenticateSession = async (req, res, next) => {
    try {
        const session = await req.shopify.authenticatedGraphQLClient();

        if (!session || !session.accessToken) {
            return res.redirect(`/auth?shop=${req.query.shop}`);
        }

        req.session = session;
        next();
    } catch (error) {
        console.error('Error authenticating session:', error);
        res.status(401).send('Unauthorized');
    }
};

// Routes

// Authentication route
app.get('/auth', async (req, res) => {
    try {
        const authRoute = await Auth.beginAuth(
            req,
            res,
            req.query.shop,
            '/auth/callback',
            false
        );
        res.redirect(authRoute);
    } catch (error) {
        console.error('Error beginning authentication:', error);
        res.status(500).send('Error during authentication');
    }
});

// Authentication callback route
app.get('/auth/callback', async (req, res) => {
    try {
        const session = await Auth.validateAuthCallback(req, res, req.query);
        // Save session to storage or use in your app as needed
        res.redirect('/');
    } catch (error) {
        console.error('Error validating authentication callback:', error);
        res.status(400).send(error.message);
    }
});

// Example protected route
app.get('/api/products', authenticateSession, async (req, res) => {
    try {
        // Example logic to fetch products from Shopify API
        const products = await req.shopify.product.fetchAll();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
