import { Request, Response, Router } from "express";
import multer from "multer";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { hello } from "./hello.telefunc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/hello", async (req: any, res: Response) => {
  const { msg } = await hello();
  res.status(200).send(msg);
});

router.post(
  "/sign",
  upload.fields([
    { name: "pdfBuffer", maxCount: 1 },
    { name: "signerCert", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    console.log(req.files);
    // @ts-ignore
    const pdfBuffer = req.files["pdfBuffer"][0].buffer;
    // @ts-ignore
    const signerCert = req.files["signerCert"][0].buffer;

    // const { msg, buffer } = await signPDF({
    //   pdfBuffer,
    //   signerCert,
    // });

    // res.status(200).json([msg, buffer]);
  }
);

export default router;
