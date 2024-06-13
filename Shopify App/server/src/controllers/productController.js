const {Shopify} = require('@shopify/shopify-api');

exports.createProduct = async(req,res) =>{
    try{
        const session = await Shopify.Utils.loadCurrentSession(req,res);
        const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
        const product = await client.post({
            path: 'products',
            data: {product: req.body},
            type: Shopify.Clients.Rest.DataType.JSON,
        });
        res.status(201).send(product.body.product);
    }
    catch(error){
        res.status(500).send(error.message);
    }
};

exports.getProducts = async(req,res) =>{
    try {
        const session = await Shopify.Utils.loadCurrentSession(req,res);
        const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
        const product = await client.get({
            path: 'products',
        });
        res.status(200).send(product.body.products);

    } catch (error) {
        res.status(500).send(error.message)
    }
};

exports.updateProduct = async(req,res) =>{
    try {
        const session = await Shopify.Utils.loadCurrentSession(req,res);
        const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
        const product = await client.put({
            path: `products/${req.params.id}`,
            data: {product: req.body},
            type: Shopify.Clients.Rest.DataType.JSON,
        });
        res.status(200).send(product.body.product)
    } catch (error) {
        res.status(500).send(error.message)
    }
};

exports.deleteProduct = async(req,res) =>{
    try {
        const session = await Shopify.Utils.loadCurrentSession(req,res);
        const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
        await client.delete({
            path: `products/${req.params.id}`
        });
        res.status(204).send()
    } catch (error) {
        res.status(500).send(error.message)
    }
}