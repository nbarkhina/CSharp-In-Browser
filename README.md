# Notes
This is a fully web based C# Compiler. Simply edit the code and just make sure the Run() function returns a string. Then click the "Compile and Run" button to see the result. It uses the Mono Webassembly Runtime. You can also load from several included code examples. I added most of the popular .NET System DLL's and a few others like Newtonsoft. You can view a demo of it running here -

<br/>

https://neilb.net/monogithub/

<br/>

The first time you go to the page it may take a long time to load because it has to download all the DLLs

# Build Instructions
- Unzip Mono Wasm SDK
    - https://jenkins.mono-project.com/job/test-mono-mainline-wasm/label=ubuntu-1804-amd64/lastSuccessfulBuild/Azure/
    - or use the one that's in this repo `Mono-Wasm-SDK-Latest.zip`
      - I tested this project working against that version
    - take note of the path for reference later
- Install Mono on Windows 
  - I did 32 bit version (though 64 bit may work too have not yet tested)
  - https://www.mono-project.com/docs/getting-started/install/windows/
  - take note of the path for reference later
- Update path to WebAssembly.Bindings.dll in WasmRoslyn.csproj based on where you unzipped the Mono Wasm SDK
- Update paths in the build.ps1 file
- Open terminal in VS Code
- For a new machine you will need to unblock the powershell script
  - Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
- Install the VS Code C# Extension
- now open the folder in VS Code
  - the C# extension will then tell you to restore any dependencies
  - say yes
  - this should now create a bin and obj folder
- run `.\build.ps1` twice (first time it may give an error)
- publish the code to a web server
- Serve app from http://[YOUR SERVER]/publish/index.html