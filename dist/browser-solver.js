"use strict";
// One serial worker owns PyCBA's cache. Python sources are embedded at build time.
// Blob workers also work when the portable HTML is opened from file://.
function quickerBridgeWorker() {
  let ready;
  self.onmessage = async ({data: message}) => {
    try {
      if (message.action === 'boot') {
        ready = (async () => {
          const progress = value => self.postMessage({progress:value});
          progress('Python / WebAssembly');
          const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
          importScripts(indexURL + 'pyodide.js');
          const py = await loadPyodide({indexURL});
          progress('NumPy · SciPy · PyCBA');
          await py.loadPackage(['numpy', 'scipy', 'matplotlib', 'pydantic', 'micropip']);
          progress('Excel');
          await py.runPythonAsync("import micropip\nawait micropip.install(['et-xmlfile==2.0.0', 'openpyxl==3.1.5'])");
          const archive = Uint8Array.from(atob(message.source), c => c.charCodeAt(0));
          py.unpackArchive(archive, 'zip', {extractDir:'/home/pyodide'});
          progress('QuickerBridge');
          py.runPython('from quickerbridge.browser import dispatch');
          return py;
        })();
        await ready;
        self.postMessage({id:message.id, value:true});
        return;
      }
      const py = await ready;
      py.globals.set('qb_request', JSON.stringify(message));
      const value = py.runPython('dispatch(qb_request)');
      self.postMessage({id:message.id, value:JSON.parse(value)});
    } catch (error) {
      self.postMessage({id:message.id, error:String(error)});
    }
  };
}
class BrowserSolver {
  constructor(onProgress=()=>{}) {
    this.sequence=0;this.pending=new Map();this.queue=[];this.busy=false;
    const url=URL.createObjectURL(new Blob(['('+quickerBridgeWorker.toString()+')()'],{type:'text/javascript'}));
    this.worker=new Worker(url);URL.revokeObjectURL(url);
    this.worker.onmessage=({data})=>{
      if(data.progress){onProgress(data.progress);return;}
      const p=this.pending.get(data.id);if(!p)return;
      this.pending.delete(data.id);this.busy=false;
      if(data.error)p.reject(Error(data.error));else p.resolve(data.value);
      this.pump();
    };
    this.worker.onerror=event=>{
      const error=Error(event.message||'Worker failed');
      this.pending.forEach(p=>p.reject(error));this.pending.clear();
      this.queue.splice(0).forEach(p=>p.reject(error));this.busy=false;
    };
    this.ready=this.request('boot',{},window.QB_SOURCE_ZIP);
  }
  request(action,data={},source) {
    return new Promise((resolve,reject)=>{
      if(action==='analyse') {
        // Discard obsolete queued analyses, retaining the running job and cache.
        this.queue=this.queue.filter(p=>{if(p.message.action!=='analyse')return true;p.reject(Error('superseded'));return false});
      }
      this.queue.push({message:{id:++this.sequence,action,data,source},resolve,reject});
      this.pump();
    });
  }
  pump() {
    if(this.busy||!this.queue.length)return;
    const p=this.queue.shift();this.busy=true;this.pending.set(p.message.id,p);this.worker.postMessage(p.message);
  }
}
