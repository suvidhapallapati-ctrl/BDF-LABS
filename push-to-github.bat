@echo off
title Push Course Repository to GitHub
echo ========================================================
echo Pushing Course Labs to GitHub...
echo Repository: https://github.com/suvidhapallapati-ctrl/BDF-LABS
echo ========================================================
echo.

cd /d "C:\Users\suvid\OneDrive\Desktop\BDF LABS"

git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo SUCCESS: Pushed to GitHub successfully!
    echo You can now refresh your GitHub page:
    echo https://github.com/suvidhapallapati-ctrl/BDF-LABS
    echo ========================================================
) else (
    echo ========================================================
    echo Push did not complete. If prompted, please complete
    echo the GitHub sign-in in your browser.
    echo ========================================================
)

echo.
pause
