@echo off
rmdir /s /q C:\users\mahuj4\Desktop\ExcelGadget
mkdir C:\users\mahuj4\Desktop\ExcelGadget
xcopy /s * c:\Users\mahuj4\desktop\ExcelGadget
cd ..

del *.css
del *.js

java -jar yuicompressor-2.4.8.jar SPGadget.gadget\js\main.js -o main.js
java -jar yuicompressor-2.4.8.jar SPGadget.gadget\css\excel.css -o excel.css
java -jar yuicompressor-2.4.8.jar SPGadget.gadget\css\flyout.css -o flyout.css
java -jar yuicompressor-2.4.8.jar SPGadget.gadget\css\settings.css -o settings.css

copy /y *.css c:\Users\mahuj4\desktop\ExcelGadget\css\
copy /y *.js c:\Users\mahuj4\desktop\ExcelGadget\js\

del *.css
del *.js

cd c:\Users\mahuj4\desktop\ExcelGadget


c:\7-ZipPortable\App\7-Zip64\7z.exe a -r -xr!*.cmd ExcelGadgetv1.zip *.*



PAUSE

echo "Deploy Completed"

cd C:\Users\mahuj4\AppData\Local\Microsoft\Windows Sidebar\Gadgets\SPGadget.gadget