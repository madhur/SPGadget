@echo off
rmdir /s /q C:\users\mahuj4\Desktop\ExcelGadget
mkdir C:\users\mahuj4\Desktop\ExcelGadget
xcopy /s * c:\Users\mahuj4\desktop\ExcelGadget
cd ..

del *.css
del *.js

java -jar yuicompressor-2.4.8.jar Excel.Gadget\js\main.js -o main.js
java -jar yuicompressor-2.4.8.jar Excel.Gadget\css\theme.css -o theme.css
java -jar yuicompressor-2.4.8.jar Excel.Gadget\css\flyout.css -o flyout.css

copy /y *.css c:\Users\mahuj4\desktop\ExcelGadget\css\
copy /y *.js c:\Users\mahuj4\desktop\ExcelGadget\js\

del *.css
del *.js

cd c:\Users\mahuj4\desktop\ExcelGadget


c:\7-ZipPortable\App\7-Zip64\7z.exe a -r -xr!*.cmd ExcelGadgetv1.zip *.*



PAUSE

echo "Deploy Completed"

cd C:\Users\mahuj4\AppData\Local\Microsoft\Windows Sidebar\Gadgets\EXCEL.gadget