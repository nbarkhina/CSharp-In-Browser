using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using WebAssembly;

namespace WasmRoslyn
{
    public class Program
    {
        static CompileService service;

        public static void Main(JSObject app, JSObject outputLog)
        {

            CheckHttpClient();
            service = new CompileService(httpClient, app);

            return;
        }

        public static int AddNums(int a, int b)
        {
            return a+b;
        }

        public static void SayHello(JSObject app)
        {
            app.Invoke("sayHelloCallback", new object[] { "Hello Maddy" });
        }

        public static void Process(JSObject App)
        {
            List<string> assemblies = new List<string>();
            var assembliesText = App.GetObjectProperty("assemblies") as WebAssembly.Core.Array;
            for(int i = 0;i<assembliesText.Length;i++)
            {
                assemblies.Add(assembliesText[i].ToString());
            }

            Task.Run(() => service.SetReferences(assemblies));
        }

        public static void Run(JSObject app, string code)
        {
            Task.Run(() => CompileAndRun(app, code));
        }

        public static void CompileOnly(JSObject app, string code)
        {
            Task.Run(() => Compile(app, code));
        }

        public static async Task Compile(JSObject app, string code)
        {

            try
            {
                service.CompileLog = new List<string>();
                var type = await service.CompileSourceCode(code);
                if (type != null)
                {
                    service.CompileLog.Add($"Exported type returned from assembly: {type}");
                }
                else
                {
                    service.CompileLog.Add("No exported types were found.");
                }
            }
            catch (Exception e)
            {
                service.CompileLog.Add(e.Message);
                service.CompileLog.Add(e.StackTrace);
                throw;
            }
            finally
            {
                app.Invoke("setCompileLog", new object[] { string.Join("\r\n",service.CompileLog) });
            }

        }


        public static async Task CompileAndRun(JSObject app, string code)
        {

            try
            {
                service.CompileLog = new List<string>();
                var result = await service.CompileAndRun(code);
                app.Invoke("setRunLog", new object[] { string.Join("\r\n",result) });

            }
            catch (Exception e)
            {
                service.CompileLog.Add(e.Message);
                service.CompileLog.Add(e.StackTrace);
                throw;
            }
            finally
            {
                app.Invoke("setCompileLog", new object[] { string.Join("\r\n",service.CompileLog) });
            }
        }

        static HttpClient httpClient;
        static string BaseApiUrl = string.Empty;
        static string PathName = string.Empty;
        static void CheckHttpClient()
        {
            if (httpClient == null)
            {
                Console.WriteLine("Create  HttpClient");
                using (var window = (JSObject)WebAssembly.Runtime.GetGlobalObject("window"))
                using (var location = (JSObject)window.GetObjectProperty("location"))
                {
                    BaseApiUrl = (string)location.GetObjectProperty("origin");
                    PathName = (string)location.GetObjectProperty("pathname");
                    Console.WriteLine($"Base: {BaseApiUrl} ReferencePath: {PathName}");
                }
                httpClient = new HttpClient() { BaseAddress = new Uri(new Uri(BaseApiUrl), PathName) };
            }

        }

        private static async Task<String> GetSourceCode(string name)
        {
            Console.WriteLine($"Fetching: {name}");
            CheckHttpClient();

            var source = await httpClient.GetStringAsync(name).ConfigureAwait(false);
            return source;

        }


    }
}