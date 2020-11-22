var starterCode = `using System;
using System.Threading.Tasks;

namespace WasmRoslyn.Demo
{
    public class RunClass
    {
        public async Task<string> Run()
        {
            return "Working";
        }
    }
}`;
var myEditor;



class MyApp {
    constructor() {
        this.outputLog = document.getElementById("outputlog");
        this.compileLog = document.getElementById("compilelog");
        this.monContainer = document.getElementById("monContainer");
        this.height = 500;
        this.assemblies = [];
        this.newAssembly = '';
        this.compiling = false;
        this.mobile_device = false;
        this.setupSamples();
        rivets.bind(document.getElementsByTagName('body')[0], { data: this });
    }

    init() {
        this.detectMobileDevice();

        var feedback = document.getElementById("feedback-body");
        if (feedback) {
            feedback.parentElement.removeChild(feedback);
        }

        document.getElementById("main-body-top").style.visibility = null;
        document.getElementById("main-body-bottom").style.visibility = null;
        document.getElementById("monContainer").style.visibility = null;
        document.getElementById("githubDiv").style.visibility = null;
        BINDING.call_static_method("[WasmRoslyn]WasmRoslyn.Program:Main", [this, this.outputLog]);

        this.setupMonaco();
        this.setHeight();
    }

    
    detectMobileDevice(){
        if (window.innerWidth<600)
        {
            document.getElementById('monContainer').style['margin-right'] = '10px';
            document.getElementById('monContainer').style['margin-left'] = '10px';
            $('#main-body-monaco').removeClass('container')
            this.mobile_device = true;
        }
    }

    addNums(){
        var result = Module.mono_bind_static_method("[WasmRoslyn]WasmRoslyn.Program:AddNums")(5,3);
        console.log('result',result);
    }

    sayHello(){
        BINDING.call_static_method("[WasmRoslyn]WasmRoslyn.Program:SayHello", [this]);
    }

    sayHelloCallback(message){
        console.log('message',message);
    }

    btnRun() {
        this.compiling = true;
        var code = myEditor.getValue();
        BINDING.call_static_method("[WasmRoslyn]WasmRoslyn.Program:Run", [this, code]);
    }

    btnCompile() {
        this.compiling = true;
        var code = myEditor.getValue();
        // var func = Module.mono_bind_static_method("[WasmRoslyn]WasmRoslyn.Program:CompileOnly");
        // var result = await func( [this.compileLog, this.outputLog, code] );
        // console.log(result);
        BINDING.call_static_method("[WasmRoslyn]WasmRoslyn.Program:CompileOnly", [this, code]);
    }

    setCompileLog(log){
        console.log('compile log', log);
        if (log.includes('Compilation success'))
            log = "<span style='background-color:lightgreen'>&nbsp;Success&nbsp;</span><br>" + log;
        else
            log = "<span style='background-color:red'>&nbsp;Error&nbsp;</span><br>" + log;

        this.compileLog.innerHTML = log;
        this.compiling = false;

        //enable buttons
        $('#assemblyDiv').show();
        document.getElementById('btnRun').disabled = false;
        document.getElementById('btnShrink').disabled = false;
        document.getElementById('btnGrow').disabled = false;

    }

    setRunLog(log){
        console.log('run log', log);
        this.outputLog.innerHTML = log;
    }

    btnProcess() {
        BINDING.call_static_method("[WasmRoslyn]WasmRoslyn.Program:Process", [this]);
    }

    btnRemoveAssembly(event,source){
        App.assemblies.splice(source.index,1);
    }

    btnAddAssembly(){
        this.assemblies.unshift(this.newAssembly);
        this.newAssembly = '';
    }

    displayAssemblies(referencedAssemblies){
        console.log('Assemblies',referencedAssemblies);
        referencedAssemblies.sort();
        this.assemblies = [];
        referencedAssemblies.forEach(ass => {
            this.assemblies.push(ass);
        });
    }

    setHeight(){
        this.monContainer.style.height = this.height + 'px';
    }

    shrink(){
        this.height-=100;
        this.setHeight();
    }

    grow(){
        this.height+=100;
        this.setHeight();
    }

    setupMonaco() {
        var options = {
            value: [
                'function x() {',
                '\tconsole.log("Hello typescript");',
                '}'
            ].join('\n'),
            language: 'csharp',
            theme: "vs-dark",
            vertical: 'visible',
            horizontal: 'visible',
            automaticLayout: 'true'
        };

        if (this.mobile_device)
        {
            options.glyphMargin = false;
            options.contextmenu = false;
            // options.wordWrap = "on";
            // options.minimap = <monaco.editor.IEditorMinimapOptions>{
            //     enabled: false
            // }
        }

        require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
        require(['vs/editor/editor.main'], function () {
            myEditor = monaco.editor.create(document.getElementById('monContainer'), options);
            myEditor.setValue(starterCode);
            App.btnCompile();
        });
    }

    btnLoadCodeSample(){
        if (this.mobile_device)
            myEditor.setValue(this[$('#ddlLoadSampleMobile')[0].value]);
        else
            myEditor.setValue(this[$('#ddlLoadSample')[0].value]);
    }

    setupSamples(){

        this.sampleList = [
            {value:'sampleRegularExpressions',name:'Regular Expressions'},
            {value:'sampleLinq',name:'Linq'},
            {value:'sampleDataTable',name:'DataTable'},
            {value:'sampleNewtonsoft',name:'Newtonsoft.Json'},
            {value:'sampleHttpClient',name:'HttpClient'},
        ];

        this.sampleNewtonsoft = 
`using System;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace WasmRoslyn.Demo
{
    public class RunClass
    {
        public async Task<string> Run()
        {
            JObject job = new JObject();
            job["name"] = "Neil";
            job["age"] = 37;
            string output = JsonConvert.SerializeObject(job);
            return output;
        }
    }
}`;
        
        this.sampleRegularExpressions = 
`using System;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace WasmRoslyn.Demo
{
    public class RunClass
    {
        public async Task<string> Run()
        {
            return ReplaceIllegalCharactersForFilename("abc1@@23!");
            }
         public static string ReplaceIllegalCharactersForFilename(string input)
         {
             Regex rgx = new Regex("[^a-zA-Z0-9!@ -]");
             string updated_string = rgx.Replace(input, "");
             return updated_string;
         }
    }
}`;
        
        this.sampleLinq = 
`using System;
using System.Threading.Tasks;
using System.Linq;

namespace WasmRoslyn.Demo
{
    public class RunClass
    {
        public async Task<string> Run()
        {
             string[] fruits = { "apple", "banana", "mango", "orange", 
            "passionfruit", "grape" };
                        var query =
                            fruits.Select((fruit, index) =>
                                            new { index, str = fruit.Substring(0, index) });
                        string toReturn = "";
            foreach(var fruit in query)
            {
            toReturn += "Index: " + fruit.index + " Fruit: " + fruit.str + "<br>";
            }
            return toReturn;
        }
    }
}`;
        
        
        this.sampleDataTable = 
`using System;
using System.Threading.Tasks;
using System.Text;
using System.Data;

namespace WasmRoslyn.Demo
{
    public class RunClass
    {
        public async Task<string> Run()
        {
            DataTable table = new DataTable();
            table.Columns.Add("Dosage", typeof(int));
            table.Columns.Add("Drug", typeof(string));
            table.Columns.Add("Patient", typeof(string));
            table.Columns.Add("Date", typeof(DateTime));

            // Here we add five DataRows.
            table.Rows.Add(25, "Indocin", "David", DateTime.Now);
            table.Rows.Add(50, "Enebrel", "Sam", DateTime.Now);
            table.Rows.Add(10, "Hydralazine", "Christoff", DateTime.Now);
            table.Rows.Add(21, "Combivent", "Janet", DateTime.Now);
            table.Rows.Add(100, "Dilantin", "Melanie", DateTime.Now);

            var table_string = ConvertDataTableToString(table);
            return table_string;
        }

        public static string ConvertDataTableToString(DataTable dataTable)
        {
            var output = new StringBuilder();

            var columnsWidths = new int[dataTable.Columns.Count];

            // Get column widths
            foreach (DataRow row in dataTable.Rows)
            {
            for(int i = 0; i < dataTable.Columns.Count; i++)
            {
                var length = row[i].ToString().Length;
                if (columnsWidths[i] < length)
                    columnsWidths[i] = length;
            }     
            }

            // Get Column Titles
            for (int i = 0; i < dataTable.Columns.Count; i++)
            {
                var length = dataTable.Columns[i].ColumnName.Length;
                if (columnsWidths[i] < length)
                    columnsWidths[i] = length;
            }

            // Write Column titles
            for (int i = 0; i < dataTable.Columns.Count; i++)
            {
                var text = dataTable.Columns[i].ColumnName;
                output.Append("|" + PadCenter(text, columnsWidths[i] + 2));
            }
            output.Append("|<br>" + new string('=', output.Length) + "<br>");

            // Write Rows
            foreach (DataRow row in dataTable.Rows)
            {
                for (int i = 0; i < dataTable.Columns.Count; i++)
                {
                    var text = row[i].ToString();
                    output.Append("|" + PadCenter(text,columnsWidths[i] + 2));
                }
                output.Append("|<br>");
            }
            return output.ToString();
        }

        private static string PadCenter(string text, int maxLength)
        {
            int diff = maxLength - text.Length;
            return new string(' ', diff/2) + text + new string(' ', (int) (diff / 2.0 + 0.5));

        } 

    }
}`;
        
        this.sampleHttpClient = 
`using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace WasmRoslyn.Demo
{
    public class RunClass
    {
        public async Task<string> Run()
        {
            int length = 0;
            using (var client = new HttpClient())
            {
                try	
                {
                    HttpResponseMessage response = await client.GetAsync("https://www.neilb.net/site");
                    string responseBody = await response.Content.ReadAsStringAsync();

                    length = responseBody.Length;
                }  
                catch(HttpRequestException e)
                {
                    Console.WriteLine("Message :{0} ",e.Message);
                }
            }

            return "Working: " + length;
        }
    }
}`;
    }

    

    
}

var App = new MyApp();