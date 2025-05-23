#!/bin/bash

# Версия pdfjs, которая совместима с текущей версией react-pdf
PDFJS_VERSION="4.4.168"

# Создаем папку для шрифтов, если она не существует
mkdir -p standard_fonts

echo "Загрузка PDF.js воркера версии $PDFJS_VERSION..."

# Загрузка PDF.js воркера
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/build/pdf.worker.min.mjs" -o pdf.worker.min.mjs

echo "Загрузка стандартных шрифтов PDF.js..."

# Загрузка стандартных шрифтов
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/Courier-Bold.bf" -o standard_fonts/Courier-Bold.bf
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/Courier-Oblique.bf" -o standard_fonts/Courier-Oblique.bf
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/Courier.bf" -o standard_fonts/Courier.bf
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/Helvetica-Bold.bf" -o standard_fonts/Helvetica-Bold.bf
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/Helvetica-Oblique.bf" -o standard_fonts/Helvetica-Oblique.bf
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/Helvetica.bf" -o standard_fonts/Helvetica.bf
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/Symbol.bf" -o standard_fonts/Symbol.bf
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/Times-Bold.bf" -o standard_fonts/Times-Bold.bf
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/Times-Roman.bf" -o standard_fonts/Times-Roman.bf
curl -L "https://unpkg.com/pdfjs-dist@$PDFJS_VERSION/standard_fonts/ZapfDingbats.bf" -o standard_fonts/ZapfDingbats.bf

echo "Файлы PDF.js успешно загружены!" 