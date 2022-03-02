import XLSX from 'xlsx';

export function isLogin() {
  const token = sessionStorage.getItem('token') || '';
  return token !== '';
}

export function json2excel(data: [key: string], fileName: string) {
  const book = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
  XLSX.utils.book_append_sheet(book, sheet, 'sheet1');
  XLSX.writeFile(book, fileName);
}