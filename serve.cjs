const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.md':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
  let filename;try{filename=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  const target=path.resolve(root,'.'+(filename==='/'?'/index.html':filename));
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(target,(err,data)=>{if(err){res.writeHead(404);return res.end('Arquivo não encontrado');}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});server.listen(4173,'127.0.0.1',()=>console.log('Vigia Rural pronto em http://127.0.0.1:4173'));
