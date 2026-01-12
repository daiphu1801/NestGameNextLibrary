@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE__=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN (`powershell -noprofile "& {$scriptDir='%~dp0'; $script='%__MVNW_ARG0_NAME__%'; icm -ScriptBlock ([Scriptblock]::Create((Get-Content -Raw '%~f0'))) -NoNewScope}"`) DO @(
  IF "%%A"=="MVN_CMD" (set __MVNW_CMD__=%%B) ELSE IF "%%B"=="" (echo.%%A) ELSE (echo.%%A=%%B)
)
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE__%
@SET __MVNW_PSMODULEP_SAVE__=
@SET __MVNW_ARG0_NAME__=
@SET MVNW_USERNAME=
@SET MVNW_PASSWORD=
@SET MVNW_VERBOSE=
@IF NOT "%__MVNW_CMD__%"=="" (%__MVNW_CMD__% %*)
@echo Cannot run mvnw correctly
@exit /b 1

: end batch / begin powershell #>

$ErrorActionPreference = "Stop"
if ($env:MVNW_VERBOSE -eq "true") {
  $VerbosePreference = "Continue"
}

$distributionUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"
$distributionSha256Sum = "706f01b20dec0305a822ab614d51f32b07ee11d0218175e55450242e49d2156386483b506b3a4e8a03ac8611bae96f9bed4e55f07f0f8e06d2f37b40a5ab62bb"

function Resolve-Mvn-Download-Url {
  $hash = [System.Security.Cryptography.SHA256]::Create()
  $stringUrl = $distributionUrl
  $urlBytes = [System.Text.Encoding]::UTF8.GetBytes($stringUrl)
  $hashBytes = $hash.ComputeHash($urlBytes)
  $hashString = [System.BitConverter]::ToString($hashBytes) -replace "-", ""
  return "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"
}

$mavenHome = "$env:USERPROFILE\.m2\wrapper\dists\apache-maven-3.9.6"
$mvnCmd = "$mavenHome\bin\mvn.cmd"

if (!(Test-Path $mvnCmd)) {
  Write-Verbose "Downloading Apache Maven 3.9.6..."
  $downloadUrl = Resolve-Mvn-Download-Url
  $zipFile = "$env:TEMP\apache-maven-3.9.6-bin.zip"
  
  if (!(Test-Path $zipFile)) {
    Write-Host "Downloading Maven from $downloadUrl..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile
  }
  
  Write-Host "Extracting Maven..."
  if (!(Test-Path "$env:USERPROFILE\.m2\wrapper\dists")) {
    New-Item -ItemType Directory -Path "$env:USERPROFILE\.m2\wrapper\dists" -Force | Out-Null
  }
  Expand-Archive -Path $zipFile -DestinationPath "$env:USERPROFILE\.m2\wrapper\dists" -Force
  
  Write-Host "Maven installed to $mavenHome"
}

Write-Output "MVN_CMD=$mvnCmd"
