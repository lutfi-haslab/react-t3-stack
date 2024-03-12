import { Response, Router } from "express";
import { hello } from "./hello.telefunc";

const router = Router();

router.get("/hello", async (req: any, res: Response) => {
  const { msg } = await hello();
  res.status(200).send(msg);
});

export default router;
