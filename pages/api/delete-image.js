import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from '@/pages/api/auth/[...nextauth]';
import {Product} from '@/models/product';

const bucketName = 'adib-next-ecommerce';

export default async function handle(req, res) {

    await mongooseConnect();

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Connecting to MongoDB...');
        await isAdminRequest(req, res);

        const { link } = req.body;
        console.log('Image link to delete:', link);

        if (!link) {
            console.error('No image link provided');
            return res.status(400).json({ error: 'Image link is required' });
        }

        const client = new S3Client({
            region: 'eu-north-1',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            },
        });

        console.log('Attempting to delete image from S3...');
        const key = link.split('/').pop(); // Extract the file name from the link
        await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
        console.log('Image deleted from S3:', key);

        console.log('Updating MongoDB...');
        await Product.updateMany(
            { images: link },
            { $pull: { images: link } }
        );
        console.log('Image removed from MongoDB:', link);

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE handler:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
}
