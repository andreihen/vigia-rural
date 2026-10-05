const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="src/styles.css">',()=>'<style>'+fs.readFileSync(path.join(root,'src/styles.css'),'utf8')+'</style>');
html=html.replace('<script src="src/model.js"></script>',()=>'<script>'+fs.readFileSync(path.join(root,'src/model.js'),'utf8')+'</script>');
html=html.replace('<script src="src/app.js"></script>',()=>'<script>'+fs.readFileSync(path.join(root,'src/app.js'),'utf8')+'</script>');
fs.mkdirSync(path.join(root,'entrega'),{recursive:true});
fs.writeFileSync(path.join(root,'entrega','VIGIA RURAL.html'),html,'utf8');
console.log('Protótipo portátil gerado: entrega/VIGIA RURAL.html');
