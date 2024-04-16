declare module "next-connect" {
    import { RequestHandler } from "express";
  
    interface Options {
      onError?: (err: any, req: any, res: any, next: any) => void;
      onNoMatch?: (req: any, res: any) => void;
      attachParams?: boolean;
    }
  
    function nextConnect(options?: Options): {
      use: (...handler: RequestHandler[]) => any;
      get: (...handler: RequestHandler[]) => any;
      post: (...handler: RequestHandler[]) => any;
      put: (...handler: RequestHandler[]) => any;
      delete: (...handler: RequestHandler[]) => any;
      patch: (...handler: RequestHandler[]) => any;
      options: (...handler: RequestHandler[]) => any;
      head: (...handler: RequestHandler[]) => any;
      all: (...handler: RequestHandler[]) => any;
      handler: (req: any, res: any) => any;
    };
  
    export = nextConnect;
  }
  