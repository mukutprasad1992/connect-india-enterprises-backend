import * as fs from 'fs-extra';
import * as path from 'path';


async function copyAssets() {
  const files = ['logo-transparent-png.png', 'iconsaddress.png', 'iconscontact.png', 'iconsemail.png', 'iconsphone.png', 'iconspincode.png', 'iconsrupee.png', 'iconscallmessage.png', 'iconsclock.png', 'iconsonlinesupport.png'];
  const destinationDir = path.resolve(__dirname, 'dist');

  try {

    await fs.ensureDir(destinationDir);

    for (const file of files) {
      const sourcePath = path.resolve(__dirname, file);
      const destinationPath = path.resolve(destinationDir, file);

      await fs.copy(sourcePath, destinationPath);
      console.log(`${file} copied successfully to dist folder!`);
    }
  } catch (err) {
  }
}
copyAssets();
