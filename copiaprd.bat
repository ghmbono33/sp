call npm run build
xcopy dist l:\sp /E /I /Y
xcopy dist m:\sp /E /I /Y
@echo off
echo ¿Desea copiar ASP a PRD? (S/N)
set /p answer=

if /i "%answer%"=="S" (
    copy l:\sp\sp\asp\*.asp m:\sp\sp\asp\
    echo Copia realizada correctamente.
) else (
    echo No se realizará la copia.
)
