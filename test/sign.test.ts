import * as fs from "node:fs";
import * as path from "node:path";
import { signPDF } from "../server/sign.telefunc";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var pdfPath = path.join(__dirname, "../server/dist/sample.pdf");
const outPath = path.join(__dirname, "../server/dist/output.pdf");
const outPath2 = path.join(__dirname, "../server/dist/output2.pdf");
var pdfBuffer = fs.readFileSync(pdfPath);
var pdfBuffer2 = fs.readFileSync(outPath);
var certificatePath = path.join(__dirname, "../server/secret/lutfiikbalmajid.pfx");
var signerCert = fs.readFileSync(certificatePath);

var imagePath = path.join(__dirname, "../server/dist/signature.png");
var imagePath2 = path.join(__dirname, "../server/dist/university.jpg");

(async () => {
  const sign = await signPDF(
    pdfBuffer,
    signerCert,
  );

  console.log(sign);
})();
