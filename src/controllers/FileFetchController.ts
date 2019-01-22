import { Request, Response } from "express";

export class FileFetchController {
  public root(req: Request, res: Response) {
    res.status(200).send({
      message: "GET request successful!! " + req.originalUrl
    });
  }
}

export const fileFetchController = new FileFetchController();
