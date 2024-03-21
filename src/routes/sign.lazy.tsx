// @ts-nocheck
import { createLazyFileRoute } from "@tanstack/react-router";
import { File } from "buffer";
import { fabric } from "fabric";
import { Canvas } from "fabric/fabric-impl";
import React from "react";
import { useDropzone } from "react-dropzone";
import { BiImageAdd } from "react-icons/bi";
import { MdClose } from "react-icons/md";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import templateImgSrc from "../../server/dist/template.png";
import { signPDF } from "../../server/sign.telefunc";
import { Icon } from "../components/Icon";
import Loader from "../components/Loader";

export const Route = createLazyFileRoute("/sign")({
  component: SignDOC,
});

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function SignDOC() {
  const [theme, setTheme] = React.useState(false);
  //  false -> light mode , true -> dark mode
  const [numPages, setNumPages] = React.useState(0);
  const [currPage, setCurrPage] = React.useState(1);
  const [page, setPage] = React.useState<number[]>([0]);
  const [selectedFile, setFile] = React.useState<File>();
  const [canvas, setCanvas] = React.useState<Canvas>();
  const [signatureImg, setSignatureImg] = React.useState("");
  const [base64Doc, setBase64Doc] = React.useState("");
  const [isSign, setSign] = React.useState(false);
  const [hideCanvas, setHiddenCanvas] = React.useState(false);
  const [signaturePos, setSignaturePos] = React.useState({
    x: 25, // left
    y: 150, // top
    w: 256, // width
    h: 256, // height
  });
  const [edits, setEdits] = React.useState<object | any>();
  const [docIsLoading, setDocIsLoading] = React.useState(false);
  const pageRef = React.useRef(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files: File[] | any) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBase64Doc(event.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
      setFile(files[0]);
    },
  });

  const initCanvas = () => {
    const canvas = new fabric.Canvas("canvas", {
      isDrawingMode: false,
      height: 842,
      width: 595,
      backgroundColor: "rgba(0,0,0,0)",
    });

    canvas.on("object:modified", (e: any) => {
      console.log(e);
      setSignaturePos({
        x: e.target.left * 1.008,
        y: e.target.top * 1.03,
        w: e.target.width * e.target?.scaleX,
        h: e.target.height * e.target?.scaleY,
      });
    });

    return canvas;
  };

  React.useEffect(() => {
    console.log(signaturePos);
  }, [signaturePos]);

  React.useEffect(() => {
    if (document.getElementById("canvasWrapper"))
      document.getElementById("canvasWrapper").style.visibility =
        document.getElementById("canvasWrapper").style.visibility == "hidden"
          ? "visible"
          : "hidden";
  }, [hideCanvas]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setEdits({});
    setNumPages(numPages);
    setCurrPage(1);
    setCanvas(initCanvas());
    setTimeout(() => setDocIsLoading(false), 2000);
    // const docHeight = pageRef?.current?.pages?.current[0]?.clientHeight || null;
    // console.log(docHeight);
  }

  function changePage(offset: number) {
    const page = currPage;
    edits[page] = canvas?.toObject();
    setEdits(edits);
    setCurrPage((page) => page + offset);
    canvas?.clear();
    edits[page + offset] &&
      canvas?.loadFromJSON(edits[page + offset], () => {});
    canvas?.renderAll();
  }

  const addImage = async (e: React.ChangeEvent<HTMLInputElement> | any) => {
    let imageLoaded = false;
    let imgSrc: fabric.Object;
    let group;
    let imgTemplate: fabric.Object;
    let withFrame = false;

    var text = new fabric.Text(
      `sign by: 
Lutfi Ikbal Majid
${new Date().toLocaleDateString()}`,
      {
        fontSize: 8,
        fontFamily: "Verdana, sans-serif",
        fill: "black",
      }
    );

    function addGroup() {
      if (!imageLoaded) {
        // Image not loaded yet, need to wait
        setTimeout(function () {
          addGroup();
        }, 100);
        return;
      }

      imgSrc.set({
        top: 10,
        left: 10,
      });

      // Set text below the image
      text.set({
        top: 100,
        left: 5,
      });

      group = new fabric.Group([imgTemplate, imgSrc, text]);

      canvas.add(group);
      //   group.on("mouseover", function () {
      //     console.log("over");
      //     canvas.renderAll();
      //   });
      //   group.on("mouseout", function () {
      //     console.log("out");
      //     canvas.renderAll();
      //   });
      canvas.renderAll();
      let groupToExport = new fabric.Group([imgTemplate, imgSrc, text]);
      const urlImg = groupToExport.scaleToWidth(200)?.toDataURL({});
      console.log(urlImg);
      setSignatureImg(urlImg);
    }

    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = async function (f: any) {
      var data = f.target.result;
      fabric.Image.fromURL(templateImgSrc, function (img) {
        imgTemplate = img.scaleToWidth(100);
      });

      fabric.Image.fromURL(data, function (img) {
        imgSrc = img.scaleToWidth(85);
        const urlImg = img.scaleToWidth(200).toDataURL({});
        console.log(urlImg);
        setSignatureImg(urlImg);
        if (withFrame) {
          imgSrc = img.scaleToHeight(85);
          console.log(imgSrc);
        } else {
          canvas.add(imgSrc);
          canvas.renderAll();
        }
        imageLoaded = true;
      });
    };
    reader.readAsDataURL(file);
    canvas.isDrawingMode = false;
    withFrame && addGroup();
  };

  const onExport = async () => {
    const { base64string } = await signPDF(base64Doc, signatureImg, {
      page,
      ...signaturePos,
    });

    if (base64string) {
      let link = document.createElement("a");
      const mimeType = "application/pdf";
      link.href = `data:${mimeType};base64,${base64string}`;
      link.download = "myFileName.pdf";
      link.click();
    }
  };

  return (
    <div
      className={`min-h-[100vh] ${theme && "text-white bg-[rgb(20,20,20)]"}`}
    >
      {selectedFile ? (
        <div
          className={`w-full py-8 ${theme ? "text-white bg-[rgb(20,20,20)]" : "text-black bg-white"}`}
        >
          <div
            className="p-2 z-[1200] bg-red-500 shadow-sm rounded-md text-white fixed top-5 right-5 cursor-pointer"
            onClick={() => setFile(undefined)}
          >
            <MdClose className="text-white text-xl" />
          </div>
          <button
            className="bg-blue-400 px-3 py-2 rounded"
            onClick={onExport}
            type="button"
          >
            SIGN DOC
          </button>
          <div>
            <label htmlFor="img-inputt">
              <BiImageAdd className="md:text-[1.8rem] text-[1.5rem] cursor-pointer" />
            </label>
            <input
              type="file"
              id="img-inputt"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => addImage(e)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="add page in array"
              onChange={(e) => setPage(e.target.value.split(","))}
            />
          </div>
          <div
            className={`flex justify-center items-center ${theme ? "text-white bg-[rgb(20,20,20)]" : "text-black bg-white"}`}
          >
            <div
              id="singlePageExport"
              className={`${theme ? "text-white bg-[rgb(20,20,20)]" : "text-black bg-white"} flex items-center justify-center`}
            >
              {docIsLoading && (
                <>
                  <div className="w-[100%] h-[100%] top-[0] fixed bg-[rgba(50,50,50,0.2)] z-[1001] backdrop-blur-sm"></div>
                  <div className="fixed z-[1100] flex w-[100%] h-[100%] top-[0] justify-center items-center">
                    <Loader color={"#606060"} size={120} stokeWidth={"5"} />
                  </div>
                </>
              )}
              <div
                id="canvas-doc"
                className={`${isSign ? "border-none" : "border"}`}
              >
                {selectedFile && (
                  <Document
                    ref={pageRef}
                    file={selectedFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onItemClick={(e) => {
                      console.log(e);
                    }}
                    // loading={(e) => {
                    //   console.log(e)
                    // }}
                    onLoadError={(e) => {
                      console.log(e);
                    }}
                    onLoadProgress={() => {
                      console.log("PRGREOSS");
                    }}
                    className="flex justify-center"
                    id="doc"
                    renderMode="canvas"
                  >
                    <div
                      className="absolute z-[9] px-4 py-4"
                      id="canvasWrapper"
                      style={{ visibility: "visible" }}
                    >
                      <canvas id="canvas" />
                    </div>
                    <Page
                      // inputRef={pageRef}
                      id="docPage"
                      // onRenderSuccess={initCanvas}
                      pageNumber={currPage}
                    />
                  </Document>
                )}
              </div>
            </div>
          </div>
          <div className="fixed bottom-2 flex items-center justify-center w-full gap-3 z-50">
            {currPage > 1 && (
              <button
                onClick={() => changePage(-1)}
                className="px-4 py-2 bg-gray-700 rounded-md text-white"
              >
                {"<"}
              </button>
            )}
            <div className="px-4 py-2 bg-gray-700 rounded-md text-white">
              Page {currPage} of {numPages}
            </div>
            {currPage < numPages && (
              <button
                onClick={() => changePage(1)}
                className="px-4 py-2 bg-gray-700 rounded-md text-white"
              >
                {">"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full min-h-[100vh] py-8 flex items-center justify-center">
          <div
            className="flex w-[40vw] h-[40vh] justify-center items-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6"
            {...getRootProps()}
          >
            <div className="space-y-1 text-center">
              <Icon />
              <div
                className={`flex text-md ${theme ? "text-gray-400" : "text-gray-600"}`}
              >
                <label className="relative cursor-pointer rounded-md bg-transparent font-medium text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                  <span>Upload a file</span>
                </label>
                <input
                  type="file"
                  className="sr-only"
                  accept="application/pdf"
                  {...getInputProps()}
                />
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-sm">PDF</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
