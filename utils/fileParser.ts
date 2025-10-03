import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result instanceof ArrayBuffer) {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

async function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read text file.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

const parsePdf = async (file: File): Promise<string> => {
  const arrayBuffer = await readAsArrayBuffer(file);
  
  // The execution environment for this app has restrictions that prevent
  // loading web workers. Setting `worker: false` forces pdf.js to run
  // on the main thread, avoiding errors like "No 'GlobalWorkerOptions.workerSrc' specified"
  // and "Failed to fetch dynamically imported module".
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer), worker: false });
  const pdf = await loadingTask.promise;
  let textContent = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ');
    textContent += '\n\n'; // Page break
  }
  return textContent;
};

const parseDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const parseXlsx = async (file: File): Promise<string> => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  let fullText = '';
  workbook.SheetNames.forEach(sheetName => {
    fullText += `--- Sheet: ${sheetName} ---\n\n`;
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_csv(worksheet);
    fullText += data + '\n\n';
  });
  return fullText;
};

export const parseFile = async (file: File): Promise<{ name: string; text: string; }> => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;
  let text: string;

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    text = await parsePdf(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    text = await parseDocx(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    fileType === 'application/vnd.ms-excel' ||
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls')
  ) {
    text = await parseXlsx(file);
  } else if (fileType.startsWith('text/') || fileName.endsWith('.md')) {
    text = await readAsText(file);
  } else {
    throw new Error(
      `Unsupported file: ${file.name}. Please upload a PDF, DOCX, XLSX, XLS, TXT, or MD file.`
    );
  }

  return { name: file.name, text };
};
