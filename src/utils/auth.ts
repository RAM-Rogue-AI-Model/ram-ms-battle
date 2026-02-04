import { NextFunction, Request, Response } from 'express';

import { config } from './config';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const INTERNAL_SECRET = config.INTERNAL_SECRET;

  const secret = req.header('x-internal-secret');

  if (secret) {
    if (secret === INTERNAL_SECRET) {
      // req.user = user;
      next();
    } else res.sendStatus(401);
  } else {
    res.sendStatus(401);
  }
};

const requestDetails = (req: Request, res: Response, next: NextFunction) => {
  const today = new Date();
  // eslint-disable-next-line no-console
  console.log(req.method + ' - ' + req.url + ' - ' + today.toLocaleString());
  next();
};

export { authenticate, requestDetails };
