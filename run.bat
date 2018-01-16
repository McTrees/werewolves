@echo off
node index.js
if %ERRORLEVEL% == 0 GOTO continue
if %ERRORLEVEL% == 1 GOTO error

:continue
    echo.
    echo.
    echo Program Exited.
    goto exit

:error
    echo.
    echo.
    echo.
    echo.
    echo Hm, seems like we hit an error. We'll run you through our troubleshooting questions.
    echo.
    goto nodecheck
:nodecheck
    set /P c=Do you have node.js installed? (Y/N)
    if /I "%c%" EQU "Y" goto npmi
    if /I "%c%" EQU "N" goto nonode
    echo You didn't enter a valid choice!
    goto nodecheck
    
:npmi
    set /P c=Have you run 'npm i' since updating or first downloading? (Y/N)
    if /I "%c%" EQU "Y" goto token
    if /I "%c%" EQU "N" goto install_dependencies
    goto npmi
    
:install_dependencies
    echo Please hold on. We're just installing some dependencies. This shouldn't take long...
    start npm i
    if %ERRORLEVEL% == 0 GOTO troubleshooting_done
    if %ERRORLEVEL% == 1 GOTO npm_issue
    goto install_dependencies
    
:npm_issue
    echo There was an issue installing packages. Please ensure you have the latest version of the bot and have installed npm correctly.
    goto exit

:troubleshooting_done
    echo We think we've solved your problem. Try running the bot again.
    goto exit
    
:token
    set /P c=Have you edited token.json with your bot's token? (Y/N)
    if /I "%c%" EQU "Y" goto get_help
    if /I "%c%" EQU "N" goto do_that
    goto token
    
:get_help
    echo Hmm, we couldn't troubleshoot what was going wrong. Please open an issue on the github.
    goto exit
    
:nonode
    echo Please install node.js and try again.
    goto exit
    
:do_that
    echo Please edit token.json with your bot's token.
    goto exit

:exit
pause
