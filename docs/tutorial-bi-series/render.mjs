import { chromium } from 'playwright';
const [desde,hasta,paso,salida]=[Number(process.argv[2]??0),Number(process.argv[3]??39.5),Number(process.argv[4]??1/30),process.argv[5]??'/tmp/claude-0/tuto/frames'];
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p = await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///tmp/claude-0/tuto/cap/tutorial.html'); await p.evaluate(()=>window.listo);
let n=0; for(let t=desde;t<=hasta+1e-9;t+=paso){ await p.evaluate(t=>window.pintar(t),t); await p.screenshot({path:`${salida}/${String(n++).padStart(5,'0')}.jpg`,type:'jpeg',quality:94}); }
console.log('frames',n); await b.close();
