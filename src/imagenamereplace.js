// imagenamereplace_space.js
import fs from 'fs';
import path from 'path';

const folderPath = './src/assets/images'; 

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error(' 디렉토리 읽기 실패:', err);
    return;
  }

  files.forEach((file) => {
    // 공백을 밑줄로 변경
    const newFileName = file.replace(/ /g, '_');
    const oldPath = path.join(folderPath, file);
    const newPath = path.join(folderPath, newFileName);

    // 이름이 다를 때만 변경
    if (oldPath !== newPath) {
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error(` 파일 이름 변경 실패: ${file}`, err);
        } else {
          console.log(` ${file} → ${newFileName}`);
        }
      });
    }
  });
});
