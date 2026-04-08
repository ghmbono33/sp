call npm run build
xcopy dist l:\sp\sp /E /I /Y
xcopy dist m:\sp\sp /E /I /Y


call npm run build
xcopy dist l:\puestosprl /E /I /Y
xcopy dist m:\puestosprl /E /I /Y
@echo off
echo ¿Desea copiar ASP a PRD? (S/N)
set /p answer=

if /i "%answer%"=="S" (
    copy l:\sp\sp\asp\*.asp m:\sp\sp\asp\
    echo Copia realizada correctamente.
) else (
    echo No se realizará la copia.
)
