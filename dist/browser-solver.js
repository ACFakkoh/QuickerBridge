"use strict";
// One serial worker owns PyCBA's cache. Python sources are embedded at build time.
// Blob workers also work when the portable HTML is opened from file://.
//
// Robust start-up (v0.6.1): corporate networks sometimes drop or stall one of
// the runtime downloads (Pyodide, NumPy, SciPy...). Every boot attempt runs in
// a fresh worker, a watchdog terminates an attempt that stops making progress,
// failed attempts are retried automatically, and the final failure reports the
// stage, the library and the host so the user sees a clear message.
function quickerBridgeWorker() {
  let ready;
  self.onmessage = async ({data: message}) => {
    try {
      if (message.action === 'boot') {
        ready = (async () => {
          const progress = (value, detail='') => self.postMessage({progress:value, detail});
          const fail = (stage, detail) => {const e = Error(detail); e.qbStage = stage; throw e;};
          const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
          progress('Python / WebAssembly', 'pyodide.js');
          try { importScripts(indexURL + 'pyodide.js'); }
          catch (e) { fail('Python / WebAssembly', 'pyodide.js · cdn.jsdelivr.net · ' + e.message); }
          let py;
          try { py = await loadPyodide({indexURL}); }
          catch (e) { fail('Python / WebAssembly', 'pyodide.asm.wasm · cdn.jsdelivr.net · ' + e.message); }
          progress('NumPy · SciPy · PyCBA');
          // loadPackage reports a failed download through errorCallback and may
          // still resolve: collect those messages and verify the imports.
          const errors = [];
          await py.loadPackage(['numpy', 'scipy', 'matplotlib', 'pydantic', 'micropip'], {
            messageCallback: m => progress('NumPy · SciPy · PyCBA', String(m).slice(0, 120)),
            errorCallback: m => errors.push(String(m)),
          }).catch(e => errors.push(String(e && e.message || e)));
          try { py.runPython('import numpy, scipy, matplotlib, pydantic'); }
          catch (e) {
            const missing = (String(e).match(/No module named '([^']+)'/) || [])[1];
            fail('NumPy · SciPy · PyCBA', (missing ? missing + ' · ' : '') + (errors[0] || String(e).split('\n').pop()));
          }
          // Excel export is optional: the analysis works without openpyxl.
          progress('Excel');
          let excel = true;
          try {
            await py.runPythonAsync("import micropip\nawait micropip.install(['et-xmlfile==2.0.0', 'openpyxl==3.1.5'])");
          } catch (e) {
            excel = false;
            progress('Excel', 'unavailable: ' + String(e).split('\n').pop().slice(0, 120));
          }
          const archive = Uint8Array.from(atob(message.source), c => c.charCodeAt(0));
          py.unpackArchive(archive, 'zip', {extractDir:'/home/pyodide'});
          progress('QuickerBridge');
          py.runPython('from quickerbridge.browser import dispatch');
          py.qbExcel = excel;
          return py;
        })();
        const py = await ready;
        self.postMessage({id:message.id, value:{excel:py.qbExcel}});
        return;
      }
      const py = await ready;
      py.globals.set('qb_request', JSON.stringify(message));
      const value = py.runPython('dispatch(qb_request)');
      self.postMessage({id:message.id, value:JSON.parse(value)});
    } catch (error) {
      self.postMessage({id:message.id, error:String(error && error.message || error), stage:error && error.qbStage});
    }
  };
}
class BrowserSolver {
  constructor(onProgress=()=>{}) {
    this.onProgress=onProgress;this.sequence=0;this.pending=new Map();this.queue=[];this.busy=false;
    const params=new URLSearchParams(location.search);
    // No progress message for this long means a stalled download (seconds).
    this.stallSeconds=Number(params.get('bootTimeout'))||90;
    this.maxAttempts=Number(params.get('bootAttempts'))||4;
    this.ready=this.boot();
  }
  spawn() {
    const url=URL.createObjectURL(new Blob(['('+quickerBridgeWorker.toString()+')()'],{type:'text/javascript'}));
    const worker=new Worker(url);URL.revokeObjectURL(url);return worker;
  }
  bootOnce(attempt) {
    return new Promise((resolve,reject)=>{
      const worker=this.spawn();let stage='Python / WebAssembly',detail='',timer;
      const finish=(fn,value)=>{clearTimeout(timer);fn(value);};
      const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>{worker.terminate();
        const e=Error(`timeout ${this.stallSeconds} s`);e.stage=stage;e.detail=detail||'cdn.jsdelivr.net';e.stalled=true;finish(reject,e);},this.stallSeconds*1000);};
      worker.onmessage=({data})=>{
        if(data.progress){stage=data.progress;detail=data.detail||detail;arm();this.onProgress(data.progress,{attempt,of:this.maxAttempts,detail:data.detail});return;}
        if(data.error){worker.terminate();const e=Error(data.error);e.stage=data.stage||stage;e.detail=data.error;finish(reject,e);return;}
        finish(resolve,{worker,info:data.value});
      };
      worker.onerror=event=>{event.preventDefault?.();worker.terminate();const e=Error(event.message||'Worker failed');e.stage=stage;e.detail=e.message;finish(reject,e);};
      arm();
      worker.postMessage({id:0,action:'boot',data:{},source:window.QB_SOURCE_ZIP});
    });
  }
  async boot() {
    let last;
    for(let attempt=1;attempt<=this.maxAttempts;attempt++){
      if(attempt>1){this.onProgress('retry',{attempt,of:this.maxAttempts,error:last});await new Promise(r=>setTimeout(r,800*attempt));}
      try{
        const {worker,info}=await this.bootOnce(attempt);
        this.attach(worker);this.info=info||{};return this.info;
      }catch(e){last=e;console.warn(`QuickerBridge boot attempt ${attempt}/${this.maxAttempts} failed`,e.stage,e.detail);}
    }
    const error=Error('boot.failed');error.stage=last?.stage;error.detail=last?.detail;error.stalled=last?.stalled;error.attempts=this.maxAttempts;
    throw error;
  }
  attach(worker) {
    this.worker=worker;
    worker.onmessage=({data})=>{
      if(data.progress)return;
      const p=this.pending.get(data.id);if(!p)return;
      this.pending.delete(data.id);this.busy=false;
      if(data.error)p.reject(Error(data.error));else p.resolve(data.value);
      this.pump();
    };
    worker.onerror=event=>{
      const error=Error(event.message||'Worker failed');
      this.pending.forEach(p=>p.reject(error));this.pending.clear();
      this.queue.splice(0).forEach(p=>p.reject(error));this.busy=false;
    };
    this.pump();
  }
  request(action,data={}) {
    return new Promise((resolve,reject)=>{
      if(action==='analyse') {
        // Discard obsolete queued analyses, retaining the running job and cache.
        this.queue=this.queue.filter(p=>{if(p.message.action!=='analyse')return true;p.reject(Error('superseded'));return false});
      }
      this.queue.push({message:{id:++this.sequence,action,data},resolve,reject});
      this.pump();
    });
  }
  pump() {
    if(!this.worker||this.busy||!this.queue.length)return;
    const p=this.queue.shift();this.busy=true;this.pending.set(p.message.id,p);this.worker.postMessage(p.message);
  }
}
