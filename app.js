import express from 'express';
import compression from 'compression';
import cors from 'cors';
import ejs from 'ejs';
import config from './config.js';
import extendExpressMiddleware from './helpers/express_middleware.js';

import { passportJwtLogin, authMiddleware } from './helpers/auth_middleware.js';

import AuthController from './controllers/auth.js';
import AccountController from './controllers/account.js';
import HomeController from './controllers/home.js';
import ComponentsDataController from './controllers/components_data.js';
import FileUploaderController from './controllers/fileuploader.js';
import S3UploaderController from './controllers/s3uploader.js';
import CandidatesController from  './controllers/candidates.js';
import JobsController from  './controllers/jobs.js';
import UsersController from  './controllers/users.js';



const app = express();


//set view engine use to return Html
app.set('views', 'views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
// compress all responses
app.use(compression({ threshold: 0 }));

//allow cors on localhost
app.use(cors()); // disable when deploy to production
app.use(express.static(config.app.publicDir))
app.use(express.json()) // Parses json, multi-part (file), url-encoded
app.use(express.urlencoded({ extended:true, limit:'50mb' }));

extendExpressMiddleware(app);

app.use(passportJwtLogin);
app.use('/api/', authMiddleware);


//bind page route to the controllers
app.use('/api/', HomeController);

app.use('/api/auth', AuthController);
app.use('/api/account', AccountController);

app.use('/api/candidates', CandidatesController);
app.use('/api/jobs', JobsController);
app.use('/api/users', UsersController);

app.use('/api/components_data', ComponentsDataController);
app.use('/api/fileuploader', FileUploaderController);
app.use('/api/s3uploader', S3UploaderController);

app.get('*', function(req, res){
    res.status(404).json("Page not found");
});


let port = 8060;
//start app
app.listen(port, () => {
    console.log('Server is up and running on port: ' + port);
});