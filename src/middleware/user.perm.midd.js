export default function (req, res, next) {
    if(req.headers.auth == 'a1b2') return next();
    res.status(401).send([]);
};