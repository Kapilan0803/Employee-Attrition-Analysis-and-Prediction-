@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET "__MVNW_ARG0_NAME__=%~nx0")
@SET %%x=
@SETLOCAL
@SET DIRNAME=%~dp0
@IF "%DIRNAME%"=="" SET DIRNAME=.
@SET MAVEN_WRAPPER_JAR="%DIRNAME%.mvn\wrapper\maven-wrapper.jar"
@SET MAVEN_WRAPPER_PROPERTIES="%DIRNAME%.mvn\wrapper\maven-wrapper.properties"

@FOR /F "usebackq tokens=1,2 delims==" %%a IN (%MAVEN_WRAPPER_PROPERTIES%) DO (
  @IF "%%a"=="distributionUrl" SET MAVEN_DIST_URL=%%b
)

@SET MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin\apache-maven-3.9.6
@IF EXIST "%MAVEN_HOME%\bin\mvn.cmd" GOTO EXECUTE_MAVEN

@ECHO Downloading Maven 3.9.6...
@SET MAVEN_ZIP_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip
@SET MAVEN_ZIP=%TEMP%\apache-maven-3.9.6-bin.zip
@SET MAVEN_DEST=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin

@IF NOT EXIST "%MAVEN_DEST%" MKDIR "%MAVEN_DEST%"
@powershell -Command "Invoke-WebRequest -Uri '%MAVEN_ZIP_URL%' -OutFile '%MAVEN_ZIP%' -UseBasicParsing"
@powershell -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_DEST%' -Force"
@DEL "%MAVEN_ZIP%"

:EXECUTE_MAVEN
@SET JAVA_HOME_FOUND=
@WHERE java >nul 2>&1
@IF %ERRORLEVEL% EQU 0 SET JAVA_HOME_FOUND=true
@IF "%JAVA_HOME_FOUND%"=="" (
  @ECHO ERROR: Java is not found in PATH. Please install Java 17+.
  @EXIT /B 1
)
@"%MAVEN_HOME%\bin\mvn.cmd" %*
