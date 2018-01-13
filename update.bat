@echo off
git clone https://github.com/McTrees/werewolves.git
if %ERRORLEVEL% == 0 GOTO continue
if %ERRORLEVEL% == 1 GOTO error

:continue
    echo.
    echo.
    echo Updated successfully.
    goto exit

:error
    echo.
    echo.
    echo Hm, seems like we hit an error. Make sure you have the git commandline tool installed.

:exit
pause
