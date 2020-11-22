$WASM_SDK = "C:\DevNeil\Mono-Wasm-SDK-Latest"
$CSC_TOOL = "C:\Program Files (x86)\Mono\bin\csc"
$MONO_TOOL = "C:\Program Files (x86)\Mono\bin\mono.exe"

& $CSC_TOOL /nostdlib /noconfig /nologo /langversion:latest -target:library -out:./bin/WasmRoslyn.dll /r:$WASM_SDK/wasm-bcl/wasm/mscorlib.dll /r:$WASM_SDK/wasm-bcl/wasm/System.Core.dll /r:$WASM_SDK/wasm-bcl/wasm/System.dll /r:$WASM_SDK/wasm-bcl/wasm/Facades/System.Runtime.dll /r:$WASM_SDK/wasm-bcl/wasm/Facades/System.IO.dll /r:$WASM_SDK/wasm-bcl/wasm/Facades/System.Collections.dll /r:$WASM_SDK/wasm-bcl/wasm/Facades/System.Text.Encoding.dll /r:$WASM_SDK/wasm-bcl/wasm/Facades/System.Threading.dll /r:$WASM_SDK/wasm-bcl/wasm/Facades/System.Threading.Tasks.dll /r:$WASM_SDK/wasm-bcl/wasm/System.Net.Http.dll /r:$WASM_SDK/wasm-bcl/wasm/Facades/netstandard.dll  /r:$WASM_SDK/framework/WebAssembly.Bindings.dll /r:$WASM_SDK/framework/WebAssembly.Net.Http.dll /r:./managed/Microsoft.CodeAnalysis.CSharp.dll /r:./managed/Microsoft.CodeAnalysis.dll /r:./managed/System.Collections.Immutable.dll /r:./managed/Newtonsoft.Json.dll Program.cs CompileService.cs

Start-Sleep -Seconds 1.5

& $MONO_TOOL $WASM_SDK/packager.exe  --copy=ifnewer --out=publish --search-path=./managed/ --asset=index.html --asset=script.js  ./bin/WasmRoslyn.dll

Copy-Item -Path 'node_modules' -Destination 'publish\node_modules' -recurse -Force