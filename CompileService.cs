using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;
using Newtonsoft.Json.Linq;
using WebAssembly;

namespace WasmRoslyn
{
    public class CompileService
    {
        private readonly HttpClient _http;
        public List<string> CompileLog { get; set; }
        private List<MetadataReference> references { get; set; }
        public JSObject js;


        public CompileService(HttpClient http, JSObject js)
        {
            _http = http;
            this.js = js;
        }

        public async Task SetReferences(List<string> assemblies)
        {

            //need to use the DLL atleast once so it gets added
            JObject job = new JObject();
            
            

            Console.WriteLine("Setting References");
            references = new List<MetadataReference>();
            foreach(var assembly in assemblies)
            {
                if (assembly.ToLower().StartsWith("http"))
                    references.Add(await GetFileStreamExternal(assembly));
                else
                    references.Add(await GetFileStream($"managed/{assembly}.dll"));
            }
            Console.WriteLine("Finished Setting References");

        }

        public async Task Init()
        {
            List<string> assemblies = new List<string>();
            // assemblies.Add("mscorlib");
            // assemblies.Add("netstandard");
            // assemblies.Add("System");
            // assemblies.Add("System.Data");

            if (references == null)
            {
                references = new List<MetadataReference>();

                List<string> assemblyNames = new List<string>();
                

                foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
                {
                    references.Add(await GetFileStream($"managed/{assembly.GetName().Name}.dll"));
                    assemblyNames.Add(assembly.GetName().Name);
                }

                references.Add(await GetFileStream($"managed/System.Data.dll"));
                assemblyNames.Add("System.Data");

                references.Add(await GetFileStream($"managed/Newtonsoft.Json.dll"));
                assemblyNames.Add("Newtonsoft.Json");


                js.Invoke("displayAssemblies", new object[] { assemblyNames.ToArray() });
                

            }
        }


        public async Task<Type> CompileSourceCode(string code)
        {
            Console.WriteLine("Compile assembly");
            var assembly = await Compile(code);
            if (assembly != null)
            {
                CompileLog.Add("Searching for first exported type.");
                return assembly.GetExportedTypes().FirstOrDefault();
            }
            return null;

        }

        public async Task<Assembly> Compile(string code)
        {

            await Init();

            SyntaxTree syntaxTree = CSharpSyntaxTree.ParseText(code, new CSharpParseOptions(LanguageVersion.Latest));
            foreach (var diagnostic in syntaxTree.GetDiagnostics())
            {
                CompileLog.Add(diagnostic.ToString());
            }

            if (syntaxTree.GetDiagnostics().Any(i => i.Severity == DiagnosticSeverity.Error))
            {
                CompileLog.Add("Parse SyntaxTree Error!");
                return null;
            }

            CompileLog.Add("Parse SyntaxTree Success");

            //https://stackoverflow.com/questions/35711461/how-to-get-roslyn-to-compile-when-referenced-assemblies-have-references-to-both
            var op = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary);
            op = op.WithAssemblyIdentityComparer(DesktopAssemblyIdentityComparer.Default);
            CSharpCompilation compilation = CSharpCompilation.Create("WasmRoslyn.Demo", new[] { syntaxTree },
                references, op);

            using (MemoryStream stream = new MemoryStream())
            {
                EmitResult result = compilation.Emit(stream);

                foreach (var diagnostic in result.Diagnostics)
                {
                    CompileLog.Add(diagnostic.ToString());
                }

                if (!result.Success)
                {
                    CompileLog.Add("Compilation error");
                    return null;
                }

                CompileLog.Add("Compilation success!");
                Assembly assemby = AppDomain.CurrentDomain.Load(stream.ToArray());
                return assemby;
            }

        }


        public async Task<string> CompileAndRun(string code)
        {
            await Init();

            var assemby = await this.Compile(code);
            if (assemby != null)
            {
                var type = assemby.GetExportedTypes().FirstOrDefault();
                Console.WriteLine("Type: " + type.ToString());
                var methodInfo = type.GetMethod("Run");
                var instance = Activator.CreateInstance(type);
                return await (Task<string>)methodInfo.Invoke(instance, null);
            }

            return null;
        }

        private async Task<MetadataReference> GetFileStream(string name)
        {
            Console.WriteLine($"Fetching: {name}");

            MetadataReference mr = null;
            using (var stream = await _http.GetStreamAsync(name).ConfigureAwait(false))
            using (var outputStream = new MemoryStream())
            {
                await stream.CopyToAsync(outputStream).ConfigureAwait(false);
                // Make sure to set the position to 0
                outputStream.Position = 0;
                mr = MetadataReference.CreateFromStream(outputStream);
            }
            return mr;

        }

        
        private HttpClient http_external;
        private async Task<MetadataReference> GetFileStreamExternal(string url)
        {

            try
            {
                Console.WriteLine($"Fetching External: {url}");

                if (http_external==null)
                {
                    http_external = new HttpClient();
                }

                MetadataReference mr = null;
                using (var stream = await http_external.GetStreamAsync(url).ConfigureAwait(false))
                using (var outputStream = new MemoryStream())
                {
                    await stream.CopyToAsync(outputStream).ConfigureAwait(false);
                    // Make sure to set the position to 0
                    outputStream.Position = 0;
                    mr = MetadataReference.CreateFromStream(outputStream);
                }
                return mr;
            }catch(Exception ex)
            {
                Console.WriteLine(ex.Message + ex.StackTrace);
                return null;
            }

            
        }

    }
}