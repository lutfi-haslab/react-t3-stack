import * as path from "node:path";
import { fileURLToPath } from "url";
import Zga from "zgapdfsigner";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

async function loadCertificate() {
  const response = await fetch(
    "https://pub-867c2a8b0bb046428323e9ca7550be21.r2.dev/lutfiikbalmajid.pfx"
  );
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export const signPDF = async (
  base64Pdf: string,
  base64Img: string | undefined,
  pos: { page: number[]; x: number; y: number; w: number; h: number }
) => {
  const { buffer: tempPdfBuffer } = base64ToArrayBuffer(base64Pdf);

  const signerCert = await loadCertificate();

  const objectTop = pos.y;
  const objectLeft = pos.x;
  const objectWidth = pos.w;
  const objectHeight = pos.h;
  let tempPdf = tempPdfBuffer;

  for (let i = 0; i < pos.page.length; i++) {
    console.log(i);
    let sopt = {
      p12cert: signerCert,
      pwd: "foo123",
      permission: 4,
    };

    if (base64Img) {
      const { buffer: tempImgBuffer, extension: imgType } =
        base64ToArrayBuffer(base64Img);
      // @ts-ignore
      sopt.drawinf = {
        area: {
          x: objectLeft, // left
          y: objectTop, // top
          w: objectWidth, // width
          h: objectHeight, // height
        },
        pageidx: pos.page[i],
        imgData: tempImgBuffer,
        imgType: imgType,
      };
    }

    var signer = new Zga.PdfSigner(sopt);
    var u8arr = await signer.sign(Buffer.from(tempPdf));
    tempPdf = await u8arr.buffer;
  }

  return {
    msg: "success",
    base64string: Buffer.from(tempPdf).toString("base64"),
  };
};

function base64ToArrayBuffer(base64: string) {
  const buffer = Buffer.from(base64.split(";")[1].split(",")[1], "base64");
  const extension = getFileExtensionFromDataURI(base64);

  return {
    buffer,
    extension,
  };
}

function getFileExtensionFromDataURI(dataURI: string) {
  const regex = /data:.*?\/(.+?);/;
  const match = dataURI.match(regex);
  return match ? match[1] : null;
}
