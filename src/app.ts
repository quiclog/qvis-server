import express from "express";
import * as bodyParser from "body-parser";
import { mainRoutes } from "./routes/MainRoutes";

// inspired by https://blog.morizyun.com/blog/typescript-express-tutorial-javascript-nodejs/index.html
class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    private config(): void {
        // support application/json
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));

        this.app.use("/", mainRoutes);
    }
}

export default new App().app;
