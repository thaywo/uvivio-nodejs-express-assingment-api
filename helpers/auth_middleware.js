
import passport from 'passport';
import passportLogin from './passport-auth.js';

const publicPages = ['auth', 'components_data', 'fileuploader', 's3uploader', ];

async function passportJwtLogin (req, res, next) {
    passportLogin();
    passport.authenticate('jwt', async (err, user, info) => {
        req.login(user, { session: false }, async (error) => { });
        return next();
    }
    )(req, res, next);
}

async function authMiddleware(req, res, next) {
    try {
		const arrPath = req.path.split("/").filter(Boolean);
		const page = arrPath[0];
		const action = arrPath[1] || "index";
		const pagePath = `${page}/${action}`;
		const isPublicPage = publicPages.includes(pagePath) || publicPages.includes(page);
		if (isPublicPage || req.user) {
            return next();
        }
        return res.unauthorized();
    }
    catch (err) {
        return res.serverError(err);
    }
}
export { passportJwtLogin, authMiddleware };
