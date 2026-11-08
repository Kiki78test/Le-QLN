const { chromium } = require('playwright'); const path=require('path'), fs=require('fs');
(async()=>{
  const b = await chromium.launch();
  for (const n of [1,2,3]) {
    const dir = `/tmp/pubrec${n}`; fs.rmSync(dir,{recursive:true,force:true});
    const ctx = await b.newContext({ viewport:{width:640,height:360}, recordVideo:{dir, size:{width:640,height:360}} });
    const p = await ctx.newPage(); await p.goto('file://'+path.resolve(`spot${n}.html`));
    await p.waitForTimeout(7400); await ctx.close();
    const f = fs.readdirSync(dir)[0]; fs.renameSync(`${dir}/${f}`, `/tmp/spot${n}.webm`);
  } await b.close();
})();
