export default function handler(req, res) {
    const {method} = req;

    if (method === 'POST') {
        const {name} = req.body;
    }
}